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

import {
  getTypeError,
  createRequirableTypeChecker,
  createSimplifiedRequirableTypeChecker,
  checkValues,
  checkKeys
} from './utils';

export const mapOfKeys = (keyCheckType) => (
  createSimplifiedRequirableTypeChecker(
    (propValue, propFullName, componentName, location, ...rest) => {
      const expectedType = 'object';
      if (typeof propValue !== expectedType) {
        return getTypeError(propValue, expectedType, propFullName, componentName, location);
      }

      return checkKeys(
        keyCheckType,
        propValue,
        propFullName,
        componentName,
        location,
        ...rest
      );
    }
  )
);

export const mapOfValues = (valueCheckType) => (
  createSimplifiedRequirableTypeChecker(
    (propValue, propFullName, componentName, location, ...rest) => {
      const expectedType = 'object';
      if (typeof propValue !== expectedType) {
        return getTypeError(propValue, expectedType, propFullName, componentName, location);
      }

      return checkValues(
        valueCheckType,
        propValue,
        propFullName,
        componentName,
        location,
        ...rest
      );
    }
  )
);

export const mapOf = (keyCheckType, valueCheckType) => (
  createSimplifiedRequirableTypeChecker(
    (propValue, propFullName, componentName, location, ...rest) => {
      const expectedType = 'object';
      if (typeof propValue !== expectedType) {
        return getTypeError(propValue, expectedType, propFullName, componentName, location);
      }

      const error = checkKeys(
        keyCheckType,
        propValue,
        propFullName,
        componentName,
        location,
        ...rest
      );

      if (error instanceof Error) {
        return error;
      }

      return checkValues(
        valueCheckType,
        propValue,
        propFullName,
        componentName,
        location,
        ...rest
      );
    }
  )
);

export const Immutable = (checkType) => (
  createRequirableTypeChecker(
    (props, propName, componentName, location, propFullName, ...rest) => {
      const propValue = props[propName];

      // all Immutable date types are subclasses of Immutable.Iterable
      if (i.Iterable.isIterable(propValue)) {
        const preparedPropValue = propValue.toJS();
        const preraredProps = { ...props, [propName]: preparedPropValue };

        // vanilla instance of PropTypes' checkType()
        // or result of createRequirableTypeChecker()
        if (!checkType.isSimplified) {
          return checkType(
            preraredProps,
            propName,
            componentName,
            location,
            propFullName,
            ...rest
          );
        }

        // result of createSimplifiedRequirableTypeChecker()
        let fullName = propName;
        if (propFullName) {
          fullName = propFullName;
        }

        return checkType(
          preparedPropValue,
          fullName,
          componentName,
          location,
          ...rest
        );
      }

      return new Error(
        `Invalid prop \`${propFullName}\` of type \`${typeof propValue}\` ` +
        `supplied to \`${componentName}\` isn't an instance of any Immutable data type.`
      );
    }
  )
);

export const uuid4 = createSimplifiedRequirableTypeChecker(
  (propValue, propFullName, componentName, location) => {
    const expectedType = 'string';
    if (typeof propValue !== expectedType) {
      return getTypeError(propValue, expectedType, propFullName, componentName, location);
    }

    const test = RegExp(/^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}$/i);
    if (!propValue.match(test)) {
      return new Error(
        `Invalid prop \`${propFullName}\` of type \`${expectedType}\` ` +
        `supplied to \`${componentName}\` doesn't match the UUID pattern.`
      );
    }

    return null;
  }
);

export const date = createSimplifiedRequirableTypeChecker(
  (propValue, propFullName, componentName, location) => {
    if (propValue instanceof Date) {
      return null;
    }

    const expectedType = 'string';
    if (typeof propValue !== expectedType) {
      return getTypeError(propValue, expectedType, propFullName, componentName, location);
    }

    const date = new Date(propValue);
    const dateString = date.toString();

    if (dateString === 'Invalid date') {
      return new Error(
        `Invalid prop \`${propFullName}\` of type \`${expectedType}\` ` +
        `supplied to \`${componentName}\` is invalid date string representation.`
      );
    }

    return null;
  }
);

export const url = createSimplifiedRequirableTypeChecker(
  (propValue, propFullName, componentName, location) => {
    const expectedType = 'string';
    if (typeof propValue !== expectedType) {
      return getTypeError(propValue, expectedType, propFullName, componentName, location);
    }

    const test = RegExp(/^[a-z0-9_.'-]+$/i);
    if (!propValue.match(test)) {
      return new Error(
        `Invalid prop \`${propFullName}\` of type \`${expectedType}\` ` +
        `supplied to \`${componentName}\` is invalid URL representation.`
      );
    }

    return null;
  }
);
