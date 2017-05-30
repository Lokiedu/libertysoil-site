/*
 This file is a part of libertysoil.org website
 Copyright (C) 2016  Loki Education (Social Enterprise)

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
import React, { PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import debounce from 'debounce-promise';
import classNames from 'classnames';
import { Map as ImmutableMap } from 'immutable';
import { form as inform, from } from 'react-inform';

import ApiClient from '../../api/client';
import { API_HOST } from '../../config';
import MESSAGE_TYPES from '../../consts/messageTypeConstants';

import Button from '../button';
import Message from '../message';

class Field extends React.Component {
  static defaultProps = {
    onFocus: () => {}
  };

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  render() {
    const { field, name } = this.props;

    const rowClassName = classNames('form__row tools_page__item tools_page__item--close', {
      'form__row--in_progress': this.props.inProgress
    });

    return (
      <div>
        <div className={rowClassName}>
          <label className="form__label form__label--short" htmlFor={`bookmark_${name}`}>
            {name}
          </label>
          <input
            className="input input-block input-narrow input-transparent"
            id={`bookmark_${name}`}
            onFocus={this.props.onFocus}
            {...field}
          />
        </div>
        {field.error &&
          <Message message={field.error} type={MESSAGE_TYPES.ERROR} />
        }
      </div>
    );
  }
}

class BookmarkSettingsForm extends React.Component {
  static propTypes = {
    fields: PropTypes.shape({}),
    form: PropTypes.shape({}),
    onSave: PropTypes.func
  };

  static defaultProps = {
    bookmark: ImmutableMap({ more: ImmutableMap() }),
    onSave: () => {}
  };

  constructor(...args) {
    super(...args);

    this.handleUrlInput = debounce(this.handleUrlInput, 200);
    this.state = {
      processing: {},
      meta: null
    };
  }

  componentWillMount() {
    const bookmark = this.props.bookmark;

    this.props.form.onValues({
      description: bookmark.getIn(['more', 'descripion']),
      title: bookmark.get('title'),
      url: bookmark.get('url')
    });

    if (bookmark.get('id')) {
      this.setState({ meta: {} });
      this.updateTitle = false;
    } else {
      this.updateTitle = true;
    }
  }

  componentDidMount() {
    findDOMNode(this.urlField).addEventListener('input', this.handleUrlInput);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.bookmark !== this.props.bookmark) {
      const bookmark = nextProps.bookmark;
      this.props.form.onValues({
        description: bookmark.getIn(['more', 'description']),
        title: bookmark.get('title'),
        url: bookmark.get('url')
      });

      if (nextProps.bookmark.get('id')) {
        this.updateTitle = false;
        this.setState({ meta: {} });
      } else {
        this.updateTitle = true;
        this.setState({ meta: null });
      }
    }
  }

  componentWillUnmount() {
    findDOMNode(this.urlField).removeEventListener('input', this.handleUrlInput);
  }

  handleUrlInput = async (event) => {
    this.toggleProcessing('fetch');
    const url = event.target.value;

    const meta =
      validateNonEmpty(url) &&
      validateUrlHost(url) &&
      await validateUrlMatch(url) || null;

    this.setState({ meta });
    if (meta && this.updateTitle) {
      const { form } = this.props;

      form.onValues({
        ...form.values(),
        title: meta.title
      });
    }
    this.toggleProcessing('fetch');
  };

  handleTitleFocus = () => {
    if (this.updateTitle) {
      this.updateTitle = false;
    }
  };

  toggleProcessing = action => {
    this.setState({
      processing: {
        ...this.state.processing,
        [action]: !this.state.processing[action]
      }
    });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    this.toggleProcessing('submit');

    const { form } = this.props;
    form.forceValidate();
    if (!form.isValid()) {
      return;
    }

    const newValues = form.values();
    await this.props.onSave({
      ...this.props.bookmark.toJS(),
      more: { description: newValues.description },
      title: newValues.title,
      url: newValues.url
    });

    this.toggleProcessing('submit');
  };

  handleDelete = async () => {
    this.toggleProcessing('delete');
    const { bookmark, onDelete } = this.props;
    await onDelete(bookmark.get('id'));
    this.toggleProcessing('delete');
  };

  handleReset = () => {
    this.updateTitle = true;
    this.props.form.onValues({});
    this.setState({ meta: null });
  };

  render() {
    const { fields } = this.props;

    const bookmarkId = this.props.bookmark.get('id');
    const fieldsetClassName = classNames({
      'hidden': !this.state.meta,
      'form--inactive': this.state.processing.fetch && this.updateTitle
    });

    return (
      <form onSubmit={this.handleSubmit}>
        <Field
          field={fields.url}
          name="Url"
          ref={c => this.urlField = c}
          inProgress={this.state.processing.fetch}
        />
        <div className={fieldsetClassName}>
          <Field field={fields.title} name="Title" onFocus={this.handleTitleFocus} />
          <Field field={fields.description} name="Description" />
          <div className="tools_page__item tools_page__item--close">
            <div className="layout layout__grid layout-align_right">
              {bookmarkId &&
                <Button
                  className="button button-red button-wide"
                  title="Delete"
                  waiting={this.state.processing.delete}
                  onClick={this.handleDelete}
                />
              }
              <Button
                className="button button-light_blue button-wide"
                title="Reset"
                onClick={this.handleReset}
              />
              <Button
                className="button button-green button-wide"
                disabled={!this.props.form.isValid()}
                title="Save"
                type="submit"
                waiting={this.state.processing.submit}
              />
            </div>
          </div>
        </div>
      </form>
    );
  }
}

const validateNonEmpty = v => v && v.trim();

const validateUrlHost = url => {
  const u = url.trim();
  if (u[0] !== '/') {
    if (
        u.lastIndexOf(API_HOST, 0) !== 0 &&
        u.lastIndexOf(API_HOST.replace(/^https?:\/\//, ''), 0) !== 0
    ) {
      return false;
    }
  }

  return true;
};

const validateUrlMatch = debounce(async (url) => {
  const client = new ApiClient(API_HOST);

  let meta;
  try {
    meta = (await client.validateUrl(url.trim(), true)).meta;
  } catch (e) {
    meta = null;
  }
  return meta;
}, 500);

const WrappedBookmarkSettingsForm = inform(from({
  icon: {},
  description: {},
  title: {
    'Enter title': validateNonEmpty
  },
  url: {
    'Enter url': validateNonEmpty,
    'Invalid url (only internal links are allowed)': validateUrlHost,
    'There\'s no such page in LibertySoil': validateUrlMatch
  }
}))(BookmarkSettingsForm);

export default WrappedBookmarkSettingsForm;
