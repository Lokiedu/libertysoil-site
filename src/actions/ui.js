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
export const UI__SET_PROGRESS = 'UI__SET_PROGRESS';
export const UI__TOGGLE_MENU = 'UI__TOGGLE_MENU';

export const SHOW_REGISTER_FORM = 'SHOW_REGISTER_FORM';

export function setProgress(progress, value) {
  return {
    type: UI__SET_PROGRESS,
    progress,
    value
  };
}

export function toggleMenu(isVisible) {
  return {
    type: UI__TOGGLE_MENU,
    isVisible
  };
}

export function showRegisterForm() {
  return {
    type: SHOW_REGISTER_FORM
  };
}
