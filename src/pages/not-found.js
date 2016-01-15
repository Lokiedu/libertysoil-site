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
import { connect } from 'react-redux';
import { defaultSelector } from '../selectors';
import Header from '../components/header';


class NotFound extends React.Component {
  render() {
    return (
      <div>
        <Header is_logged_in={this.props.is_logged_in} current_user={this.props.current_user} />

        <div className="page__container">
          <div className="page__body">
            <section className="card">
              <div className="card__content">
                <p><strong>Page Not Found</strong></p>
              </div>
            </section>
          </div>
        </div>
      </div>
    )
  }
}

export default connect(defaultSelector)(NotFound);
