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
import { getTypeError, createSimplifiedRequirableTypeChecker } from './utils';

function checkKeys(keyCheckType, propValue, propFullName, componentName, location) {
  const fields = Object.keys(propValue);

  try {
    for (let i = 0; i < fields.length; ++i) {
      const fieldName = fields[i];
      let fieldFullName = `${propFullName}['${fieldName}']`;
      if (typeof fieldName === 'number') {
        fieldFullName = `${propFullName}[${fieldName}]`;
      }

      const error = keyCheckType(
        fields,
        i,
        componentName,
        location,
        fieldFullName
      );

      if (error instanceof Error) {
        const finalError = error;
        finalError.message = `[Invalid key] ${error.message}`;

        throw finalError;
      }
    }
  } catch (e) {
    return e;
  }

  return null;
}

function checkValues(valueCheckType, propValue, propFullName, componentName, location) {
  const fields = Object.keys(propValue);

  try {
    fields.forEach(fieldName => {
      let fieldFullName = `${propFullName}['${fieldName}']`;
      if (typeof fieldName === 'number') {
        fieldFullName = `${propFullName}[${fieldName}]`;
      }

      const error = valueCheckType(
        propValue,
        fieldName,
        componentName,
        location,
        fieldFullName
      );

      if (error instanceof Error) {
        throw error;
      }
    });
  } catch (e) {
    return e;
  }

  return null;
}

export const mapOfKeys = (keyCheckType) => (
  createSimplifiedRequirableTypeChecker(
    (propValue, propFullName, componentName, location) => {
      const expectedType = 'object';
      if (typeof propValue !== expectedType) {
        return getTypeError(propValue, expectedType, propFullName, componentName, location);
      }

      return checkKeys(
        keyCheckType,
        propValue,
        propFullName,
        componentName,
        location
      );
    }
  )
);

export const mapOfValues = (valueCheckType) => (
  createSimplifiedRequirableTypeChecker(
    (propValue, propFullName, componentName, location) => {
      const expectedType = 'object';
      if (typeof propValue !== expectedType) {
        return getTypeError(propValue, expectedType, propFullName, componentName, location);
      }

      return checkValues(
        valueCheckType,
        propValue,
        propFullName,
        componentName,
        location
      );
    }
  )
);

export const mapOf = (keyCheckType, valueCheckType) => (
  createSimplifiedRequirableTypeChecker(
    (propValue, propFullName, componentName, location) => {
      const expectedType = 'object';
      if (typeof propValue !== expectedType) {
        return getTypeError(propValue, expectedType, propFullName, componentName, location);
      }

      const error = checkKeys(
        keyCheckType,
        propValue,
        propFullName,
        componentName,
        location
      );

      if (error instanceof Error) {
        return error;
      }

      return checkValues(
        valueCheckType,
        propValue,
        propFullName,
        componentName,
        location
      );
    }
  )
);
