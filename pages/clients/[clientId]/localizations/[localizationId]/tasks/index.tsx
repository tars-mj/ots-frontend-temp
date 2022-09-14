// @ts-nocheck

import { Badge } from 'components/atoms/Badge';
import Input from 'components/atoms/Input';
import { SpinnerButton } from 'components/atoms/SpinnerButton';
import MySwitch from 'components/atoms/Switch';
import Layout from 'components/Layout';
import Breadcrumbs from 'components/moleculs/Breadcrumps';
import Button from 'components/moleculs/Button';
import DialogModal from 'components/moleculs/DialogModal';
import TaskListItem from 'components/moleculs/TaskListItem';
import TaskTable from 'components/organism/TaskTable';
import UploadFileButton from 'components/organism/UploadFileButton';
import UploadLayoutButton from 'components/organism/UploadLayoutButton';
import {
  addCoordToTasks,
  createTask,
  fetchLayoutsOnLocalization,
  fetchLayoutsOnLocalizationParent,
  fetchTasks,
  fetchTasksParent,
  uploadLayoutOnLocalization
} from 'lib/api-routes/my-api';
import { dataQuery } from 'lib/constants/data-query';
import { useAuth } from 'lib/context/auth.context';
import { removeQueryParam } from 'lib/utils/remove-query-params';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from 'react-query';

const Map = dynamic(() => import('components/organism/Map'), { ssr: false });

type InputsNewTask = {
  title: string;
  description: string;
  plannedDateRealize: string;
  isAllowAreas: boolean;
};

