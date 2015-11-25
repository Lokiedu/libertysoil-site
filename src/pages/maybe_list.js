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
import Induction from './induction'
import {API_HOST} from '../config';
import ApiClient from '../api/client'
import { getStore } from '../store';
import { setPostsToRiver } from '../actions';
import { updateUserInfo } from '../triggers';
import { defaultSelector } from '../selectors';


class MaybeList extends React.Component {
  static async fetchData(params, props, client) {
    if (props.get('current_user_id') === null) {
      return;
    }

    try {
      let posts = await client.subscriptions();
      getStore().dispatch(setPostsToRiver(posts));
    } catch (e) {
      console.log(e.stack)
    }
  }

  doneInduction = (event) => {
    updateUserInfo({
      more: {
        first_login: false
      }
    });
  };

  render() {
    if (this.props.is_logged_in && this.props.current_user.more.first_login) {
      return <Induction on_complete={this.doneInduction}/>
    } else if (this.props.is_logged_in) {
      return <List/>
    } else {
      return <Welcome/>
    }
  }
}

export default connect(defaultSelector)(MaybeList);
