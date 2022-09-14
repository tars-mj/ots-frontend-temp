// @ts-nocheck

import React, { useEffect, useRef, useState } from 'react';
import Layout from 'components/Layout';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import ClientsTable from 'components/organism/ClientsTable';
import { createClient, fetchClients, postClient } from 'lib/api-routes/my-api';
import { SpinnerButton } from 'components/atoms/SpinnerButton';
import DialogModal from 'components/moleculs/DialogModal';
import Button from 'components/moleculs/Button';
import Input from 'components/atoms/Input';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { useAuth } from 'lib/context/auth.context';
import Breadcrumbs from 'components/moleculs/Breadcrumps';
import { translate } from 'lib/constants/breadcrumbs-translate';

import { checkPermissions } from 'lib/auth/check-permissions';

export const getServerSideProps = async function ({ req, res, resolvedUrl }) {
  return checkPermissions({ req, res, resolvedUrl });
};

type InputsNewClient = {
  name: string;
  submitError: string;
};

const Clients = () => {
  const { isLoading, error, data } = useQuery(['clientsData'], fetchClients);
  const queryClient = useQueryClient();
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const router = useRouter();
  const { status, user, signOut } = useAuth();

  useEffect(() => {
    if (data?.statusCode === 401) {
      signOut();
      router.push('/login');
    }
  }, [data]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
    setError,
    clearErrors
  } = useForm<InputsNewClient>();

  const mutation = useMutation(createClient, {
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(['clientsData']);
      reset();
      closeModal();
    }
  });

  const closeModal = () => {
    setIsOpenCreate(false);
  };

  const openModalCreate = () => {
    setIsOpenCreate(true);
  };

  const onSubmit: SubmitHandler<InputsNewClient> = async (dataToSend) => {
    const res = mutation.mutate(dataToSend);
  };

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 w-full ">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <div className="mb-6">
              <Breadcrumbs />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Klienci</h1>
            <p className="mt-2 text-sm text-gray-700">
              Baza klientów, do których przypisujemy projekty.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Button size="xl" type="button" typeBtn="isActive" onClick={openModalCreate}>
              Dodaj nowego klienta
            </Button>
          </div>
        </div>{' '}
        {isLoading ? <SpinnerButton /> : error ? 'ERROR' : <ClientsTable data={data} />}
      </div>

      {isOpenCreate && (
        <DialogModal
          openStatus={isOpenCreate}
          title={'Nowy klient'}
          message={`Formularz dodawania nowego klienta do bazy`}
          closeModal={closeModal}>
          <div className="">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mt-10 mb-10 s">
                <Input
                  className="w-full"
                  mainName="Nazwa klienta"
                  label="name"
                  register={register}
                  required
                  error={errors.name}
                  autoComplete="off"
                />
              </div>
              <div className="flex justify-between ">
                <Button size="md" typeBtn="support" onClick={() => closeModal()}>
                  Anuluj
                </Button>

                <Button size="md" type="submit" typeBtn="submit" isSubmitting={isSubmitting}>
                  Dodaj klienta
                </Button>
              </div>
            </form>
          </div>
        </DialogModal>
      )}
    </Layout>
  );
};

export default Clients;
