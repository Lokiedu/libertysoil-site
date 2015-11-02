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
import { Link, IndexLink } from 'react-router';

import Header from '../../components/header';
import Footer from '../../components/footer';
import Messages from '../../components/messages';

export default class BaseSuggestionsPage extends React.Component {
  static displayName = 'BaseSuggestionsPage';

  render () {
    const {
      children,
      is_logged_in,
      current_user,
      messages
    } = this.props;

    return (
      <div>
        <Header is_logged_in={is_logged_in} current_user={current_user}/>

        <div className="page__container">
          <div className="page__body">

            <div className="page__body_content">
              <div className="page__content page__content-spacing">
                <Messages messages={this.props.messages}/>
                <div className="paper layout">
                  <div className="layout__grid_item layout__grid_item-fill layout__grid_item-wide">
                      {children}
                  </div>
                </div>
                {/*
                <div className="void">
                  <span className="button button-green action" onClick={onNext}>{next_caption}</span>
                </div>
                */}
              </div>
            </div>
          </div>
        </div>

        <Footer/>
      </div>
    );
  }
}
