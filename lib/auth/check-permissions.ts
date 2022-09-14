import { Role } from 'types';
import Cookies from 'universal-cookie';

export const checkPermissions = ({ req, res, resolvedUrl }) => {
  const cookies = new Cookies(req.cookies).getAll();

  const role = cookies['ots']?.role as Role;
  const currentPath = resolvedUrl;

  const allowPathsForRole = {
    PROCESS_MANAGER: ['/projects', '/localizations', '/users', '/clients', '/reports'],
    SUBCONTRACTOR_ADMIN: ['/localizations', '/users'],
    SUBCONTRACTOR_WORKER: ['/localizations'],
    CLIENT_MANAGER: ['/users', '/client-projects'],
    CLIENT_WORKER: ['/client-projects']
  };

  if (!role) {
    return {
      redirect: {
        destination: '/login',
        permanent: false
      }
    };
  }

  if (allowPathsForRole[role].includes(currentPath)) {
    return { props: {} };
  }

  return {
    redirect: {
      destination: '/login',
      permanent: false
    }
  };
};
