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
import i from 'immutable';
import _ from 'lodash';

import * as a from '../actions';


const initialState = i.Map({});

export default function reducer(state=initialState, action) {
  switch (action.type) {
    case a.ADD_POST:
    case a.ADD_POST_TO_RIVER:
    {
      let postCopy = _.cloneDeep(action.post);
      delete postCopy.user;

      state = state.set(postCopy.id, i.fromJS(postCopy));

      break;
    }

    case a.SET_POSTS_TO_RIVER:
    case a.SET_POSTS_TO_LIKES_RIVER:
    case a.SET_POSTS_TO_FAVOURITES_RIVER:
    case a.SET_USER_POSTS:
    case a.SET_TAG_POSTS:
    case a.SET_CITY_POSTS:
    case a.SET_COUNTRY_POSTS:
    case a.SET_SCHOOL_POSTS:
    {
      let postsWithoutUsers = _.indexBy(action.posts.map(post => {
        let postCopy = _.cloneDeep(post);
        delete postCopy.user;
        return postCopy;
      }), 'id');

      state = state.merge(i.fromJS(postsWithoutUsers));

      break;
    }

    case a.REMOVE_POST:
    {
      state = state.remove(action.id);
      break;
    }

    case a.SET_LIKES: {
      // FIXME: move to separate reducer?
      if (action.post_id) {
        state = state.setIn([action.post_id, 'likers'], action.likers);
      }
      break;
    }

    case a.SET_FAVOURITES: {
      // FIXME: move to separate reducer?
      if (action.post_id) {
        state = state.setIn([action.post_id, 'favourers'], action.favourers);
      }
      break;
    }
  }

  return state;
}
