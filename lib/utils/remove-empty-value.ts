export const removeEmptyValue = (obj: object): object => {
  Object.keys(obj).forEach((key) => {
    if (obj[key] === '' || obj[key] === undefined) {
      delete obj[key];
    }
  });

  return obj;
};
