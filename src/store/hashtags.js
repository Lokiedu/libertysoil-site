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
import i from 'immutable';
import _ from 'lodash';

import { hashtags as h } from '../actions';

const initialState = i.Map({});

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case h.ADD_HASHTAG: {
      const hashtag = action.payload.hashtag;
      state = state.set(hashtag.name, i.fromJS(hashtag));

      break;
    }

    case h.SET_HASHTAGS: {
      const hashtags = _.keyBy(action.payload.hashtags, 'name');
      state = state.merge(i.fromJS(hashtags));

      break;
    }
  }

  return state;
}
