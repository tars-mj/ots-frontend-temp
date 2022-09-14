// @ts-nocheck

import Input from 'components/atoms/Input';
import InputSelect from 'components/atoms/InputSelect';
import { SpinnerButton } from 'components/atoms/SpinnerButton';
import Breadcrumbs from 'components/moleculs/Breadcrumps';
import Button from 'components/moleculs/Button';
import DialogModal from 'components/moleculs/DialogModal';
import ClientsTable from 'components/organism/ClientsTable';
import ProjectsTable from 'components/organism/ProjectsTable';
import UsersTable from 'components/organism/UsersTable';
import {
  createProject,
  createUser,
  fetchClients,
  fetchProjects,
  fetchUsers
} from 'lib/api-routes/my-api';
import { useAuth } from 'lib/context/auth.context';
import useSession from 'lib/hooks/useSession';
import Router, { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import Layout from '../components/Layout';
import { checkPermissions } from 'lib/auth/check-permissions';

export const getServerSideProps = async function ({ req, res, resolvedUrl }) {
  res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=59');

  return checkPermissions({ req, res, resolvedUrl });
};

type InputsNewProject = {
  projectName: string;
  client: object;
  deadline: string;
  startDate: string;
};

const Projects = () => {
  const session = useSession();
  const { isLoading, error, data } = useQuery(['projectsData'], fetchProjects);
  const {
    isLoading: isLoadingClients,
    error: errorClients,
    data: dataClients
  } = useQuery(['clientsData'], fetchClients);

  const queryClient = useQueryClient();
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const router = useRouter();
  const { status, user, signOut } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    control
  } = useForm<InputsNewProject>();

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

  const mutation = useMutation(createProject, {
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(['projectsData']);
      reset({ client: {}, projectName: '', deadline: '', startDate: '' });
      closeModal();
    }
  });

  const closeModal = () => {
    clearErrors();
    setIsOpenCreate(false);
  };

  const openModalCreate = () => {
    setIsOpenCreate(true);
  };

  const onSubmit: SubmitHandler<InputsNewProject> = async (dataToSend) => {
    if (Object.entries(dataToSend.client).length === 0) {
      setError('client', { type: 'custom', message: 'Wymagane pole' });
      return;
    }
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
            <h1 className="text-xl font-semibold text-gray-900">Projekty</h1>
            <p className="mt-2 text-sm text-gray-700">Lista projektów wszystkich klientów</p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Button size="xl" type="button" typeBtn="isActive" onClick={openModalCreate}>
              Dodaj nowy projekt
            </Button>
          </div>
        </div>
        {isLoading ? <SpinnerButton /> : error ? 'ERROR' : <ProjectsTable data={data} />}
      </div>

      {isOpenCreate && (
        <DialogModal
          openStatus={isOpenCreate}
          title={'Nowy projekt'}
          message={`Formularz dodawania nowego projektu do bazy`}
          closeModal={closeModal}>
          <div className="">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mt-10 mb-10 flex flex-col justify-between">
                <Controller
                  control={control}
                  name="client"
                  render={({ field: { onChange } }) => (
                    <InputSelect
                      list={dataClients}
                      dataField="name"
                      className="mb-6"
                      mainName="Klient"
                      register={register}
                      label="client"
                      error={errors.client}
                      onChange={onChange}
                    />
                  )}
                />

                <Input
                  required
                  className="w-full mb-6"
                  mainName="Nazwa projektu"
                  label="projectName"
                  register={register}
                  error={errors.projectName}
                  autoComplete="off"
                />
                <Input
                  required
                  className="w-full mb-6"
                  mainName="Start projektu"
                  label="startDate"
                  register={register}
                  error={errors.startDate}
                  autoComplete="off"
                  type="date"
                />
                <Input
                  required
                  className="w-full mb-6"
                  mainName="Deadline"
                  label="deadline"
                  register={register}
                  error={errors.deadline}
                  autoComplete="off"
                  type="date"
                />
              </div>
              <div className="flex justify-between ">
                <Button size="md" typeBtn="support" onClick={() => closeModal()}>
                  Anuluj
                </Button>

                <Button size="md" type="submit" typeBtn="submit" isSubmitting={isSubmitting}>
                  Dodaj projekt
                </Button>
              </div>
            </form>
          </div>
        </DialogModal>
      )}
    </Layout>
  );
};

export default Projects;
