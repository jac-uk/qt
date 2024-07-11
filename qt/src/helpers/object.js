const objectHasNestedProperty = (obj, dotPath) => {
  if (typeof dotPath !== 'string' || dotPath.trim() === '') {
    return false;
  }
  const keys = dotPath.split('.');
  let currentObj = obj;
  for (const key of keys) {
    if (!currentObj || typeof currentObj !== 'object' || !Object.prototype.hasOwnProperty.call(currentObj, key)) {
      return false;
    }
    currentObj = currentObj[key];
  }
  return true;
};

export {
  objectHasNestedProperty
};
