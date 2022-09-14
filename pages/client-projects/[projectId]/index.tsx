import React, { useEffect, useRef, useState } from 'react';
import Layout from 'components/Layout';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import ClientsTable from 'components/organism/ClientsTable';
import { fetchLocalizationsClientView, fetchProject } from 'lib/api-routes/my-api';
import { SpinnerButton } from 'components/atoms/SpinnerButton';
import { useRouter } from 'next/router';
import { useAuth } from 'lib/context/auth.context';
import LocalizationsTable from 'components/organism/LocalizationsTable';
import Breadcrumbs from 'components/moleculs/Breadcrumps';
import LocalizationsClientViewTable from 'components/organism/LocalizationsClientViewTable';

const ClientProject = () => {
  const router = useRouter();
  const query = router.query;

  const {
    isLoading: isLoadingLocalizations,
    error: errorLocalizations,
    data: dataLocalizations
  } = useQuery(['localizationsInProjectData'], () => fetchLocalizationsClientView(query), {
    enabled: router.isReady
  });

  const { status, user, signOut } = useAuth();

  useEffect(() => {
    if (dataLocalizations?.statusCode === 401) {
      signOut();
      router.push('/login');
    }
  }, [dataLocalizations]);

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 w-full ">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <div className="mb-6">
              <Breadcrumbs />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Lokalizacje w projekcie</h1>
            <p className="mt-2 text-sm text-gray-700">
              Lista wszystkich lokalizacji występujących w projekcie
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none"></div>
        </div>
        {isLoadingLocalizations ? (
          <SpinnerButton />
        ) : errorLocalizations ? (
          'ERROR'
        ) : (
          <LocalizationsClientViewTable data={dataLocalizations} />
        )}
      </div>
    </Layout>
  );
};

export default ClientProject;
