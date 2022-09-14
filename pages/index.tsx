import Layout from 'components/Layout';
import Cookies from 'universal-cookie';

export const getServerSideProps = async function ({ req, res }) {
  const cookies = new Cookies(req.cookies).getAll();
  const role = cookies['ots']?.role;
  res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=59');

  const redirect = {
    path: '/login'
  };

  if (role) {
    switch (role) {
      case 'PROCESS_MANAGER':
        redirect.path = '/projects';
        break;
      case 'SUBCONTRACTOR_ADMIN':
        redirect.path = '/localizations';
        break;
      case 'SUBCONTRACTOR_WORKER':
        redirect.path = '/localizations';
        break;
      case 'CLIENT_MANAGER':
        redirect.path = '/client-projects';
        break;
      case 'CLIENT_WORKER':
        redirect.path = '/client-projects';
        break;
      default:
        redirect.path = '/login';
    }
  }

  return {
    props: {},
    redirect: {
      destination: redirect.path,
      permanent: false
    }
  };
};

const Home = () => {
  return (
    <Layout>
      <div></div>
    </Layout>
  );
};

export default Home;
