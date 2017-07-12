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

import { DEFAULT_LOCALE } from '../consts/localization';
import * as a from '../actions';

const initialState = i.fromJS({
  mobileMenuIsVisible: false,
  progress: {},
  comments: {
    new: {}
  },
  locale: DEFAULT_LOCALE
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

        if (action.payload.isVisible != undefined) {
          isVisible = action.payload.isVisible;
        }

        state = state.set('mobileMenuIsVisible', isVisible);

        break;
      }
    case a.ui.UI__SET_PROGRESS:
      {
        state = state.setIn(['progress', action.payload.progress], action.payload.value);
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
        state = state.setIn(['comments', action.payload.commentId, 'error'], '');
        state = state.setIn(['comments', action.payload.commentId, 'isSaveInProgress'], true);
        break;
      }
    case a.comments.DELETE_COMMENT__START:
      {
        state = state.setIn(['comments', action.payload.commentId, 'error'], '');
        state = state.setIn(['comments', action.payload.commentId, 'isDeleteInProgress'], true);
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
        state = state.setIn(['comments', action.payload.commentId, 'isSaveInProgress'], false);
        break;
      }
    case a.comments.CREATE_COMMENT__SUCCESS:
      {
        state = state.setIn(['comments', 'new', 'isCreateInProgress'], false);
        break;
      }
    case a.comments.DELETE_COMMENT__SUCCESS:
      {
        state = state.setIn(['comments', action.payload.commentId, 'isDeleteInProgress'], false);
        break;
      }
    case a.comments.SAVE_COMMENT__FAILURE:
      {
        state = state.setIn(['comments', action.payload.commentId, 'error'], action.payload.message);
        state = state.setIn(['comments', action.payload.commentId, 'isSaveInProgress'], false);
        break;
      }
    case a.comments.CREATE_COMMENT__FAILURE:
      {
        state = state.setIn(['comments', 'new', 'error'], action.payload.message);
        state = state.setIn(['comments', 'new', 'isCreateInProgress'], false);
        break;
      }
    case a.comments.DELETE_COMMENT__FAILURE:
      {
        state = state.setIn(['comments', action.payload.commentId, 'error'], action.payload.message);
        state = state.setIn(['comments', action.payload.commentId, 'isDeleteInProgress'], false);
        break;
      }
    case a.ui.SET_LOCALE:
      {
        state = state.set('locale', action.payload.code);
        break;
      }
    case a.users.SET_CURRENT_USER:
      {
        let localeCode;

        const { user } = action.payload;
        if (user && user.more && user.more.lang) {
          localeCode = user.more.lang;
        } else {
          localeCode = DEFAULT_LOCALE;
        }

        state = state.set('locale', localeCode);
        break;
      }
  }

  return state;
}

export {
  initialState,
  reducer
};
