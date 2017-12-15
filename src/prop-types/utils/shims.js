const shim = () => null;
shim.isRequired = shim;
const getShim = () => shim;

export const checkKeys = shim;
export const checkValues = shim;
export const getNotFoundError = shim;
export const getTypeError = shim;
export const createRequirableTypeChecker = getShim;
export const createSimplifiedRequirableTypeChecker = getShim;
