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
export function Command(title = 'Command', run = () => {}, { ...params } = {}) {
  // use 'title' instead of 'name' in order to avoid conflict with vanilla js Function.name
  this.title = title;
  this.run = run;

  if (params.status === undefined) {
    this.status = true;
  } else {
    this.status = params.status;
  }

  if (params.args === undefined) {
    this.args = [];
  } else {
    this.args = params.args;
  }
}
