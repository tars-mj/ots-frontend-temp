import { SpinnerButton } from 'components/atoms/SpinnerButton';
import Layout from 'components/Layout';
import Breadcrumbs from 'components/moleculs/Breadcrumps';
import Button from 'components/moleculs/Button';
import {
  fetchLocalizationsSubcontractor,
  fetchTasksSubcontractor,
  fetchUsersSubcontractor
} from 'lib/api-routes/my-api';
import useSession from 'lib/hooks/useSession';
import Router, { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useQuery } from 'react-query';
import LocalizationsSubcontractorTable from '../../components/organism/LocalizationsSubcontractorTable';

import { checkPermissions } from 'lib/auth/check-permissions';
import { useAuth } from 'lib/context/auth.context';

export const getServerSideProps = async function ({ req, res, resolvedUrl }) {
  return checkPermissions({ req, res, resolvedUrl });
};

const LocalizationsSubcontractor = () => {
  const session = useSession();
  const router = useRouter();
  const { status: statusAuth, user, signOut } = useAuth();

  const {
    status,
    isLoading: isLodaingLocalizations,
    error: errorLocalizations,
    data: dataLocalizations
  } = useQuery(['localizationsSubcontractorData'], fetchLocalizationsSubcontractor);

  const {
    isLoading: isLoadingTasks,
    error: errorTasks,
    data: dataTasks
  } = useQuery(['tasksSubcontractorData'], fetchTasksSubcontractor);

  const {
    isLoading: isLoadingUsers,
    error: errorUsers,
    data: dataUsers
  } = useQuery(['usersSubcontractorData'], fetchUsersSubcontractor, {
    enabled: session?.role === 'SUBCONTRACTOR_ADMIN'
  });

  useEffect(() => {
    if (dataLocalizations?.statusCode === 401) {
      signOut();
      router.push('/login');
    }
  }, [dataLocalizations]);

  useEffect(() => {
    if (!session) {
      Router.push('/login');
    }
  }, [session]);

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 w-full">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <div className="mb-6">
              <Breadcrumbs />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Lokalizacje</h1>
            <p className="mt-2 text-sm text-gray-700">
              Lista lokalizacji, do których masz przypisane aktualne zadania.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none"></div>
        </div>
        {status === 'loading' ? (
          <SpinnerButton />
        ) : status === 'error' ? (
          'ERROR'
        ) : (
          <LocalizationsSubcontractorTable data={dataLocalizations} />
        )}
      </div>
    </Layout>
  );
};

export default LocalizationsSubcontractor;
