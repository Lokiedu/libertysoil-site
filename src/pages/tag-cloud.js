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
import React, { Component } from 'react';
import { connect } from 'react-redux';

import Header from '../components/header';
import Footer from '../components/footer';
import Sidebar from '../components/sidebar';
import TagCloud from '../components/tag-cloud';
import { ActionsTrigger } from '../triggers';
import { defaultSelector } from '../selectors';


let SidebarTagCloud = ({ tags, title, ...props }) => {
  if (tags.length == 0) {
    return <script/>;
  }

  return (
    <div {...props}>
      <div className="layout__row">
        <h4 className="head head-sub">{title}</h4>
      </div>
      <div className="layout__row">
        <TagCloud tags={tags}/>
      </div>
    </div>
  );
};

class TagCloudPage extends Component {
  static displayName = 'TagCloudPage'

  static async fetchData(params, store, client) {
    const triggers = new ActionsTrigger(client, this.props.dispatch);
    await triggers.loadTagCloud();
  }

  render() {
    const {
      is_logged_in,
      current_user
    } = this.props;

    return (
      <div>
        <Header is_logged_in={is_logged_in} current_user={current_user} />

        <div className="page__container">
          <div className="page__body">
            <Sidebar current_user={current_user} />
            <div className="page__body_content">
              <div className="page__content page__content-spacing">
                <div className="layout__row">
                  <div className="head">Tag cloud</div>
                </div>
                <div className="layout__row">
                  <TagCloud tags={this.props.tag_cloud}/>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer/>
      </div>
    )
  }
}

export default connect(defaultSelector)(TagCloudPage);
