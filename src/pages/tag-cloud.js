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

import ApiClient from '../api/client'
import { API_HOST } from '../config';
import { getStore, setTagPosts } from '../store';

import Header from '../components/header';
import Footer from '../components/footer';
import Sidebar from '../components/sidebar'
import {  } from '../triggers';
import { defaultSelector } from '../selectors';


class TagCloudPage extends Component {
  static displayName = 'TagCloudPage'

  componentDidMount() {
    TagCloudPage.fetchData(this.props, new ApiClient(API_HOST));
  }

  static async fetchData(props, client) {
    try {
      let tags = client.tagPosts(props.params.tag);

      //getStore().dispatch(setTagPosts(props.params.tag, await tags));
    } catch (e) {
      console.log(e);
      console.log(e.stack);
    }
  }

  render() {
    const {
      is_logged_in,
      current_user
    } = this.props;
    const tags = [

    ];

    return (
      <div>
        <Header is_logged_in={is_logged_in} current_user={current_user} />

        <div className="page__container">
          <div className="page__body">
            <Sidebar current_user={current_user} />
            <div className="page__body_content">
              <div className="page__content page__content-spacing">
                <div className="layout__row">
                  <div className="head">Tags cloud</div>
                </div>
                <div className="layout__row">
                  <div className="tags">
                    <span className="tag">Psychology</span>
                    <span className="tag">Gaming</span>
                    <span className="tag">Psychology</span>
                    <span className="tag">Gaming</span>
                    <span className="tag">Psychology</span>
                    <span className="tag">Gaming</span>
                    <span className="tag">Psychology</span>
                    <span className="tag">Gaming</span>
                    <span className="tag">Psychology</span>
                    <span className="tag">Gaming</span>
                    <span className="tag">Psychology</span>
                    <span className="tag">Gaming</span>
                    <span className="tag">Psychology</span>
                    <span className="tag">Gaming</span>
                    <span className="tag">Gaming</span>
                    <span className="tag">Psychology</span>
                    <span className="tag">Gaming</span>
                    <span className="tag">Psychology</span>
                    <span className="tag">Gaming</span>
                    <span className="tag">Psychology</span>
                    <span className="tag">Gaming</span>
                    <span className="tag">Psychology</span>
                    <span className="tag">Gaming</span>
                  </div>
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
