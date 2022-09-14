import Cookies from 'js-cookie';

function useSession() {
  const ots = Cookies.get('ots');
  const dataAuth = ots && JSON.parse(ots);

  return dataAuth;
}

export default useSession;
