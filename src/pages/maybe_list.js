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

import List from './list'
import Welcome from './welcome'
import {API_HOST} from '../config';
import ApiClient from '../api/client'
import {getStore, setPostsToRiver} from '../store';
import { defaultSelector } from '../selectors';
import { addPreviewsToPosts } from '../lib/embedly';


class MaybeList extends React.Component {
  componentDidMount() {
    MaybeList.fetchData(this.props);
  }

  static async fetchData(props) {
    if (!props.is_logged_in) {
      return;
    }

    let client = new ApiClient(API_HOST);

    try {
      let posts = await client.subscriptions();
      getStore().dispatch(setPostsToRiver(
        await addPreviewsToPosts(posts)
      ));
    } catch (e) {
      console.log(e.stack)
    }
  }

  render() {
    if (this.props.is_logged_in) {
      return <List/>
    } else {
      return <Welcome/>
    }
  }
}

export default connect(defaultSelector)(MaybeList);
