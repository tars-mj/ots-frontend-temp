import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender,
  SortingState,
  getSortedRowModel
} from '@tanstack/react-table';
import { DeleteButton } from 'components/atoms/DeleteButton';
import Button from 'components/moleculs/Button';
import DialogModal from 'components/moleculs/DialogModal';
import {
  createComment,
  deletePhotoTask,
  deleteTask,
  editClient,
  editTask,
  fetchClients,
  fetchUsers
} from 'lib/api-routes/my-api';
import { useEffect, useMemo, useReducer, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { deleteClient } from '../../lib/api-routes/my-api';
import { getData } from 'lib/utils/fetch-wrapper';
import { EditButton } from '../atoms/EditButton';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import Input from 'components/atoms/Input';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import {
  CameraIcon,
  ChatIcon,
  ClockIcon,
  CollectionIcon,
  ExclamationIcon,
  UsersIcon
} from '@heroicons/react/outline';
import { parseDate } from 'lib/utils/parse-date';
import { SortButton } from 'components/atoms/SortButton';
import Loading from 'components/moleculs/Loading';
import { useRouter } from 'next/router';
import { Badge } from 'components/atoms/Badge';
import { capitalize } from 'lib/utils/capitalize';
import InputSelect from 'components/atoms/InputSelect';
import { statusList } from 'lib/constants/status';
import { classNames } from 'lib/utils/class-names';
import Gallery from './Gallery';
import UploadFileButton from './UploadFileButton';
import MySwitch from 'components/atoms/Switch';
import { AcceptButton } from 'components/atoms/AcceptButton';

import CreateArea from './CreateArea';
import AreasTable from './AreasTable';
import { dataQuery } from 'lib/constants/data-query';

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

type ModalState = {
  isPhotos: boolean;
  isComments: boolean;
  isLogs: boolean;
  isAreas: boolean;
  isStatus: boolean;
  isDelete: boolean;
  isEdit: boolean;
  isDescription: boolean;
  isUserAssign: boolean;
  dataToEdit?: InputsEditTask;
};

type ActionModalReducer = {
  type:
    | 'IS_PHOTOS'
    | 'IS_COMMENTS'
    | 'IS_AREAS'
    | 'IS_STATUS'
    | 'IS_LOGS'
    | 'IS_EDIT'
    | 'IS_DELETE'
    | 'IS_DESCRIPTION'
    | 'IS_USER_ASSIGN'
    | 'OFF_ALL_MODALS';
  payload?: object;
};

const validationSchema = yup.object({
  plannedDateRealize: yup.date().typeError('Wpisz wg formatu 1-1-2022')
});

const initialStateModal: ModalState = {
  isPhotos: false,
  isComments: false,
  isLogs: false,
  isAreas: false,
  isStatus: false,
  isDelete: false,
  isEdit: false,
  isDescription: false,
  isUserAssign: false,
  dataToEdit: {}
};

function modalReducer(state: ModalState, action: ActionModalReducer) {
  switch (action.type) {
    case 'IS_PHOTOS':
      return { ...state, isPhotos: !state.isPhotos, dataToEdit: action.payload };
    case 'IS_COMMENTS':
      return { ...state, isComments: !state.isComments, dataToEdit: action.payload };
    case 'IS_LOGS':
      return { ...state, isLogs: !state.isLogs, dataToEdit: action.payload };
    case 'IS_AREAS':
      return { ...state, isAreas: !state.isAreas, dataToEdit: action.payload };
    case 'IS_STATUS':
      return { ...state, isStatus: !state.isStatus, dataToEdit: action.payload };
    case 'IS_EDIT':
      return { ...state, isEdit: !state.isEdit, dataToEdit: action.payload };
    case 'IS_DELETE':
      return { ...state, isDelete: !state.isDelete, dataToEdit: action.payload };
    case 'IS_DESCRIPTION':
      return { ...state, isDescription: !state.isDescription, dataToEdit: action.payload };
    case 'IS_USER_ASSIGN':
      return { ...state, isUserAssign: !state.isUserAssign, dataToEdit: action.payload };
    case 'OFF_ALL_MODALS':
      return { ...initialStateModal };
    default:
      return { ...initialStateModal };
  }
}

const TaskTable = ({ data: apiResponse, isParent = false }) => {
  const [data, setTableData] = useState(() => []);

  const dataStore = dataQuery[isParent ? 'isParent' : 'noParent'];

  useEffect(() => {
    setTableData(apiResponse);
  }, [apiResponse]);

  const { isLoading, error, data: dataUsers } = useQuery(['usersData'], fetchUsers);
  const queryClient = useQueryClient();

  const router = useRouter();
  const query = router.query;

  const [sorting, setSorting] = useState<SortingState>([]);

  //modal state
  const [modalsState, dispatch] = useReducer(modalReducer, initialStateModal);

  const changeModalAll = (dataChange = {}) => {
    reset();
    dispatch({ type: 'OFF_ALL_MODALS', payload: dataChange });
  };

  const changeModalPhotos = (dataChange = {}) => {
    reset();
    dispatch({ type: 'IS_PHOTOS', payload: dataChange });
  };

  const changeModalComments = (dataChange = {}) => {
    reset();
    dispatch({ type: 'IS_COMMENTS', payload: dataChange });
  };

  const changeModalLogs = (dataChange = {}) => {
    reset();
    dispatch({ type: 'IS_LOGS', payload: dataChange });
  };

  const changeModalAreas = (dataChange = {}) => {
    reset();
    dispatch({ type: 'IS_AREAS', payload: dataChange });
  };

  const changeModalStatus = (dataChange = {}) => {
    reset();
    dispatch({ type: 'IS_STATUS', payload: dataChange });
  };

  const changeModalEdit = (dataChange = {}) => {
    reset();
    dispatch({ type: 'IS_EDIT', payload: dataChange });
  };

  const changeModalDelete = (dataChange = {}) => {
    reset();
    dispatch({ type: 'IS_DELETE', payload: dataChange });
  };

  const changeModalDescription = (dataChange = {}) => {
    reset();
    dispatch({ type: 'IS_DESCRIPTION', payload: dataChange });
  };

  const changeModalUserAssign = (dataChange = {}) => {
    reset();
    dispatch({ type: 'IS_USER_ASSIGN', payload: dataChange });
  };

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    control
  } = useForm<InputsEditTask>({
    //resolver: yupResolver(validationSchema)
    resolver: async (data, context, options) => {
      let dataCorrect = {};
      for (const key in data) {
        dataCorrect = { ...dataCorrect, [key]: data[key] === '' ? undefined : data[key] };
      }

      // console.log('validation result', await yupResolver(validationSchema)(data, context, options));
      return yupResolver(validationSchema)(dataCorrect, context, options);
    }
  });

  const columns = useMemo<ColumnDef<Task>[]>(
    () => [
      {
        header: 'ID',
        accessorKey: 'id',
        maxSize: 5
      },
      {
        header: 'Tytuł',
        accessorKey: 'title',
        maxSize: 10,
        cell: ({ getValue, row }) => getValue()
      },
      {
        header: 'Opis',
        accessorKey: 'description',
        maxSize: 20,
        cell: ({ row }) => {
          return (
            <p
              className="text-ellipsis whitespace-nowrap overflow-hidden w-[20ch] cursor-pointer hover:contrast-75 h-full"
              onClick={() => changeModalDescription(row.original)}>
              {row.original?.description}
            </p>
          );
        }
      },
      {
        header: 'Data realizacji',
        accessorKey: 'plannedDateRealize',
        size: 10,
        cell: ({ row }) => parseDate(row.original?.plannedDateRealize)
      },
      {
        header: 'Autor',
        accessorKey: 'author',
        minSize: 30,
        cell: ({ row, getValue }) =>
          `${row.original?.author?.firstName} ${row.original?.author?.lastName}`
      },
      {
        header: 'Status',
        accessorKey: 'status',
        minSize: 10,
        cell: ({ row }) => {
          return (
            <Badge
              size="btn"
              isButton
              status={row.original?.status.toUpperCase()}
              onClick={() => changeModalStatus(row.original)}>
              {capitalize(row.original?.status)}
            </Badge>
          );
        }
      },
      {
        header: () => (
          <div className="flex justify-center items-center w-full">
            <UsersIcon className="h-5 w-5" aria-hidden="true" />
          </div>
        ),
        accessorKey: 'assignedTo',
        minSize: 10,
        cell: ({ row }) => {
          const number = row.original?.assignedTo ? 1 : 0;
          return isParent ? (
            <Badge size="btn" color="gray">
              {' '}
            </Badge>
          ) : (
            <Badge
              size="btn"
              color={number !== 0 ? 'green' : 'red'}
              isButton
              onClick={() => changeModalUserAssign(row.original)}>{`${number}`}</Badge>
          );
        }
      },
      {
        header: () => (
          <div className="flex justify-center items-center w-full">
            <CameraIcon className="h-5 w-5" aria-hidden="true" />
          </div>
        ),
        accessorKey: 'photos',
        minSize: 10,
        cell: ({ row }) => {
          const number = row.original?.photos.length;
          return (
            <Badge
              size="btn"
              color={number !== 0 ? 'green' : 'red'}
              isButton
              onClick={() => changeModalPhotos(row.original)}>{`${number}`}</Badge>
          );
        }
      },
      {
        header: () => (
          <div className="flex justify-center items-center w-full">
            <ChatIcon className="h-5 w-5" aria-hidden="true" />
          </div>
        ),
        accessorKey: 'comments',
        minSize: 10,
        cell: ({ row }) => {
          const number = row.original?.comments.length;
          return (
            <Badge
              size="btn"
              color="gray"
              isButton
              onClick={() => changeModalComments(row.original)}>{`${number}`}</Badge>
          );
        }
      },
      {
        header: () => (
          <div className="flex justify-center items-center w-full">
            <ClockIcon className="h-5 w-5" aria-hidden="true" />
          </div>
        ),
        accessorKey: 'taskLogs',
        minSize: 10,

        cell: ({ row }) => {
          const number = row.original?.taskLogs.length;
          return (
            <Badge
              size="btn"
              color="gray"
              isButton
              onClick={() => changeModalLogs(row.original?.taskLogs)}>{`${number}`}</Badge>
          );
        }
      },
      {
        header: () => (
          <div className="flex justify-center items-center w-full">
            <CollectionIcon className="h-5 w-5" aria-hidden="true" />
          </div>
        ),
        accessorKey: 'areas',
        minSize: 10,
        cell: ({ row }) => {
          const number = row.original?.areas.length;

          return (
            <Badge
              size="btn"
              color="gray"
              isButton
              onClick={() => changeModalAreas(row.original)}>{`${number}`}</Badge>
          );
        }
      },

      {
        header: ' ',
        minSize: 10,
        cell: ({ row }) => {
          return (
            <span className="flex justify-end ">
              <span className="flex w-20 justify-between ">
                <DeleteButton
                  onClick={() => {
                    changeModalDelete(row.original);
                  }}
                />
                <EditButton
                  onClick={() => {
                    changeModalEdit(row.original);
                  }}
                />
              </span>
            </span>
          );
        }
      }
    ],
    []
  );

  const tableInstance = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel()
  });

  const mutationDelete = useMutation(deleteTask, {
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries([dataStore.tasks]);

      changeModalDelete();
    }
  });

  const mutationEdit = useMutation(editTask, {
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries([dataStore.tasks]);
      queryClient.invalidateQueries([dataStore.layouts]);

      reset();
      clearErrors();

      changeModalAll();
    }
  });

  const mutationComment = useMutation(createComment, {
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries([dataStore.tasks]);

      reset();
      clearErrors();
    }
  });

  const onSubmitComment: SubmitHandler<InputsEditTask> = async (data) => {
    const { clientId, projectId, localizationId } = query;
    const taskId = `${modalsState.dataToEdit.id}`;
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

  const onSubmit: SubmitHandler<InputsEditTask> = async (data) => {
    const res = mutationEdit.mutate({
      data,
      ids: {
        clientId: modalsState.dataToEdit.clientId,
        projectId: modalsState.dataToEdit.projectId,
        localizationId: modalsState.dataToEdit.localizationId,
        taskId: modalsState.dataToEdit.id
      }
    });
  };

  const filterDataForComments = () => {
    return data.find((x) => x.id === modalsState.dataToEdit.id);
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

  const findAssignedUser = (id) => {
    const task = apiResponse.find((x) => x.id === id);
    return task
      ? `${task?.assignedTo?.firstName} ${task?.assignedTo?.lastName}`
      : 'brak przypisania';
  };

  const mutationDeletePhoto = useMutation(deletePhotoTask, {
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries([dataStore.tasks]);
    }
  });

  const onDeletePhoto = (id) => {
    mutationDeletePhoto.mutate({
      id
    });
  };

  if (!data) {
    return <Loading />;
  }

  if (data.length === 0) {
    return <div></div>;
  }

  return (
    <>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  {tableInstance.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <th
                            {...{
                              style: {
                                width: `${header.column.getSize()}%`
                              }
                            }}
                            scope="col"
                            key={header.id}
                            className="text-left text-sm font-semibold text-gray-900 py-3.5 pl-4 pr-4  hover:bg-gray-100 hover:transition-all">
                            <div
                              {...{
                                className: header.column.getCanSort()
                                  ? 'cursor-pointer select-none flex'
                                  : '',
                                onClick: header.column.getToggleSortingHandler()
                              }}>
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {{
                                asc: <SortButton direction="asc" />,
                                desc: <SortButton direction="desc" />
                              }[header.column.getIsSorted() as string] ?? null}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {tableInstance.getRowModel().rows.map((row) => (
                    <tr key={row.original.id} className="hover:bg-slate-50 transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="whitespace-nowrap py-4 pl-4 pr-4 text-sm text-gray-500 ">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {modalsState.isDelete && (
        <DialogModal
          openStatus={modalsState.isDelete}
          title={'Klient'}
          message={`Czy na pewno chcesz usunąć zadanie?`}
          closeModal={changeModalDelete}>
          <div className="">
            <div className="mt-10 mb-10"></div>
            <div className="flex justify-between ">
              <Button size="md" typeBtn="support" onClick={() => changeModalDelete()}>
                Anuluj
              </Button>

              <Button
                size="md"
                type="submit"
                typeBtn="warning"
                onClick={() => mutationDelete.mutate(modalsState.dataToEdit)}>
                Usuń zadanie
              </Button>
            </div>
          </div>
        </DialogModal>
      )}

      {modalsState.isEdit && (
        <DialogModal
          openStatus={modalsState.isEdit}
          title={'Edycja danych'}
          message={`Formularz edytowania zadania`}
          closeModal={changeModalEdit}>
          <div className="">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mt-10 mb-10 s">
                <Input
                  className="w-full mb-6"
                  mainName="Tytuł"
                  label="title"
                  register={register}
                  error={errors.title}
                  autoComplete="off"
                  placeholder={modalsState.dataToEdit.title}
                />
                <Input
                  className="w-full mb-6"
                  mainName="Opis"
                  label="description"
                  register={register}
                  error={errors.description}
                  autoComplete="off"
                  placeholder={modalsState.dataToEdit.description}
                />
                <Input
                  className="w-full mb-6"
                  mainName="Data realizacji"
                  label="plannedDateRealize"
                  register={register}
                  error={errors.plannedDateRealize?.message}
                  autoComplete="off"
                  type="date"
                  placeholder={parseDate(modalsState.dataToEdit.plannedDateRealize)}
                />
                <div className="flex flex-row justify-between text-sm font-medium text-primary-blue-400 items-center">
                  <div>Pola z powierzchniami</div>

                  <Controller
                    control={control}
                    name="isAllowAreas"
                    render={({ field: { onChange } }) => (
                      <MySwitch
                        isActive={modalsState.dataToEdit.isAllowAreas}
                        mutate={(e) => onChange(e)}
                        register={register}
                      />
                    )}
                  />
                </div>
              </div>
              <div className="flex justify-between ">
                <Button size="md" typeBtn="support" onClick={() => changeModalEdit()}>
                  Anuluj
                </Button>

                <Button size="md" type="submit" typeBtn="submit" isSubmitting={isSubmitting}>
                  Aktualizuj zadanie
                </Button>
              </div>
            </form>
          </div>
        </DialogModal>
      )}

      {modalsState.isStatus && (
        <DialogModal
          openStatus={modalsState.isStatus}
          title={'Status zadania'}
          message={`Obecny status zadania: ${modalsState.dataToEdit.status}`}
          closeModal={changeModalStatus}>
          <div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mt-10 mb-10 ">
                <Controller
                  control={control}
                  name="status"
                  render={({ field: { onChange } }) => {
                    return (
                      <InputSelect
                        list={statusList}
                        dataField="name"
                        className="mb-6"
                        mainName="Status"
                        register={register}
                        label="status"
                        error={errors.status}
                        onChange={(status) => onChange(status.name)}
                        value={modalsState.dataToEdit.status}
                      />
                    );
                  }}
                />
              </div>
              <div className="flex justify-between ">
                <Button size="md" typeBtn="support" onClick={() => changeModalStatus()}>
                  Anuluj
                </Button>

                <Button size="md" type="submit" typeBtn="submit" isSubmitting={isSubmitting}>
                  Zmień
                </Button>
              </div>
            </form>
          </div>
        </DialogModal>
      )}

      {modalsState.isLogs && (
        <DialogModal
          size="scale"
          openStatus={modalsState.isLogs}
          title={'Log zadania'}
          message={``}
          closeModal={changeModalLogs}>
          <div className="">
            <div className="max-h-96 overflow-scroll">
              <div className="mb-10">
                <div className="flow-root">
                  <ul role="list" className="-mb-8 ml-16 mr-8">
                    {modalsState.isLogs &&
                      modalsState.dataToEdit.map((event, eventIdx) => (
                        <li key={event.id}>
                          <div className="relative pb-8">
                            {eventIdx !== modalsState.dataToEdit.length - 1 ? (
                              <span
                                className="absolute top-4 left-28 -ml-px h-full w-0.5 bg-gray-200"
                                aria-hidden="true"
                              />
                            ) : null}
                            <div className="relative flex space-x-3">
                              <div>
                                <span
                                  className={classNames(
                                    'h-8 w-32 rounded-full flex items-center justify-end ring-8 ring-white'
                                  )}>
                                  <Badge
                                    size="btn"
                                    status={event.status}>{`${event.status}`}</Badge>
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    <span className="font-medium text-gray-900">
                                      {`${event.author.firstName} ${event.author.lastName}`}
                                    </span>
                                  </p>
                                </div>
                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                  <time dateTime={event.createdAt}>
                                    {parseDate(event.createdAt)}
                                  </time>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <Button size="md" typeBtn="support" onClick={() => changeModalLogs()}>
                Anuluj
              </Button>
            </div>
          </div>
        </DialogModal>
      )}

      {modalsState.isComments && (
        <DialogModal
          openStatus={modalsState.isComments}
          title={'Komentarze'}
          message={``}
          closeModal={changeModalComments}>
          <div className="">
            <form onSubmit={handleSubmit(onSubmitComment)}>
              <div className="mt-5 mb-10 ">
                <div className="max-h-96 overflow-scroll">
                  <div className="flex flex-col divide-y ">
                    {modalsState.isComments &&
                      filterDataForComments().comments.map((comment) => {
                        return (
                          <div key={comment.id} className="flex flex-col p-4">
                            <div className="flex justify-between mb-2">
                              <p className="text-sm font-medium text-gray-900">{`${comment.author.firstName} ${comment.author.lastName}`}</p>
                              <p className="text-sm text-gray-500">
                                {parseDate(comment.createdAt)}
                              </p>
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
                  register={register}
                  error={errors.comments?.message}
                  autoComplete="off"
                  placeholder={'dodaj komentarz...'}
                />
              </div>
              <div className="flex justify-between ">
                <Button size="md" typeBtn="support" onClick={() => changeModalComments()}>
                  Anuluj
                </Button>

                <Button size="md" type="submit" typeBtn="submit" isSubmitting={isSubmitting}>
                  Wyślij
                </Button>
              </div>
            </form>
          </div>
        </DialogModal>
      )}

      {modalsState.isDescription && (
        <DialogModal
          openStatus={modalsState.isDescription}
          title={modalsState.dataToEdit.title}
          message={``}
          closeModal={changeModalDescription}>
          <div className="">
            <div className="mt-5 mb-10 ">
              <div className="max-h-96 overflow-scroll">
                <div className="flex flex-col divide-y ">{modalsState.dataToEdit.description}</div>
              </div>
            </div>
            <div className="flex justify-between ">
              <Button size="md" typeBtn="support" onClick={() => changeModalDescription()}>
                Anuluj
              </Button>
            </div>
          </div>
        </DialogModal>
      )}

      {modalsState.isAreas && (
        <DialogModal
          size="scale"
          openStatus={modalsState.isAreas}
          title={'Powierzchnie do zwymiarowania'}
          message={``}
          closeModal={changeModalAreas}>
          <div className="">
            <div className="mt-5 mb-10 ">
              <div className=" ">
                {!modalsState.dataToEdit.isAllowAreas ? (
                  <div className="flex flex-row border-solid border-[1px] rounded-md border-red-600 bg-red-50 p-4 mb-4">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <ExclamationIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="ml-4 text-sm font-medium text-red-800 flex items-center">
                      Mozliwość dodawania informacji o powierzchniach jest wyłączona.
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="p-1 mb-4">
                      <CreateArea
                        taskId={modalsState.dataToEdit.id}
                        localizationId={Number(query.localizationId)}
                        dataQuery={dataStore.tasks}
                      />
                    </div>
                    <div className="max-h-[60vh] overflow-scroll p-1">
                      <AreasTable
                        dataQuery={dataStore.tasks}
                        taskId={modalsState.dataToEdit.id}
                        data={apiResponse.find((x) => x.id === modalsState.dataToEdit.id).areas}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between ">
              <Button size="md" typeBtn="support" onClick={() => changeModalAreas()}>
                Anuluj
              </Button>
            </div>
          </div>
        </DialogModal>
      )}

      {modalsState.isUserAssign && (
        <DialogModal
          openStatus={modalsState.isUserAssign}
          title={'Przypisany podwykonawca'}
          message={`Mozna przypisać jednego podwykonawcę do jednego zadania`}
          closeModal={changeModalUserAssign}>
          <div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mt-10 mb-40 ">
                <div className="text-sm font-medium text-gray-500 mb-10">
                  Obecnie przypisany:{' '}
                  <span className="text-sm font-bold">
                    {findAssignedUser(modalsState.dataToEdit.id)}
                  </span>
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
                <Button size="md" typeBtn="support" onClick={() => changeModalUserAssign()}>
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
      {modalsState.isPhotos && (
        <DialogModal
          size="scale"
          openStatus={modalsState.isPhotos}
          title={'Zdjęcia do zadania'}
          message={`Zdjęcia przypisane do zadania`}
          closeModal={changeModalPhotos}>
          <div className="w-full">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mt-10 mb-10 ">
                <div className="">
                  <Gallery
                    onDelete={onDeletePhoto}
                    photos={
                      apiResponse.find(
                        (task: { id: number | undefined }) => task.id === modalsState?.dataToEdit.id
                      ).photos
                    }
                  />
                </div>
              </div>
              <div className="flex justify-between ">
                <Button size="md" typeBtn="support" onClick={() => changeModalPhotos()}>
                  Anuluj
                </Button>
                <UploadFileButton
                  dataQuery={dataStore.tasks}
                  localizationId={query.localizationId}
                  taskId={modalsState?.dataToEdit.id}
                />
              </div>
            </form>
          </div>
        </DialogModal>
      )}
    </>
  );
};

export default TaskTable;
