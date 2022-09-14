export const convertToCsv = (arr) => {
  const keys = Object.keys(arr[0]);
  const replacer = (_key, value) => (value === null ? '' : value);
  const processRow = (row) => keys.map((key) => JSON.stringify(row[key], replacer)).join(';');
  return [keys.join(';'), ...arr.map(processRow)].join('\r\n');
};
