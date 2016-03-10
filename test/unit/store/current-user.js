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
import i from 'immutable';

import userReducer from '../../../src/store/current-user';
import { setCurrentUser } from '../../../src/actions';

import { expect } from '../../../test-helpers/expect-unit';


describe('current_user reducer', () => {
  it('should handle logout properly', () => {
    const dirtyState = i.Map({
      id: '00000000-dead-beef-0000-000000000000',
      hashtags: i.List(['hello', 'world']),
      followed_hashtags: i.Map({'chicken': 'good'}),
      followed_schools: i.Map({'we': 'teach'}),
      suggested_users: i.List(['mike', 'bob'])
    });

    const resultState = userReducer(dirtyState, setCurrentUser(null)).toJS();
    expect(resultState.id, 'to be', null);
    expect(resultState.hashtags, 'to have length', 0);
    expect(resultState.suggested_users, 'to have length', 0);
    expect(Object.keys(resultState.followed_hashtags), 'to have length', 0);
    expect(Object.keys(resultState.followed_schools), 'to have length', 0);
  });
});
