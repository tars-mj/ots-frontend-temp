export const capitalize = (s: string) => {
  s = s.toLowerCase();
  s = s.replace(/_/g, ' ');
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};
