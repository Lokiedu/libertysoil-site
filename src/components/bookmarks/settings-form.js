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
import { Map as ImmutableMap } from 'immutable';
import { form as inform, from } from 'react-inform';
import debounce from 'debounce-promise';

import ApiClient from '../../api/client';
import { API_HOST } from '../../config';
import MESSAGE_TYPES from '../../consts/messageTypeConstants';

import Button from '../button';
import Message from '../message';

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

    this.state = {
      processing: false
    };
  }

  componentWillMount() {
    const bookmark = this.props.bookmark;
    this.props.form.onValues({
      description: bookmark.getIn(['more', 'descripion']),
      title: bookmark.get('title'),
      url: bookmark.get('url')
    });
  }

  toggleProcessing = () => {
    this.setState({
      processing: !this.state.processing
    });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    this.toggleProcessing();

    const nativeForm = event.target;
    const { form } = this.props;
    form.forceValidate();
    if (!form.isValid()) {
      return;
    }

    const newValues = form.values();

    await this.props.onSave({
      id: nativeForm.id.value,
      more: { description: newValues.description },
      title: newValues.title,
      url: newValues.url
    });

    this.toggleProcessing();
  };

  render() {
    const { fields } = this.props;

    return (
      <form onSubmit={this.handleSubmit}>
        <input id="bookmark_id" name="id" type="hidden" value={this.props.bookmark.get('id')} />
        <div className="form__row tools_page__item tools_page__item--close">
          <label className="form__label form__label--short" htmlFor="bookmark_title">
            Title
          </label>
          <input className="input input-block input-narrow input-transparent" id="bookmark_title" {...fields.title} />
        </div>
        {fields.title.error &&
          <Message message={fields.title.error} type={MESSAGE_TYPES.ERROR} />
        }
        <div className="form__row tools_page__item tools_page__item--close">
          <label className="form__label form__label--short" htmlFor="bookmark_url">
            Url
          </label>
          <input className="input input-block input-narrow input-transparent" id="bookmark_url" {...fields.url} />
        </div>
        {fields.url.error &&
          <Message message={fields.url.error} type={MESSAGE_TYPES.ERROR} />
        }
        <div className="form__row tools_page__item tools_page__item--close">
          <label className="form__label form__label--short" htmlFor="bookmark_description">
            Description
          </label>
          <input
            className="input input-block input-narrow input-transparent"
            id="bookmark_description"
            {...fields.description}
          />
        </div>
        {fields.description.error &&
          <Message message={fields.description.error} type={MESSAGE_TYPES.ERROR} />
        }
        <div className="tools_page__item tools_page__item--close">
          <div className="layout layout__grid layout-align_right">
            <Button
              className="button button-green button-wide"
              disabled={!this.props.form.isValid()}
              title="Save"
              type="submit"
              waiting={this.state.processing}
            />
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

const validateUrlMatch = debounce(async url => {
  const client = new ApiClient(API_HOST);
  try {
    await client.checkUrl(url.trim());
  } catch (e) {
    return false;
  }
  return true;
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
