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

import * as a from '../actions';

const initialState = i.Map({
  progress: i.Map({})
});

export default function reducer(state=initialState, action) {

  switch (action.type) {
  case a.UI__SET_PROGRESS:
    {
      state = state.setIn(['progress', action.progress], action.value);
      break;
    }
  case a.SUBMIT_RESET_PASSWORD:
    {
      state = state.set('submitResetPassword', true);
      break;
    }
  case a.SUBMIT_NEW_PASSWORD:
    {
      state = state.set('submitNewPassword', true);
      break;
    }
  case a.REGISTRATION_SUCCESS:
    {
      state = state.set('registrationSuccess', true);
      break;
    }
  case a.SHOW_REGISTER_FORM:
    {
      state = state.set('registrationSuccess', false);
      break;
    }
  }

  return state;
}
