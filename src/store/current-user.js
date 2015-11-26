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
  tags: i.List([])
});

export default function reducer(state=initialState, action) {
  switch (action.type) {
    case a.SET_CURRENT_USER:
    {
      const oldUid = state.get('id');

      if (oldUid === action.user.id) {
        break;
      }

      state = state.set('id', action.user.id);
      state = state.set('tags', i.List([]));
      break;
    }

    case a.SET_USER_TAGS: {
      let tags = _.take(action.tags, 10);

      if (tags)
        state = state.set('tags', i.fromJS(tags));
      else
        state = state.set('tags', i.List([]));

      break;
    }
  }

  return state;
}
