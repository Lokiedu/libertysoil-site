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
import { fromJS, List, Map, Set } from 'immutable';

import * as a from '../actions';
import { getId, getName, getUrlName } from '../utils/tags';

function add(state, key, x) {
  return state.updateIn([key], xs => xs.add(x));
}

function remove(state, key, x) {
  return state.updateIn([key], xs => xs.remove(x));
}

export const initialState = Map({
  id: null,
  hashtags: Set(),
  geotags: Set(),
  schools: Set(),
  followed_hashtags: Set(),
  followed_schools: Set(),
  followed_geotags: Set(),
  liked_hashtags: Set(),
  liked_schools: Set(),
  liked_geotags: Set(),
  suggested_users: List(),
  post_subscriptions: List(),
  recent_tags: Map({
    hashtags: List(),
    schools: List(),
    geotags: List()
  })
});

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case a.users.SET_CURRENT_USER: {
      const oldUid = state.get('id');
      const newUid = action.payload.user ? action.payload.user.id : null;

      // UID is changed. means logout or re-login. Do the cleanup
      if (oldUid !== newUid) {
        state = initialState.set('id', newUid);
      }

      if (newUid) {
        state = state.withMutations(state => {
          const { user } = action.payload;

          state.set('followed_geotags', Set(user.followed_geotags.map(getUrlName)));
          state.set('followed_hashtags', Set(user.followed_hashtags.map(getName)));
          state.set('followed_schools', Set(user.followed_schools.map(getUrlName)));
          state.set('liked_geotags', Set(user.liked_geotags.map(getUrlName)));
          state.set('liked_hashtags', Set(user.liked_hashtags.map(getName)));
          state.set('liked_schools', Set(user.liked_schools.map(getUrlName)));

          if (typeof user.post_subscriptions !== 'undefined') {
            state.set('post_subscriptions', List(user.post_subscriptions.map(getId)));
          }
        });
      }

      break;
    }

    case a.tags.SET_USER_TAGS: {
      const geotags = action.payload.geotags.slice(0, 5).map(getUrlName);
      const hashtags = action.payload.hashtags.slice(0, 5).map(getName);
      const schools = action.payload.schools.slice(0, 5).map(getUrlName);

      if (hashtags) {
        state = state.set('hashtags', List(hashtags));
      } else {
        state = state.set('hashtags', List());
      }

      if (schools) {
        state = state.set('schools', List(schools));
      } else {
        state = state.set('schools', List());
      }

      if (geotags) {
        state = state.set('geotags', List(geotags));
      } else {
        state = state.set('geotags', List());
      }

      break;
    }

    case a.tags.SET_USER_RECENT_TAGS: {
      state = state.set('recent_tags', fromJS(action.payload.recent_tags));

      break;
    }

    case a.hashtags.ADD_USER_FOLLOWED_HASHTAG: {
      state = add(state, 'followed_hashtags', action.payload.hashtag.name);

      break;
    }

    case a.hashtags.REMOVE_USER_FOLLOWED_HASHTAG: {
      state = remove(state, 'followed_hashtags', action.payload.hashtag.name);

      break;
    }

    case a.schools.ADD_USER_FOLLOWED_SCHOOL: {
      state = add(state, 'followed_schools', action.payload.school.url_name);

      break;
    }

    case a.schools.REMOVE_USER_FOLLOWED_SCHOOL: {
      state = remove(state, 'followed_schools', action.payload.school.url_name);

      break;
    }

    case a.users.SET_PERSONALIZED_SUGGESTED_USERS: {
      state = state.set('suggested_users', fromJS(action.payload.suggested_users));

      break;
    }

    case a.geotags.ADD_USER_FOLLOWED_GEOTAG: {
      state = add(state, 'followed_geotags', action.payload.geotag.url_name);

      break;
    }

    case a.geotags.REMOVE_USER_FOLLOWED_GEOTAG: {
      state = remove(state, 'followed_geotags', action.payload.geotag.url_name);

      break;
    }

    case a.hashtags.ADD_LIKED_HASHTAG: {
      state = add(state, 'liked_hashtags', action.payload.hashtag.name);

      break;
    }

    case a.hashtags.REMOVE_LIKED_HASHTAG: {
      state = remove(state, 'liked_hashtags', action.payload.hashtag.name);

      break;
    }

    case a.schools.ADD_LIKED_SCHOOL: {
      state = add(state, 'liked_schools', action.payload.school.url_name);

      break;
    }

    case a.schools.REMOVE_LIKED_SCHOOL: {
      state = remove(state, 'liked_schools', action.payload.school.url_name);

      break;
    }

    case a.geotags.ADD_LIKED_GEOTAG: {
      state = add(state, 'liked_geotags', action.payload.geotag.url_name);

      break;
    }

    case a.geotags.REMOVE_LIKED_GEOTAG: {
      state = remove(state, 'liked_geotags', action.payload.geotag.url_name);

      break;
    }

    case a.users.SUBSCRIBE_TO_POST: {
      state = state.updateIn(['post_subscriptions'], val => {
        return val.push(action.payload.post_id);
      });

      break;
    }

    case a.users.UNSUBSCRIBE_FROM_POST: {
      state = state.updateIn(['post_subscriptions'], val => {
        return val.delete(val.indexOf(action.payload.post_id));
      });

      break;
    }
  }

  return state;
}
