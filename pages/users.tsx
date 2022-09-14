import Input from 'components/atoms/Input';
import InputSelect from 'components/atoms/InputSelect';
import { SpinnerButton } from 'components/atoms/SpinnerButton';
import Breadcrumbs from 'components/moleculs/Breadcrumps';
import Button from 'components/moleculs/Button';
import DialogModal from 'components/moleculs/DialogModal';
import ClientsTable from 'components/organism/ClientsTable';
import UsersTable from 'components/organism/UsersTable';
import { createUser, fetchClients, fetchUsers } from 'lib/api-routes/my-api';
import { role } from 'lib/constants/role';
import { useAuth } from 'lib/context/auth.context';
import useSession from 'lib/hooks/useSession';
import Router, { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Role } from 'types';
import Layout from '../components/Layout';
import {
  withProcessManagerRole,
  withProcessManagerRoleAllow,
  withProcessManagerRoleFn
} from 'lib/hoc/withRole';
import { InputSelectRoles } from 'components/rbac';

import { checkPermissions } from 'lib/auth/check-permissions';

export const getServerSideProps = async function ({ req, res, resolvedUrl }) {
  return checkPermissions({ req, res, resolvedUrl });
};

const allowClientAssign = ['CLIENT_MANAGER', 'CLIENT_WORKER'];

type InputsNewUser = {
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  submitError: string;
  pwd: string;
  clientManager: object;
};

const Users = () => {
  const session = useSession();
  const router = useRouter();
  const { status, user, signOut } = useAuth();
  const { isLoading, error, data } = useQuery(['usersData'], fetchUsers);

  const {
    isLoading: isLoadingClients,
    error: errorLients,
    data: dataClients
  } = useQuery(['clientsData'], fetchClients, { enabled: withProcessManagerRoleAllow(user) });
  const queryClient = useQueryClient();
  const [isOpenCreate, setIsOpenCreate] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    control
  } = useForm<InputsNewUser>();

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

  const mutation = useMutation(createUser, {
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(['usersData']);
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

  const onSubmit: SubmitHandler<InputsNewUser> = async (dataToSend) => {
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
            <h1 className="text-xl font-semibold text-gray-900">Uytkownicy</h1>
            <p className="mt-2 text-sm text-gray-700">Lista uzytkowników w systemie.</p>
          </div>

          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Button size="xl" type="button" typeBtn="isActive" onClick={openModalCreate}>
              Dodaj nowego uzytkownika
            </Button>
          </div>
        </div>
        {isLoading ? <SpinnerButton /> : error ? 'ERROR' : <UsersTable data={data} />}
      </div>

      {isOpenCreate && (
        <DialogModal
          openStatus={isOpenCreate}
          title={'Nowy uzytkownik'}
          message={`Formularz dodawania nowego uzytkownika do bazy`}
          closeModal={closeModal}>
          <div className="">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mt-10 mb-10 flex flex-col justify-between ">
                <Controller
                  control={control}
                  name="role"
                  render={({ field: { onChange } }) => (
                    <InputSelectRoles
                      list={role}
                      dataField="name"
                      className="mb-6"
                      mainName="Rola uzytkownika"
                      register={register}
                      label="role"
                      error={errors.role}
                      onChange={(role) => {
                        onChange(role.name);
                      }}
                    />
                  )}
                />
                {allowClientAssign.includes(watch().role) && (
                  <Controller
                    control={control}
                    name="clientManager"
                    render={({ field: { onChange } }) => (
                      <InputSelectRoles
                        list={dataClients}
                        dataField="name"
                        className="mb-6"
                        mainName="Przypisz klienta"
                        register={register}
                        label="clientManager"
                        error={errors.role}
                        onChange={(client) => onChange(client.id)}
                      />
                    )}
                  />
                )}
                <Input
                  className="w-full mb-6"
                  mainName="Imię"
                  label="firstName"
                  register={register}
                  required
                  error={errors.firstName}
                  autoComplete="off"
                />
                <Input
                  className="w-full mb-6"
                  mainName="Nazwisko"
                  label="lastName"
                  register={register}
                  required
                  error={errors.lastName}
                  autoComplete="off"
                />
                <Input
                  className="w-full mb-6"
                  mainName="Email / login"
                  label="email"
                  register={register}
                  required
                  error={errors.email}
                  autoComplete="off"
                />

                <Input
                  className="w-full mb-6"
                  mainName="Hasło"
                  label="pwd"
                  register={register}
                  required
                  error={errors.pwd}
                  autoComplete="off"
                />
              </div>
              <div className="flex justify-between ">
                <Button size="md" typeBtn="support" onClick={() => closeModal()}>
                  Anuluj
                </Button>

                <Button size="md" type="submit" typeBtn="submit" isSubmitting={isSubmitting}>
                  Dodaj uzytkownika
                </Button>
              </div>
            </form>
          </div>
        </DialogModal>
      )}
    </Layout>
  );
};

export default Users;
