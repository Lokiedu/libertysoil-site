/*eslint-env node, mocha */
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
/* eslint-env node, mocha */
import i from 'immutable';

import { expect } from '../../../test-helpers/expect-unit';
import { theReducer } from '../../../src/store';
import { SET_CURRENT_USER } from '../../../src/actions/users';


describe('combined reducer "theReducer"', function () {
  it('is should not throw any error when action SET_CURRENT_USER and action.user equals null', function () {
    theReducer(i.Map({}), { type: SET_CURRENT_USER, payload: { user: null } });
  });

  it('should not rewrite user followers existing data', () => {
    const initialState = i.Map({
      users: i.Map({
        1: i.Map({
          id: 1,
          username: 'foo',
          more: 'bar'
        })
      })
    });

    const state = theReducer(
      initialState,
      {
        type: SET_CURRENT_USER,
        payload: {
          user: {
            following: [
              {
                id: 1,
                username: 'new-foo'
              }
            ],
            followed_geotags: [],
            followed_hashtags: [],
            followed_schools: [],
            liked_geotags: [],
            liked_hashtags: [],
            liked_schools: []
          }
        }
      }
    );

    expect(state.getIn(['users', '1', 'more']), 'to equal', 'bar');
    expect(state.getIn(['users', '1', 'username']), 'to equal', 'new-foo');
  });
});
