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
import { isNull } from 'lodash';

import Bookmark from './bookmark';
import Navigation from '../navigation';
import BookmarkSettingsModal from './settings-modal';

export default class Bookmarks extends React.Component {
  static propTypes = {
    bookmarks: PropTypes.arrayOf(PropTypes.shape({}))
  };

  constructor(props) {
    super(props);

    this.state = {
      activeSettings: null
    };
  }

  handleSettingsClick = (i) => {
    this.setState({ activeSettings: i });
  };

  handleModalClose = () => {
    this.setState({ activeSettings: null });
  };

  renderModal = () => {
    const i = this.state.activeSettings;
    if (isNull(i)) {
      return false;
    }

    const current = this.props.bookmarks[i];
    return (
      <BookmarkSettingsModal
        {...current}
        onClose={this.handleModalClose}
      />
    );
  };

  render() {
    const { bookmarks } = this.props;

    if (!bookmarks) {
      return <script />;
    }

    return (
      <div>
        <Navigation>
          {bookmarks.map((item, i) => (
            <Bookmark
              {...item}
              i={i}
              key={i}
              onSettingsClick={this.handleSettingsClick}
            />
          ))}
        </Navigation>
        {this.renderModal()}
      </div>
    );
  }
}
