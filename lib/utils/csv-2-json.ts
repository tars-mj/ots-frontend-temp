export const delimiterStd = ';';
export const delimiterTab = '\u0009';
export const linebreake = '\r\n';

export const allowColumn = [
  'uniqNumber',
  'province',
  'city',
  'zipCode',
  'address',
  'title',
  'description',
  'plannedDateRealize',
  'assignedToId',
  'status'
];
export const structureConfig = {
  firstLevel: ['uniqNumber', 'province', 'city', 'zipCode', 'address'],
  nestName: 'tasks',
  secondLevel: ['title', 'description', 'plannedDateRealize', 'assignedToId', 'status']
};

export const csvJSON = (csv, { delimiter, linebreake, allowColumn }) => {
  // \u0009 => tab
  // ;

  const lines = csv.split(linebreake);
  const findHeaders = lines.findIndex((x, i) => x.includes(allowColumn[0]));

  let result = [];

  const headers = lines[findHeaders].split(delimiter).map((x) => x.trim());

  for (let i = findHeaders + 1; i < lines.length; i++) {
    if (!lines[i]) continue;

    const obj = {};
    const currentline = lines[i].split(delimiter).map((x) => x.trim());

    for (var j = 0; j < headers.length; j++) {
      if (!headers[j]) continue;

      obj[headers[j]] = currentline[j];
    }

    result.push(obj);
  }

  const filterResult = result.map((obj) => {
    const objReview = Object.keys(obj);
    for (const item of objReview) {
      if (!allowColumn.includes(item)) {
        delete obj[item];
      }
    }
    return obj;
  });

  return filterResult;
};

export const prepareStructureToDB = (data, { firstLevel, secondLevel, nestName }) => {
  let uniqFirstKey = [];
  let uniqFirstValue = [];

  data.forEach((x) => {
    uniqFirstKey.push(Object.keys(x)[0]);
    uniqFirstValue.push(Object.values(x)[0]);
  });

  uniqFirstKey = uniqFirstKey.filter((v, i, a) => a.indexOf(v) === i)[0];
  uniqFirstValue = uniqFirstValue.filter((v, i, a) => a.indexOf(v) === i);

  const response = uniqFirstValue.map((x) => {
    return {
      [uniqFirstKey]: x,
      ...data.find((y) => {
        if (y[uniqFirstKey] === x) {
          return y;
        }
      })
    };
  });

  const clearUnused = response.map((x) => {
    for (let item in x) {
      if (!firstLevel.includes(item)) {
        delete x[item];
      }
    }
    return x;
  });

  const insertNested = clearUnused.map((x) => {
    const nested = data
      .filter((y) => y[uniqFirstKey] === x[uniqFirstKey])
      .map((z) => {
        for (let item in z) {
          if (!secondLevel.includes(item)) {
            delete z[item];
          }
        }
        return z;
      });
    return {
      ...x,
      [nestName]: [...nested]
    };
  });
  return insertNested;
};
