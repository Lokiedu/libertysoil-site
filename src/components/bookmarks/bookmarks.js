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
import { List } from 'immutable';

import { API_HOST } from '../../config';
import ApiClient from '../../api/client';
import { ActionsTrigger } from '../../triggers';

import Navigation from '../navigation';
import Bookmark from './bookmark';
import BookmarkSettingsModal from './settings-modal';
import BookmarkSettingsForm from './settings-form';

export default class Bookmarks extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func
  };

  static defaultProps = {
    bookmarks: List(),
    dispatch: () => {}
  };

  constructor(...args) {
    super(...args);

    this.state = {
      activeBookmark: null,
      displayModal: false,
      processing: false
    };
  }

  handleSettingsClick = (bookmarkIndex) => {
    this.setState({
      activeBookmark: bookmarkIndex,
      displayModal: true
    });
  };

  handleModalClose = () => {
    this.setState({ displayModal: false });
  };

  handleSave = async (bookmarkInfo) => {
    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    let success = false;
    this.setState({ processing: true });
    try {
      await triggers.manageBookmark(bookmarkInfo);
      success = true;
    } catch (e) {
      this.props.dispatch(e.message);
    }

    this.setState({ processing: false });
    return success;
  };

  render() {
    const bookmarks = this.props.bookmarks;
    return (
      <div>
        <Navigation>
          {bookmarks.map((item, i) => (
            <Bookmark
              {...item.toObject()}
              index={i}
              key={item.get('url')}
              onSettingsClick={this.handleSettingsClick}
            />
          ))}
          {/* new bookmark button */}
        </Navigation>
        <BookmarkSettingsModal
          hidden={!this.state.displayModal}
          onClose={this.handleModalClose}
        >
          <BookmarkSettingsForm
            bookmark={bookmarks.get(this.state.activeBookmark)}
            processing={this.state.processing}
            onSave={this.handleSave}
          />
        </BookmarkSettingsModal>
      </div>
    );
  }
}
