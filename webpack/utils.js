export function strToBool(val, def) {
  if (val === undefined) {
    return def;
  }
  val = String(val).toLowerCase();
  return val === '1' || val === 'true' || val === 'yes' || val === 'y';
}

export function skipFalsy(array) {
  return array.filter(Boolean);
}
