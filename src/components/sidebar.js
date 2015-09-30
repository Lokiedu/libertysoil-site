/*
 This file is a part of libertysoil.org website
 Copyright (C) 2015  Loki Education (Social Enterprise)

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

import CurrentUser from './current-user';

export default class Sidebar extends React.Component {
  render() {
    if (!this.props.current_user) {
      return <script/>
    }

    return (
      <div className="page__sidebar">
        <div className="layout__row page__sidebar_user">
          <CurrentUser user={this.props.current_user} />
        </div>

        <div className="layout__row">
          <h3 className="head head-sub">Popular tags</h3>
        </div>

        <div className="layout__row">
          <div className="tags">
            <span className="tag">Psychology</span>
            <span className="tag">Gaming</span>
          </div>
        </div>
      </div>
    )
  }
}
