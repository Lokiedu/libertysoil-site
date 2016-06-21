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
export function createRequirableTypeChecker(validate) {
  function checkType(isRequired, props, propName, componentName, location, propFullName) {
    let fullName = propName;
    if (propFullName) {
      fullName = propFullName;
    }

    if (props[propName] == null) {
      if (isRequired) {
        return new Error(
          `Required ${location} \`${fullName}\` was not specified in \`${componentName}\``
        );
      }

      return null;
    }

    return validate(props, propName, componentName, location, fullName);
  }

  const chainedCheckType = checkType.bind(null, false);
  chainedCheckType.isRequired = checkType.bind(null, true);

  return chainedCheckType;
}
