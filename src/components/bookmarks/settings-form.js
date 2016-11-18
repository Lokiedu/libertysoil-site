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
import { browserHistory } from 'react-router';
import matchRoutes from 'react-router/lib/matchRoutes';
import { isNil } from 'lodash';

import { getRoutes } from '../../routing';

import Button from '../button';
import Message from '../message';

class BookmarkSettingsForm extends React.Component {
  static propTypes = {
    fields: PropTypes.shape({}),
    form: PropTypes.shape({}),
    onSave: PropTypes.func
  };

  static defaultProps = {
    bookmark: ImmutableMap(),
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

    const { form } = this.props;
    form.forceValidate();
    if (!form.isValid()) {
      return;
    }

    const newValues = form.values();

    this.props.onSave(newValues);
    this.toggleProcessing();
  };

  render() {
    const { fields } = this.props;

    return (
      <form onSubmit={this.handleSubmit}>
        <div className="form__row tools_page__item tools_page__item--close">
          <label className="form__label form__label--short" htmlFor="bookmark_title">
            Title
          </label>
          <input className="input input-block input-narrow input-transparent" id="bookmark_title" {...fields.title} />
          {fields.title.error &&
            <Message message={fields.title.error} />
          }
        </div>
        <div className="form__row tools_page__item tools_page__item--close">
          <label className="form__label form__label--short" htmlFor="bookmark_url">
            Url
          </label>
          <input className="input input-block input-narrow input-transparent" id="bookmark_url" {...fields.url} />
          {fields.url.error &&
            <Message message={fields.url.error} />
          }
        </div>
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

const validateUrl = async (url) => {
  if (!url) {
    return false;
  }

  const createLocation = browserHistory.createLocation;
  const routes = getRoutes(() => {}, () => {});

  const ret = (result) => {
    console.log(result);
  }
  
  await matchRoutes(routes, createLocation(url), (error, match) => {
    ret(!isNil(match), match);
  });
}

const WrappedBookmarkSettingsForm = inform(from({
  icon: {},
  title: {},
  url: {
    'Invalid url': validateUrl
  }
}))(BookmarkSettingsForm);

export default WrappedBookmarkSettingsForm;
