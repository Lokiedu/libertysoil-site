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


const initialState = i.Map({
  id: null,
  hashtags: i.List([]),
  geotags: i.List([]),
  schools: i.List([]),
  followed_hashtags: i.Map({}),
  followed_schools: i.Map({}),
  followed_geotags: i.Map({}),
  liked_hashtags: i.Map({}),
  liked_schools: i.Map({}),
  liked_geotags: i.Map({}),
  suggested_users: i.List([]),
  recent_tags: i.Map({
    hashtags: i.List([]),
    schools: i.List([]),
    geotags: i.List([])
  })
});

export default function reducer(state=initialState, action) {
  switch (action.type) {
    case a.SET_CURRENT_USER: {
      const oldUid = state.get('id');
      const newUid = action.user ? action.user.id : null;


      // UID is changed. means logout or re-login. Do the cleanup
      if (oldUid !== newUid) {
        state = state.withMutations((state) => {
          state
            .set('id', newUid)
            .set('hashtags', i.List([]))
            .set('geotags', i.List([]))
            .set('schools', i.List([]))
            .set('followed_hashtags', i.Map({}))
            .set('followed_schools', i.Map({}))
            .set('followed_geotags', i.Map({}))
            .set('liked_hashtags', i.Map({}))
            .set('liked_schools', i.Map({}))
            .set('liked_geotags', i.Map({}))
            .set('suggested_users', i.List([]))
            .set('recent_tags', i.fromJS({ hashtags: [], schools: [], geotags: [] }));
        });
      }

      if (newUid) {
        let followedTags = _.keyBy(action.user.followed_hashtags, 'name');
        let followedSchools = _.keyBy(action.user.followed_schools, 'url_name');
        let followedGeotags = _.keyBy(action.user.followed_geotags, 'url_name');
        let likedHashtags = _.keyBy(action.user.liked_hashtags, 'name');
        let likedSchools = _.keyBy(action.user.liked_schools, 'url_name');
        let likedGeotags = _.keyBy(action.user.liked_geotags, 'url_name');

        state = state.withMutations(state => {
          state.set('followed_hashtags', i.fromJS(followedTags));
          state.set('followed_geotags', i.fromJS(followedGeotags));
          state.set('followed_schools', i.fromJS(followedSchools));
          state.set('liked_hashtags', i.fromJS(likedHashtags));
          state.set('liked_schools', i.fromJS(likedSchools));
          state.set('liked_geotags', i.fromJS(likedGeotags));
        });
      }

      break;
    }

    case a.SET_USER_TAGS: {
      const hashtags = _.take(action.hashtags, 5);
      const schools = _.take(action.schools, 5);
      const geotags = _.take(action.geotags, 5);

      if (hashtags) {
        state = state.set('hashtags', i.fromJS(hashtags));
      } else {
        state = state.set('hashtags', i.List([]));
      }

      if (schools) {
        state = state.set('schools', i.fromJS(schools));
      } else {
        state = state.set('schools', i.List([]));
      }

      if (geotags) {
        state = state.set('geotags', i.fromJS(geotags));
      } else {
        state = state.set('geotags', i.List([]));
      }

      break;
    }

    case a.SET_USER_RECENT_TAGS: {
      state = state.set('recent_tags', i.fromJS(action.recent_tags));

      break;
    }

    case a.ADD_USER_FOLLOWED_TAG: {
      state = state.setIn(['followed_hashtags', action.hashtag.name], i.fromJS(action.hashtag));

      break;
    }

    case a.REMOVE_USER_FOLLOWED_TAG: {
      state = state.deleteIn(['followed_hashtags', action.hashtag.name]);

      break;
    }

    case a.ADD_USER_FOLLOWED_SCHOOL: {
      state = state.setIn(['followed_schools', action.school.url_name], i.fromJS(action.school));

      break;
    }

    case a.REMOVE_USER_FOLLOWED_SCHOOL: {
      state = state.deleteIn(['followed_schools', action.school.url_name]);

      break;
    }

    case a.SET_PERSONALIZED_SUGGESTED_USERS: {
      state = state.set('suggested_users', i.fromJS(action.suggested_users));

      break;
    }

    case a.ADD_USER_FOLLOWED_GEOTAG: {
      state = state.setIn(['followed_geotags', action.geotag.url_name], i.fromJS(action.geotag));

      break;
    }

    case a.REMOVE_USER_FOLLOWED_GEOTAG: {
      state = state.deleteIn(['followed_geotags', action.geotag.url_name]);

      break;
    }

    case a.ADD_LIKED_HASHTAG: {
      state = state.setIn(['liked_hashtags', action.hashtag.name], i.fromJS(action.hashtag));

      break;
    }

    case a.REMOVE_LIKED_HASHTAG: {
      state = state.deleteIn(['liked_hashtags', action.hashtag.name]);

      break;
    }

    case a.ADD_LIKED_SCHOOL: {
      state = state.setIn(['liked_schools', action.school.url_name], i.fromJS(action.school));

      break;
    }

    case a.REMOVE_LIKED_SCHOOL: {
      state = state.deleteIn(['liked_schools', action.school.url_name]);

      break;
    }

    case a.ADD_LIKED_GEOTAG: {
      state = state.setIn(['liked_geotags', action.geotag.url_name], i.fromJS(action.geotag));

      break;
    }

    case a.REMOVE_LIKED_GEOTAG: {
      state = state.deleteIn(['liked_geotags', action.geotag.url_name]);

      break;
    }
  }

  return state;
}
