import useSession from 'lib/hooks/useSession';
import Router from 'next/router';
import { useEffect } from 'react';
import Layout from '../components/Layout';

import { checkPermissions } from 'lib/auth/check-permissions';

export const getServerSideProps = async function ({ req, res, resolvedUrl }) {
  return checkPermissions({ req, res, resolvedUrl });
};

const Reports = () => {
  const session = useSession();

  useEffect(() => {
    if (!session) {
      Router.push('/login');
    }
  }, [session]);

  return (
    <Layout>
      <div>Raporty</div>
    </Layout>
  );
};

export default Reports;
