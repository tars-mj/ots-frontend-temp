import { SpinnerButton } from 'components/atoms/SpinnerButton';
import Breadcrumbs from 'components/moleculs/Breadcrumps';
import ProjectsClientTable from 'components/organism/ProjectsClientTable';
import { fetchProjects } from 'lib/api-routes/my-api';
import useSession from 'lib/hooks/useSession';
import Router, { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useQuery } from 'react-query';
import Layout from 'components/Layout';
import { checkPermissions } from 'lib/auth/check-permissions';
import { useAuth } from 'lib/context/auth.context';

export const getServerSideProps = async function ({ req, res, resolvedUrl }) {
  return checkPermissions({ req, res, resolvedUrl });
};

const ClientProjects = () => {
  const session = useSession();
  const router = useRouter();
  const { status: statusAuth, user, signOut } = useAuth();

  const { isLoading, error, data } = useQuery(['projectsData'], fetchProjects);

  useEffect(() => {
    if (data?.statusCode === 401) {
      signOut();
      router.push('/login');
    }
  }, [data]);

  useEffect(() => {
    if (!session) {
      Router.push('/login');
    }
  }, [session]);

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 w-full ">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <div className="mb-6">
              <Breadcrumbs />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Projekty</h1>
            <p className="mt-2 text-sm text-gray-700">Lista projektów</p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none"></div>
        </div>
        {isLoading ? <SpinnerButton /> : error ? 'ERROR' : <ProjectsClientTable data={data} />}
      </div>
    </Layout>
  );
};

export default ClientProjects;
