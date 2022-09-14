import { SpinnerButton } from 'components/atoms/SpinnerButton';
import Layout from 'components/Layout';
import Breadcrumbs from 'components/moleculs/Breadcrumps';
import Button from 'components/moleculs/Button';
import {
  createComment,
  deletePhotoTask,
  editTask,
  fetchLocalizationsSubcontractor,
  fetchTasksSubcontractor,
  fetchUsersSubcontractor,
  reassignUserToTask,
  statusTask
} from 'lib/api-routes/my-api';
import useSession from 'lib/hooks/useSession';
import Router, { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import LocalizationsSubcontractorTable from 'components/organism/LocalizationsSubcontractorTable';
import TasksSubcontractorTable from 'components/organism/TasksSubcontractorTable';
import Gallery from 'components/organism/Gallery';
import { CameraIcon, ChatIcon } from '@heroicons/react/outline';
import UploadFileButton from 'components/organism/UploadFileButton';
import DialogModal from 'components/moleculs/DialogModal';
import { parseDate } from 'lib/utils/parse-date';
import Input from 'components/atoms/Input';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { Badge } from 'components/atoms/Badge';
import { capitalize } from 'lib/utils/capitalize';
import InputSelect from 'components/atoms/InputSelect';

type Task = {
  id: number;
  title: string;
  description: string;
  plannedDateRealize: string;
  createdAt: string;
  author: {
    email: string;
    firstName: string;
    lastName: string;
  };
  assignedTo: object;
  photos: [];
  comments: [];
  taskLogs: [];
  status: string;
  areas: [];
};

type InputsEditTask = Partial<Task>;

const TaskDetailsSubcontractor = () => {
  const session = useSession();
  const router = useRouter();
  const { localizationId, taskId } = router.query;
  const queryClient = useQueryClient();
  const [taskData, setTaskData] = useState();

  const {
    status,
    isLoading: isLodaingLocalizations,
    error: errorLocalizations,
    data: dataLocalizations
  } = useQuery(['localizationsSubcontractorData'], fetchLocalizationsSubcontractor);

  const {
    isLoading: isLoadingTasks,
    error: errorTasks,
    data: dataTasks
  } = useQuery(['tasksSubcontractorData'], fetchTasksSubcontractor);

  const {
    isLoading: isLoadingUsers,
    error: errorUsers,
    data: dataUsers
  } = useQuery(['usersSubcontractorData'], fetchUsersSubcontractor, {
    enabled: session?.role === 'SUBCONTRACTOR_ADMIN'
  });

  useEffect(() => {
    if (!session) {
      Router.push('/login');
    }
  }, [session]);

  useEffect(() => {
    if (dataTasks) {
      dataTasks && setTaskData(dataTasks.find((task) => task.id === Number(taskId)));
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
  } = useForm<InputsEditTask>();

  const [modalsState, setModalState] = useState(false);
  const [modalsConfirmState, setModalConfirmState] = useState(false);
  const [modalsRejectedState, setModalRejectedState] = useState(false);
  const [modalsUserAssign, setModalsUserAssign] = useState(false);

  const closeModalUserAssign = () => {
    setModalsUserAssign(false);
  };

  const openModalUserAssign = () => {
    setModalsUserAssign(true);
  };

  const closeModalComments = () => {
    setModalState(false);
  };

  const openModalComments = () => {
    setModalState(true);
  };

  const closeModalConfirm = () => {
    setModalConfirmState(false);
  };

  const openModalConfirm = () => {
    setModalConfirmState(true);
  };

  const closeModalRejected = () => {
    setModalRejectedState(false);
  };

  const openModalRejected = () => {
    setModalRejectedState(true);
  };

  const mutationComment = useMutation(createComment, {
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries(['tasksSubcontractorData']);
      reset();
      clearErrors();
    }
  });

  const mutationStatus = useMutation(statusTask, {
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries(['tasksSubcontractorData']);

      reset();
      clearErrors();
    }
  });

  const mutationEdit = useMutation(reassignUserToTask, {
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries(['tasksSubcontractorData']);

      reset();
      clearErrors();
    }
  });

  const onSubmitAssign: SubmitHandler<InputsEditTask> = async (data) => {
    const res = mutationEdit.mutate({
      data,
      ids: {
        taskId
      }
    });
  };

  const onSubmitComment: SubmitHandler<InputsEditTask> = async (data) => {
    const { clientId, projectId } = taskData;

    mutationComment.mutate({
      data,
      ids: {
        clientId,
        projectId,
        localizationId,
        taskId
      }
    });
  };

  const onSubmitStatus: SubmitHandler<InputsEditTask> = async () => {
    const data = { status: 'FINISHED' };

    mutationStatus.mutate({
      data,
      ids: {
        localizationId,
        taskId
      }
    });

    closeModalConfirm();
  };

  const onSubmitRejectStatus: SubmitHandler<InputsEditTask> = async (comment) => {
    const { clientId, projectId } = taskData;
    const status = { status: 'REJECTED' };

    mutationStatus.mutate({
      data: status,
      ids: {
        localizationId,
        taskId
      }
    });

    mutationComment.mutate({
      data: comment,
      ids: {
        clientId,
        projectId,
        localizationId,
        taskId
      }
    });

    closeModalRejected();
  };

  const mutationDeletePhoto = useMutation(deletePhotoTask, {
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(['tasksSubcontractorData']);
    }
  });

  const onDeletePhoto = (id) => {
    mutationDeletePhoto.mutate({
      id
    });
  };

  const filterUserList = () => {
    const dataFilter = dataUsers.filter(
      (user) => user.role === 'SUBCONTRACTOR_ADMIN' || user.role === 'SUBCONTRACTOR_WORKER'
    );

    const dataFilterMap = dataFilter.map((user) => {
      return {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`
      };
    });

    return dataFilterMap;
  };

  return (
    <Layout title={taskData && `${taskData.id}: ${taskData.title}`}>
      <div className="hidden md:flex px-4 sm:px-6 lg:px-8 w-full">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <div className="mb-6">
              <Breadcrumbs />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Zadanie</h1>
            <p className="mt-2 text-sm text-gray-700">{taskData && taskData?.title}</p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none"></div>
        </div>
      </div>
      <div className="px-0 sm:px-6 lg:px-8 w-full">
        <div className="md:flex md:items-center">
          <div className="md:flex-auto max-w-[728px] ">
            {taskData?.photos.length ? (
              <div>
                <Gallery onDelete={onDeletePhoto} photos={taskData ? taskData.photos : []} />
              </div>
            ) : (
              <div className="mb-4 md:mb-10"></div>
            )}
            <div className="flex flex-col px-4 md:shadow-md md:p-4 rounded-md">
              <div className="flex justify-between items-center ">
                <h1 className="text-base font-semibold text-gray-900 ">Opis zadania</h1>
                {taskData && taskData.status && (
                  <Badge size="btn" status={taskData && taskData.status.toUpperCase()}>
                    {capitalize(taskData.status)}
                  </Badge>
                )}
                <div className="flex gap-4">
                  <ChatIcon
                    className="h-7 w-7"
                    aria-hidden="true"
                    onClick={() => openModalComments()}
                  />

                  <UploadFileButton
                    dataQuery={'tasksSubcontractorData'}
                    localizationId={localizationId}
                    taskId={taskId}
                  />
                  {/* </CameraIcon> */}
                </div>
              </div>
              <div className="flex flex-col justify-between ">
                <div className="mt-2 text-base text-gray-700 h-[40vh] md:h-full overflow-y-scroll ">
                  {taskData?.description}

                  {session &&
                    session.role === 'SUBCONTRACTOR_ADMIN' &&
                    taskData &&
                    taskData.assignedTo && (
                      <div className="text-sm font-medium text-gray-500 my-10">
                        Obecnie przypisany do zadania:
                        <span
                          className="text-sm font-bold cursor-pointer"
                          onClick={() =>
                            openModalUserAssign()
                          }>{`${taskData?.assignedTo?.firstName} ${taskData?.assignedTo?.lastName}`}</span>
                      </div>
                    )}
                </div>
              </div>
              {taskData && !['FINISHED', 'REJECTED'].includes(taskData.status) && (
                <div className="absolute md:relative gap-2 m-auto left-0 right-0 bottom-0 p-4 flex justify-between max-w-[728px]">
                  <Button size="xl" typeBtn="warning" onClick={() => openModalRejected()}>
                    Odrzuć zadanie
                  </Button>
                  <Button size="xl" typeBtn="submit" onClick={() => openModalConfirm()}>
                    Zakończ zadanie
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {modalsState && (
        <DialogModal
          openStatus={modalsState}
          title={'Komentarze'}
          message={``}
          closeModal={closeModalComments}>
          <div className="">
            <form onSubmit={handleSubmit(onSubmitComment)}>
              <div className="mt-5 mb-10 ">
                <div className="max-h-96 overflow-scroll">
                  <div className="flex flex-col divide-y ">
                    {taskData.comments.map((comment) => {
                      return (
                        <div key={comment.id} className="flex flex-col p-4">
                          <div className="flex justify-between mb-2">
                            <p className="text-sm font-medium text-gray-900">{`${comment.author.firstName} ${comment.author.lastName}`}</p>
                            <p className="text-sm text-gray-500">{parseDate(comment.createdAt)}</p>
                          </div>
                          <div className="text-sm  text-gray-500">{comment.comment}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <Input
                  isTextarea
                  type="multiline"
                  className="w-full mt-6 resize-none"
                  mainName=" "
                  label="comment"
                  autoComplete="off"
                  register={register}
                  error={errors.comments?.message}
                  placeholder={'dodaj komentarz...'}
                />
              </div>
              <div className="flex justify-between ">
                <Button size="md" typeBtn="support" onClick={() => closeModalComments()}>
                  Anuluj
                </Button>

                <Button size="md" type="submit" typeBtn="submit">
                  Wyślij
                </Button>
              </div>
            </form>
          </div>
        </DialogModal>
      )}

      {modalsConfirmState && (
        <DialogModal
          openStatus={modalsConfirmState}
          title={'Potwierdzenie wykonania zadania?'}
          message={`Na pewno chcesz potwierdzić wykonanie zadania? Ta operacja nie będzie mogła być cofnięta.`}
          closeModal={closeModalConfirm}>
          <div className="">
            <form onSubmit={handleSubmit(onSubmitStatus)}>
              <div className="mt-5 mb-10 ">
                <div className="max-h-96 overflow-scroll">
                  <div className="flex flex-col divide-y "></div>
                </div>
              </div>
              <div className="flex justify-between ">
                <Button size="md" typeBtn="support" onClick={() => closeModalConfirm()}>
                  Anuluj
                </Button>
                <Button size="md" type="submit" typeBtn="submit">
                  Zatwierdź
                </Button>
              </div>
            </form>
          </div>
        </DialogModal>
      )}

      {modalsRejectedState && (
        <DialogModal
          openStatus={modalsRejectedState}
          title={'Odrzuć zadanie'}
          message={`Podaj przyczynę odrzucenia.`}
          closeModal={closeModalRejected}>
          <div className="">
            <form onSubmit={handleSubmit(onSubmitRejectStatus)}>
              <div className="mt-5 mb-10 ">
                <div className="max-h-96 overflow-scroll">
                  <div className="flex flex-col  p-2">
                    <Input
                      isTextarea
                      type="multiline"
                      className="w-full mt-6 resize-none"
                      mainName=" "
                      label="comment"
                      autoComplete="off"
                      required
                      register={register}
                      error={errors.comments?.message}
                      placeholder={'dodaj komentarz...'}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-between ">
                <Button size="md" typeBtn="support" onClick={() => closeModalRejected()}>
                  Anuluj
                </Button>
                <Button size="md" type="submit" typeBtn="submit">
                  Odrzuć
                </Button>
              </div>
            </form>
          </div>
        </DialogModal>
      )}
      {modalsUserAssign && (
        <DialogModal
          openStatus={modalsUserAssign}
          title={'Przypisany podwykonawca'}
          message={`Mozna przypisać jednego podwykonawcę do jednego zadania`}
          closeModal={closeModalUserAssign}>
          <div>
            <form onSubmit={handleSubmit(onSubmitAssign)}>
              <div className="mt-10 mb-40 ">
                <div className="text-sm font-medium text-gray-500 mb-10">
                  Obecnie przypisany:{' '}
                  <span className="text-sm font-bold">{`${taskData.assignedTo.firstName} ${taskData.assignedTo.lastName}`}</span>
                </div>
                {!filterUserList().length ? (
                  'Brak uzytkowników - podwykonawców'
                ) : (
                  <Controller
                    control={control}
                    name="assignedToId"
                    render={({ field: { onChange } }) => {
                      return (
                        <InputSelect
                          list={filterUserList()}
                          dataField="name"
                          className="mb-6 relative"
                          mainName="Przypisz"
                          register={register}
                          label="assignedToId"
                          error={errors.assignedToId}
                          onChange={(user) => onChange(user.id)}
                        />
                      );
                    }}
                  />
                )}
              </div>
              <div className="flex justify-between ">
                <Button size="md" typeBtn="support" onClick={() => closeModalUserAssign()}>
                  Anuluj
                </Button>

                <Button size="md" type="submit" typeBtn="submit" isSubmitting={isSubmitting}>
                  Przypisz
                </Button>
              </div>
            </form>
          </div>
        </DialogModal>
      )}
    </Layout>
  );
};

export default TaskDetailsSubcontractor;
