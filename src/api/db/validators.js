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
let User = {
  // 6) FN  supports unicode/UTF-8 characters, with a maximum of 60 characters.
  // 7) LN supports unicode/UTF-8 characters, with a maximum of 60 characters.
  // 8) E supports User_Registation_01_mail_validation_01"

  registration: {
    username: [
      'maxLength:31',
      { rule: function(val) {
        if (!val.match(/^(?!.*\.{2})[a-z0-9\-\_\'\.]+$/)) {
          throw new Error("Username can contain letters a-z, numbers 0-9, dashes (-), underscores (_), apostrophes (\'), and periods (.)");
        }
      }
      }],
    password: [
      {
        rule: function(val) {
          if (!val.match(/^[\x20-\x7E]{8,}$/)) {
            throw new Error("Password is min. 8 characters. Password can only have ascii characters.");
          }
        }
      }
    ]
  }
};

export { User };
