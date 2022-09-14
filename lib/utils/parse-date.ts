export const parseDate = (dateToParse: string) => {
  const date = new Date(dateToParse);

  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
    .getDate()
    .toString()
    .padStart(2, '0')}`;
};
