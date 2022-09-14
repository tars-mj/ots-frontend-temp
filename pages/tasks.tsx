// @ts-nocheck

import Layout from '../components/Layout';
import { checkPermissions } from 'lib/auth/check-permissions';

export const getServerSideProps = async function ({ req, res, resolvedUrl }) {
  return checkPermissions({ req, res, resolvedUrl });
};

const Tasks = () => {
  return (
    <Layout>
      <div>Zadania</div>
    </Layout>
  );
};

export default Tasks;
