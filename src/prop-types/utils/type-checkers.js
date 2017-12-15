export function checkKeys(keyCheckType, propValue, propFullName, componentName, location, ...rest) {
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
        fieldFullName,
        ...rest
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

export function checkValues(valueCheckType, propValue, propFullName, componentName, location, ...rest) {
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
        fieldFullName,
        ...rest
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

export function getNotFoundError(propFullName, componentName, location) {
  return new Error(
    `Required ${location} \`${propFullName}\` was not specified in \`${componentName}\``
  );
}

export function getTypeError(obj, expectedType, fullName, componentName, location) {
  return new Error(
    `Invalid ${location} \`${fullName}\` of type \`${typeof obj}\` ` +
    `supplied to \`${componentName}\`, expected \`${expectedType}\``
  );
}

export function createRequirableTypeChecker(validate) {
  function checkType(isRequired, props, propName, componentName, location, propFullName, ...rest) {
    let fullName = propName;
    if (propFullName) {
      fullName = propFullName;
    }

    if (props[propName] == null) {
      if (isRequired) {
        return getNotFoundError(fullName, componentName, location);
      }

      return null;
    }

    return validate(props, propName, componentName, location, fullName, ...rest);
  }

  const chainedCheckType = checkType.bind(null, false);
  chainedCheckType.isRequired = checkType.bind(null, true);
  chainedCheckType.isSimplified = false;

  return chainedCheckType;
}

export function createSimplifiedRequirableTypeChecker(validate) {
  function checkType(isRequired, props, propName, componentName, location, propFullName, ...rest) {
    let fullName = propName;
    if (propFullName) {
      fullName = propFullName;
    }

    const propValue = props[propName];
    if (propValue == null) {
      if (isRequired) {
        return getNotFoundError(fullName, componentName, location);
      }

      return null;
    }

    return validate(propValue, fullName, componentName, location, ...rest);
  }

  const chainedCheckType = checkType.bind(null, false);
  chainedCheckType.isRequired = checkType.bind(null, true);
  chainedCheckType.isSimplified = true;

  return chainedCheckType;
}