const TasksParent = () => {
  const router = useRouter();
  const query = router.query;

  const [selectedTask, setSelectedTask] = useState(() =>
    query.taskId ? [Number(query.taskId)] : []
  );

  const isParent = true;

  const dataStore = dataQuery[isParent ? 'isParent' : 'noParent'];

  const {
    isLoadingError,
    isLoading: isLoadingTasks,
    error: errorTasks,
    data: dataTasks
  } = useQuery([dataStore.tasks], () => fetchTasksParent(query), {
    enabled: router.isReady
  });

  const {
    isLoadingError: isLoadingErrorLayouts,
    isLoading: isLoadingLayouts,
    error: errorLayouts,
    data: dataLayouts
  } = useQuery([dataStore.layouts], () => fetchLayoutsOnLocalizationParent(query), {
    enabled: router.isReady
  });

  const queryClient = useQueryClient();
  const [isOpenCreateTask, setIsOpenCreateTask] = useState(false);

  const { status, user, signOut } = useAuth();

  useEffect(() => {
    if (dataTasks?.statusCode === 401) {
      signOut();
      router.push('/login');
    }
  }, [dataTasks]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    control
  } = useForm<InputsNewTask>();

  const mutation = useMutation(createTask, {
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries([dataStore.tasks]);
      reset({ title: '', description: '', plannedDateRealize: '', isAllowAreas: false });
      closeModalCreateTask();
    }
  });

  const mutationCoord = useMutation(addCoordToTasks, {
    onSuccess: () => {
      // Invalidate and refetch

      queryClient.invalidateQueries([dataStore.tasks]);
      queryClient.invalidateQueries([dataStore.layouts]);
    }
  });

  const assignCoordToTask = (coordId) => {
    const { clientId, localizationId } = query;
    const layoutId = dataLayouts[0].id;

    mutationCoord.mutate({
      ids: { clientId, localizationId, coordId, layoutId },
      selectedTask
    });
  };

  const closeModalCreateTask = () => {
    setIsOpenCreateTask(false);
    reset({ title: '', description: '', plannedDateRealize: '' });
  };

  const openModalCreateTask = () => {
    setIsOpenCreateTask(true);
  };

  const selectTask = (ids: Array<number>, e = undefined) => {
    removeQueryParam('taskId');

    if (e && e.altKey) {
      setSelectedTask([...selectedTask, ...ids]);
      return;
    }
    setSelectedTask([...ids]);
  };

  const filterSelectedTask = () => {
    return dataTasks && dataTasks.filter((task) => selectedTask.includes(task.id));
  };

  const onSubmit: SubmitHandler<InputsNewTask> = async (dataToSend) => {
    const { clientId, localizationId } = query;

    const res = mutation.mutate({ ...dataToSend, clientId, localizationId });
  };

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 w-full">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <div className="mb-6">
              <Breadcrumbs />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Zadania w lokalizacji</h1>
            <p className="mt-2 text-sm text-gray-700">
              Lista wszystkich zadań występujących w lokalizacji
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Button
              size="xl"
              type="button"
              typeBtn="isActive"
              onClick={openModalCreateTask}
              className="mr-2">
              Dodaj zadanie
            </Button>
          </div>
        </div>

        {isLoadingTasks ? (
          <SpinnerButton />
        ) : errorTasks ? (
          'ERROR'
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-4 items-start divide-x divide-gray-200 lg:grid-cols-4 lg:gap-2 bg-white border-gray-200 shadow-md rounded-lg p-4">
            <div className="grid grid-cols-1 gap-2 ">
              <div className="overflow-hidden ">
                <div className="p-2">
                  <div className="h-[50vh] overflow-scroll text-sm text-gray-700">
                    <div className="divide-y divide-gray-200">
                      {dataTasks &&
                        dataTasks.map((item) => {
                          return (
                            <TaskListItem
                              key={item.id}
                              id={item.id}
                              title={item.title}
                              status={item.status}
                              isSelected={selectedTask.includes(item.id)}
                              onClick={(e) => selectTask([item.id], e)}
                              isCoord={item.coordId ? true : false}
                            />
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:col-span-3 ">
              <div className=" bg-white overflow-hidden">
                <div className="p-2">
                  <div className="h-[50vh]">
                    {dataLayouts && dataLayouts.length ? (
                      <Map
                        url={dataLayouts[0].url}
                        layoutId={dataLayouts[0].id}
                        coords={dataLayouts[0].coords}
                        selectTasksFn={selectTask}
                        selectCoordFn={assignCoordToTask}
                        selectedTask={selectedTask}
                        isParent={true}
                      />
                    ) : (
                      <div className="flex flex-col justify-center items-center h-full">
                        <div className="mb-2">Ta lokalizacja nie ma pliku z głównym planem.</div>
                        <UploadLayoutButton
                          clientId={query && query.clientId}
                          localizationId={query && query.localizationId}
                          dataQuery={dataStore.layouts}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTask && <TaskTable data={filterSelectedTask()} isParent={true} />}
      </div>

      {isOpenCreateTask && (
        <DialogModal
          openStatus={isOpenCreateTask}
          title={'Nowe zadanie'}
          message={`Formularz dodawania nowego zadania`}
          closeModal={closeModalCreateTask}>
          <div className="">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mt-10 mb-10 s">
                <Input
                  className="w-full mb-6"
                  mainName="Tytuł"
                  label="title"
                  register={register}
                  required
                  error={errors.title}
                  autoComplete="off"
                />
                <Input
                  className="w-full mb-6"
                  mainName="Opis"
                  label="description"
                  register={register}
                  required
                  error={errors.description}
                  autoComplete="off"
                />
                <Input
                  className="w-full mb-6"
                  mainName="Data realizacji"
                  label="plannedDateRealize"
                  register={register}
                  required
                  error={errors.plannedDateRealize}
                  autoComplete="off"
                  type="date"
                />
                <div className="flex flex-row justify-between text-sm font-medium text-primary-blue-400 items-center">
                  <div>Pola z powierzchniami</div>
                  <Controller
                    control={control}
                    name="isAllowAreas"
                    render={({ field: { onChange } }) => (
                      <MySwitch isActive={false} mutate={(e) => onChange(e)} register={register} />
                    )}
                  />
                </div>
              </div>
              <div className="flex justify-between ">
                <Button size="md" typeBtn="support" onClick={() => closeModalCreateTask()}>
                  Anuluj
                </Button>

                <Button size="md" type="submit" typeBtn="submit" isSubmitting={isSubmitting}>
                  Dodaj zadanie
                </Button>
              </div>
            </form>
          </div>
        </DialogModal>
      )}
    </Layout>
  );
};

export default TasksParent;
