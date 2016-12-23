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
import { connect } from 'react-redux';
import { pick } from 'lodash';
import { List } from 'immutable';

import { API_HOST } from '../../config';
import ApiClient from '../../api/client';
import { ActionsTrigger } from '../../triggers';
import { addError } from '../../actions/messages';
import { setRemote, toggleRemote } from '../../actions/remote';
import createSelector from '../../selectors/createSelector';

import Button from '../button';
import Navigation from '../navigation';
import Bookmark from './bookmark';
import BookmarkSettingsModal from './settings-modal';
import BookmarkSettingsForm from './settings-form';

export class Bookmarks extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    isModalVisible: PropTypes.bool
  };

  static defaultProps = {
    bookmarks: List(),
    dispatch: () => {}
  };

  handleSettingsClick = (bookmarkId) => {
    this.props.dispatch(setRemote({
      isVisible: true,
      component: BookmarkSettingsModal,
      args: {
        children: (
          <BookmarkSettingsForm
            bookmark={this.props.bookmarks.get(bookmarkId)}
            onSave={this.handleSave}
          />
        ),
        onClose: this.handleModalClose
      }
    }));
  };

  handleModalClose = () => {
    if (this.props.isModalVisible) {
      this.props.dispatch(toggleRemote(false));
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
    } catch (e) {
      this.props.dispatch(addError(e.message));
    }

    return success;
  };

  render() {
    return (
      <div>
        <Navigation>
          {this.props.bookmarks.toList().map(item => (
            <Bookmark
              {...pick(item.toObject(), ['url', 'title', 'id'])}
              description={item.getIn(['more', 'description'])}
              icon={item.getIn(['more', 'icon'])}
              key={item.get('id')}
              onSettingsClick={this.handleSettingsClick}
            />
          ))}
          <Button
            title="New bookmark"
            onClick={this.handleSettingsClick}
          />
        </Navigation>
      </div>
    );
  }
}

const inputSelector = createSelector(
  state => state.getIn(['remote', 'isVisible']),
  isModalVisible => ({ isModalVisible })
);

const outputSelector = dispatch => ({
  dispatch
});

export default connect(inputSelector, outputSelector)(Bookmarks);
