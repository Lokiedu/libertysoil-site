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
import React from 'react';
import { pick } from 'lodash';
import { Map as ImmutableMap, List } from 'immutable';

import { API_HOST } from '../../config';
import ApiClient from '../../api/client';
import { ActionsTrigger } from '../../triggers';
import { addError } from '../../actions/messages';

import Navigation from '../navigation';
import NavigationItem from '../navigation-item';
import Bookmark from './bookmark';

const AddBookmarkIcon = ImmutableMap({ icon: 'add' });

export default class Bookmarks extends React.Component {
  static defaultProps = {
    bookmarks: List()
  };

  handleSettingsClick = (bookmarkId) => {};

  handleModalClose = () => {};

  handleDelete = async (bookmarkId) => {
    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    try {
      await triggers.deleteBookmark(bookmarkId);
      this.handleModalClose();
    } catch (e) {
      this.props.dispatch(addError(e.message));
    }
  };

  handleSave = async (bookmarkInfo) => {
    const data = bookmarkInfo;
    if (!data.more) {
      data.more = {};
    }

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    let success = false;
    try {
      await triggers.manageBookmark(data);
      success = true;
      this.handleModalClose();
    } catch (e) {
      this.props.dispatch(addError(e.message));
    }

    return success;
  };

  render() {
    return (
      <div>
        <Navigation>
          {this.props.bookmarks.toList().sortBy(b => b.get('ord')).map(item => (
            <Bookmark
              {...pick(item.toObject(), ['url', 'title', 'id'])}
              description={item.getIn(['more', 'description'])}
              icon={item.getIn(['more', 'icon'])}
              key={item.get('id')}
              onSettingsClick={this.handleSettingsClick}
            />
          ))}
          <NavigationItem
            className="action"
            icon={AddBookmarkIcon}
            theme="2.0"
            onClick={this.handleSettingsClick}
          >
            Create bookmark
          </NavigationItem>
        </Navigation>
      </div>
    );
  }
}
