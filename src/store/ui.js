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
import { LOCATION_CHANGE } from 'react-router-redux';

import * as a from '../actions';

const initialState = i.fromJS({
  mobileMenuIsVisible: false,
  progress: {},
  comments: {
    new: {}
  }
});

function reducer(state = initialState, action) {
  switch (action.type) {
    case LOCATION_CHANGE:
      {
        if (state.get('mobileMenuIsVisible')) {
          state = state.set('mobileMenuIsVisible', false);
        }

        break;
      }
    case a.ui.UI__TOGGLE_MENU:
      {
        let isVisible = !state.get('mobileMenuIsVisible');

        if (action.isVisible != undefined) {
          isVisible = action.isVisible;
        }

        state = state.set('mobileMenuIsVisible', isVisible);

        break;
      }
    case a.ui.UI__SET_PROGRESS:
      {
        state = state.setIn(['progress', action.progress], action.value);
        break;
      }
    case a.users.SUBMIT_RESET_PASSWORD:
      {
        state = state.set('submitResetPassword', true);
        break;
      }
    case a.users.SUBMIT_NEW_PASSWORD:
      {
        state = state.set('submitNewPassword', true);
        break;
      }
    case a.users.REGISTRATION_SUCCESS:
      {
        state = state.set('registrationSuccess', true);
        break;
      }
    case a.ui.SHOW_REGISTER_FORM:
      {
        state = state.set('registrationSuccess', false);
        break;
      }
    case a.comments.SAVE_COMMENT__START:
      {
        state = state.setIn(['comments', action.commentId, 'error'], '');
        state = state.setIn(['comments', action.commentId, 'isSaveInProgress'], true);
        break;
      }
    case a.comments.DELETE_COMMENT__START:
      {
        state = state.setIn(['comments', action.commentId, 'error'], '');
        state = state.setIn(['comments', action.commentId, 'isDeleteInProgress'], true);
        break;
      }
    case a.comments.CREATE_COMMENT__START:
      {
        state = state.setIn(['comments', 'new', 'error'], '');
        state = state.setIn(['comments', 'new', 'isCreateInProgress'], true);
        break;
      }
    case a.comments.SAVE_COMMENT__SUCCESS:
      {
        state = state.setIn(['comments', action.commentId, 'isSaveInProgress'], false);
        break;
      }
    case a.comments.CREATE_COMMENT__SUCCESS:
      {
        state = state.setIn(['comments', 'new', 'isCreateInProgress'], false);
        break;
      }
    case a.comments.DELETE_COMMENT__SUCCESS:
      {
        state = state.setIn(['comments', action.commentId, 'isDeleteInProgress'], false);
        break;
      }
    case a.comments.SAVE_COMMENT__FAILURE:
      {
        state = state.setIn(['comments', action.commentId, 'error'], action.message);
        state = state.setIn(['comments', action.commentId, 'isSaveInProgress'], false);
        break;
      }
    case a.comments.CREATE_COMMENT__FAILURE:
      {
        state = state.setIn(['comments', 'new', 'error'], action.message);
        state = state.setIn(['comments', 'new', 'isCreateInProgress'], false);
        break;
      }
    case a.comments.DELETE_COMMENT__FAILURE:
      {
        state = state.setIn(['comments', action.commentId, 'error'], action.message);
        state = state.setIn(['comments', action.commentId, 'isDeleteInProgress'], false);
        break;
      }
  }

  return state;
}

export {
  initialState,
  reducer
};
