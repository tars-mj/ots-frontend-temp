// @ts-nocheck

import React, { useEffect, useRef, useState } from 'react';
import Layout from 'components/Layout';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import ClientsTable from 'components/organism/ClientsTable';
import {
  createClient,
  createLocalization,
  createLocalizationParent,
  fetchClients,
  fetchLocalizations,
  fetchLocalizationsParent,
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

type InputsNewLocalization = {
  zipCode: string;
  province: string;
  address: string;
  city: string;
  uniqNumber: string;
  submitError: string;
};

const LocalizationsParent = () => {
  const router = useRouter();
  const query = router.query;

  const {
    isLoading: isLoadingLocalizations,
    error: errorLocalizations,
    data: dataLocalizations
  } = useQuery(['localizationsParentData'], () => fetchLocalizationsParent(query), {
    enabled: router.isReady
  });

  const queryClient = useQueryClient();
  const [isOpenCreate, setIsOpenCreate] = useState(false);

  const { status, user, signOut } = useAuth();

  useEffect(() => {
    if (dataLocalizations?.statusCode === 401) {
      signOut();
      router.push('/login');
    }
  }, [dataLocalizations]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
    setError,
    clearErrors
  } = useForm<InputsNewLocalization>();

  const mutation = useMutation(createLocalizationParent, {
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(['localizationsParentData']);
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
    const { clientId } = query;
    const res = mutation.mutate({ ...dataToSend, clientId });
  };

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 w-full ">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <div className="mb-6">
              <Breadcrumbs />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Lokalizacje klienta</h1>
            <p className="mt-2 text-sm text-gray-700">
              Lista wszystkich lokalizacji klienta - template
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
          <LocalizationsTable data={dataLocalizations} isParent={true} />
        )}
      </div>

      {isOpenCreate && (
        <DialogModal
          openStatus={isOpenCreate}
          title={'Nowa lokalizacja'}
          message={`Formularz dodawania lokalizacji do projektu`}
          closeModal={closeModal}>
          <div className="">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mt-10 mb-10 s">
                <Input
                  className="w-full mb-6"
                  mainName="ID placówki"
                  label="uniqNumber"
                  register={register}
                  required
                  error={errors.uniqNumber}
                  autoComplete="off"
                />
                <Input
                  className="w-full mb-6"
                  mainName="Adres"
                  label="address"
                  register={register}
                  required
                  error={errors.address}
                  autoComplete="off"
                />
                <Input
                  className="w-full mb-6"
                  mainName="Miasto"
                  label="city"
                  register={register}
                  required
                  error={errors.city}
                  autoComplete="off"
                />
                <Input
                  className="w-full mb-6"
                  mainName="Kod pocztowy"
                  label="zipCode"
                  register={register}
                  required
                  error={errors.zipCode}
                  autoComplete="off"
                />
                <Input
                  className="w-full mb-6"
                  mainName="Województwo"
                  label="province"
                  register={register}
                  required
                  error={errors.province}
                  autoComplete="off"
                />
              </div>
              <div className="flex justify-between ">
                <Button size="md" typeBtn="support" onClick={() => closeModal()}>
                  Anuluj
                </Button>

                <Button size="md" type="submit" typeBtn="submit" isSubmitting={isSubmitting}>
                  Dodaj lokalizację
                </Button>
              </div>
            </form>
          </div>
        </DialogModal>
      )}
    </Layout>
  );
};

export default LocalizationsParent;
