// @ts-nocheck

import router from 'next/router';

export const removeQueryParam = (param) => {
  const { pathname, query } = router;
  const params = new URLSearchParams(query);
  params.delete(param);
  router.replace({ pathname, query: params.toString() }, undefined, { shallow: true });
};
