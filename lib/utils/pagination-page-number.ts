export const paginationPageNumber = ({
  currentPage,
  allPages
}: {
  currentPage: number;
  allPages: number;
}) => {
  const currentPageMod = currentPage;
  const range = allPages < 7 ? allPages : 7;

  const arr = Array(range)
    .fill(1)
    .map((_, i) => {
      const iterator = i;
      const middleRange = Math.floor(range / 2);

      if (currentPageMod - middleRange <= 0) {
        return iterator;
      }

      if (currentPageMod + middleRange >= allPages) {
        return allPages - range + iterator;
      }

      if (currentPageMod - middleRange > 0) {
        return currentPageMod - middleRange + iterator;
      }
    });

  return arr;
};
