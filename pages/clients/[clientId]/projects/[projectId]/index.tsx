// @ts-nocheck

import React, { useEffect, useRef, useState } from 'react';
import Layout from 'components/Layout';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import ClientsTable from 'components/organism/ClientsTable';
import {
  createClient,
  createLocalization,
  fetchClients,
  fetchLocalizations,
  fetchProject,
  postClient
} from 'lib/api-routes/my-api';
import { SpinnerButton } from 'components/atoms/SpinnerButton';
import DialogModal from 'components/moleculs/DialogModal';
import Button from 'components/moleculs/Button';
import Input from 'components/atoms/Input';
import { SubmitHandler, useForm } from 'react-hook-form';

import { useRouter } from 'next/router';
import { useAuth } from 'lib/context/auth.context';
import LocalizationsTable from 'components/organism/LocalizationsTable';
import { ParsedUrlQuery } from 'querystring';
import Breadcrumbs from 'components/moleculs/Breadcrumps';
import InsertLocalization from 'components/organism/InsertLocalization';

type InputsNewLocalization = {
  address: string;
  city: string;
  uniqNumber: string;
  submitError: string;
};

const Project = () => {
  const router = useRouter();
  const query = router.query;

  const {
    isLoading: isLoadingProject,
    error: errorProject,
    data: dataProject
  } = useQuery(['projectData'], () => fetchProject(query), {
    enabled: router.isReady
  });

  const {
    isLoading: isLoadingLocalizations,
    error: errorLocalizations,
    data: dataLocalizations
  } = useQuery(['localizationsInProjectData'], () => fetchLocalizations(query), {
    enabled: router.isReady
  });

  const queryClient = useQueryClient();
  const [isOpenCreate, setIsOpenCreate] = useState(false);

  const { status, user, signOut } = useAuth();

  useEffect(() => {
    if (dataProject?.statusCode === 401) {
      signOut();
      router.push('/login');
    }
  }, [dataProject]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
    setError,
    clearErrors
  } = useForm<InputsNewLocalization>();

  const mutation = useMutation(createLocalization, {
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(['localizationsInProjectData']);
      reset({ address: '', uniqNumber: '', city: '' });
      closeModal();
    }
  });

  const closeModal = () => {
    setIsOpenCreate(false);
    reset({ address: '', uniqNumber: '', city: '' });
  };

  const openModalCreate = () => {
    setIsOpenCreate(true);
  };

  const onSubmit: SubmitHandler<InputsNewLocalization> = async (dataToSend) => {
    const { clientId, projectId } = query;
    const res = mutation.mutate({ ...dataToSend, clientId, projectId });
  };

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
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Button
              size="xl"
              type="button"
              typeBtn="isActive"
              onClick={openModalCreate}
              className="mr-2">
              Dodaj lokalizację
            </Button>
          </div>
        </div>
        {isLoadingLocalizations ? (
          <SpinnerButton />
        ) : errorLocalizations ? (
          'ERROR'
        ) : (
          <LocalizationsTable data={dataLocalizations} />
        )}
      </div>

      {isOpenCreate && (
        <DialogModal
          size="full"
          openStatus={isOpenCreate}
          title={'Dodaj lokalizacje'}
          message={`Formularz dodawania lokalizacji do projektu`}
          closeModal={closeModal}>
          <div className="">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mt-10 mb-10">
                <InsertLocalization currentDataLocalizations={dataLocalizations} />
              </div>
              <div className="flex justify-between ">
                <Button size="md" typeBtn="support" onClick={() => closeModal()}>
                  Anuluj
                </Button>
              </div>
            </form>
          </div>
        </DialogModal>
      )}
    </Layout>
  );
};

export default Project;
