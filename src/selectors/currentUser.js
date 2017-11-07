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

import createSelector from './createSelector';


// Selects the current user and all dependencies.
function selectCurrentUser(state) {
  const currentUser = state.get('current_user');

  return currentUser.withMutations(function (currentUser) {
    const id = currentUser.get('id') || 'null';
    currentUser.set('user', state.getIn(['users', id]));
    currentUser.set('likes', state.getIn(['likes', id]) || i.List());
    currentUser.set('favourites', state.getIn(['favourites', id]) || i.List());
  });
}

export default createSelector(
  selectCurrentUser,
  (current_user) => ({
    is_logged_in: !!current_user.get('id'),
    current_user
  })
);
