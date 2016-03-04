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
export function defaultSelector(state) {
  let data = state.toJS();

  data.is_logged_in = !!data.current_user.id;

  if (data.is_logged_in) {
    let current_user_id = data.current_user.id;

    data.current_user_tags = data.current_user.hashtags;
    data.current_user.user = data.users[current_user_id];
    data.current_user.likes = data.likes[current_user_id] || [];
    data.current_user.favourites = data.favourites[current_user_id] || [];

    data.i_am_following = data.following[current_user_id];
  } else {
    data.current_user = null;
  }

  return data;
}
