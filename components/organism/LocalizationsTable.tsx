import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender,
  SortingState,
  getSortedRowModel,
  SortingFn,
  sortingFns,
  getPaginationRowModel
} from '@tanstack/react-table';
import { DeleteButton } from 'components/atoms/DeleteButton';
import Button from 'components/moleculs/Button';
import DialogModal from 'components/moleculs/DialogModal';
import {
  deleteLocalization,
  deletePhotoLocalization,
  editLocalization
} from 'lib/api-routes/my-api';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { EditButton } from '../atoms/EditButton';
import { SubmitHandler, useForm } from 'react-hook-form';
import Input from 'components/atoms/Input';
import { CameraIcon, CollectionIcon, UsersIcon, ClipboardListIcon } from '@heroicons/react/outline';
import { useRouter } from 'next/router';
import { Badge } from 'components/atoms/Badge';
import { SortButton } from 'components/atoms/SortButton';
import Loading from 'components/moleculs/Loading';
import { PaginationButton } from 'components/moleculs/PaginationButton';
import Gallery from './Gallery';
import UploadFileButton from './UploadFileButton';
import AreasTable from './AreasTable';

import { paginationPageNumber } from 'lib/utils/pagination-page-number';
import { dataQuery } from 'lib/constants/data-query';

type InputsEditLocalization = {
  address?: string;
  uniqNumber?: string;
  city?: string;
  usersOnLocalizations: [];
  photos: [];
  tasks: [];
  zipCode: string;
  province: string;
};

type Localization = {
  id: number;
  uniqNumber: string;
  client: {
    id: number;
    name: string;
  };
  areas: [];
  zipCode: string;
  province: string;
  address: string;
  city: string;
  photos: [];
  usersOnLocalizations: [];
  tasks: [];
  createdAt: string;
  assignedTo: [];
  author: {
    firstName: string;
    lastName: string;
  };
};

const LocalizationsTable = ({ data: apiResponse, isParent = false }) => {
  const [data, setTableData] = useState(() => []);
  const [isOpenAddPhoto, setIsOpenAddPhoto] = useState(false);
  const [isOpenAddUser, setIsOpenAddUser] = useState(false);
  // const [data, setTableData] = useState(() => [...mock]);
  // const [data, setTableData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isAreas, setIsAreas] = useState(false);
  const [areasData, setDataAreas] = useState({});
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [dataToDelete, setDataToDelete] = useState({});
  const [dataToEdit, setDataToEdit] = useState({});
  const [assignedData, setAssignedData] = useState([]);

  const dataStore = dataQuery[isParent ? 'isParent' : 'noParent'];

  const [photosData, setPhotosData] = useState<{ id: number | undefined }>();
  const queryClient = useQueryClient();

  const [sorting, setSorting] = useState<SortingState>([]);

  const router = useRouter();
  const query = router.query;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    control
  } = useForm<InputsEditLocalization>();

  useEffect(() => {
    setTableData(apiResponse);
  }, [apiResponse]);

  const columns = useMemo<ColumnDef<Localization>[]>(
    () => [
      {
        header: 'ID',
        accessorKey: 'id',
        maxSize: 5
      },
      {
        header: 'ID placówki',
        accessorKey: 'uniqNumber',
        maxSize: 10,
        cell: (info) => info.getValue()
      },
      {
        header: 'Miasto',
        maxSize: 20,
        accessorKey: 'city',
        cell: (info) => info.getValue()
      },
      {
        header: 'Adres',
        maxSize: 20,
        accessorKey: 'address',
        cell: (info) => info.getValue()
      },
      {
        header: 'Województwo',
        maxSize: 20,
        accessorKey: 'province',
        cell: (info) => info.getValue()
      },
      {
        header: 'Kod pocztowy',
        minSize: 40,
        accessorKey: 'zipCode',
        cell: (info) => info.getValue()
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
              onClick={() => openAreasModal(row.original?.id)}>{`${number}`}</Badge>
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
              color="gray"
              isButton
              onClick={() => openModalAddPhoto(row.original?.id)}>{`${number}`}</Badge>
          );
        }
      },
      {
        header: () => (
          <div className="flex justify-center items-center w-full">
            <ClipboardListIcon className="h-5 w-5" aria-hidden="true" />
          </div>
        ),
        accessorKey: 'tasks',
        maxSize: 10,
        cell: ({ row }) => {
          const finishedStatuses = ['CANCELED', 'FINISHED', 'ARCHIVED'];

          const finishedTasks = row.original?.tasks.filter((x) =>
            finishedStatuses.includes(x.status)
          ).length;

          return (
            <Badge
              size="btn"
              isButton
              color={finishedTasks === row.original?.tasks.length ? 'green' : 'red'}
              onClick={() => {
                const clientId = row.original?.clientId;
                const projectId = row.original?.projectId;
                const localizationId = row.original?.id;

                router.push(
                  `/clients/${clientId}/${
                    isParent ? '' : `projects/${projectId}/`
                  }localizations/${localizationId}/tasks`
                );
              }}>{`${finishedTasks}/${row.original?.tasks.length}`}</Badge>
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
          const number = row.original?.tasks.filter((x) => x.assignedTo).length;
          const users = row.original?.tasks
            .filter((x) => x.assignedTo)
            .map((user) => {
              return {
                assignedTo: user.assignedTo
              };
            });

          return isParent ? (
            <Badge size="btn" color="gray">
              {' '}
            </Badge>
          ) : (
            <Badge
              size="btn"
              color={number !== 0 ? 'green' : 'red'}
              isButton
              onClick={() => openModalAddUser(users)}>{`${number}`}</Badge>
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
                    setDataToDelete(row.original || {});
                    openModalDelete();
                  }}
                />

                <EditButton
                  onClick={() => {
                    setDataToEdit(row.original || {});
                    openModalEdit();
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
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  const closeModalDelete = () => {
    setIsOpen(false);
  };

  const openModalDelete = () => {
    setIsOpen(true);
  };

  const closeModalAddUser = () => {
    setIsOpenAddUser(false);
  };

  const openModalAddUser = (users) => {
    setAssignedData(users);
    setIsOpenAddUser(true);
  };

  const closeModalAddPhoto = () => {
    setIsOpenAddPhoto(false);
    setPhotosData({ id: undefined });
    reset();
  };

  const openModalAddPhoto = (id) => {
    setPhotosData({ id });
    setIsOpenAddPhoto(true);
  };

  const closeModalEdit = () => {
    setIsOpenEdit(false);
    setDataToEdit({});
    reset({ address: '', uniqNumber: '', city: '' });
    clearErrors();
  };

  const openModalEdit = () => {
    setIsOpenEdit(true);
  };

  const mutationDelete = useMutation(deleteLocalization, {
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries([dataStore.localizations]);

      closeModalDelete();
    }
  });

  const mutationEdit = useMutation(editLocalization, {
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries([dataStore.localizations]);
      reset({ address: '', uniqNumber: '', city: '', zipCode: '', province: '' });
      clearErrors();

      closeModalEdit();
    }
  });

  const mutationDeletePhoto = useMutation(deletePhotoLocalization, {
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries([dataStore.localizations]);
    }
  });

  const onSubmit: SubmitHandler<InputsEditLocalization> = async (data) => {
    const res = mutationEdit.mutate({
      ...data,
      localizationId: dataToEdit.id
    });
  };

  const onDeletePhoto = (id) => {
    mutationDeletePhoto.mutate({
      id
    });
  };

  const openAreasModal = (id) => {
    setDataAreas({ localizationId: id });
    setIsAreas(true);
  };

  const closeAreasModal = () => {
    setIsAreas(false);
    setDataAreas({ localizationId: undefined });
  };

  if (!data) {
    return <Loading />;
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
                      {headerGroup.headers.map((header) => (
                        <th
                          {...{
                            style: {
                              width: `${header.column.getSize()}%`
                            }
                          }}
                          scope="col"
                          key={header.id}
                          className="text-left text-sm font-semibold text-gray-900 py-3.5 pl-4 pr-4 hover:bg-gray-100 hover:transition-all">
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
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {tableInstance.getRowModel().rows.map((row) => (
                    <tr key={row.original.id} className="hover:bg-slate-50 transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className={`whitespace-nowrap py-4 pl-4 pr-4 text-sm text-gray-500 `}>
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
      <div className=" px-4 py-3 flex items-center justify-between  sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <a
            href="#"
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Previous
          </a>
          <a
            href="#"
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Next
          </a>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Strona{' '}
              <span className="font-medium">
                {tableInstance.getState().pagination.pageIndex + 1}
              </span>{' '}
              z <span className="font-medium">{tableInstance.getPageCount()}.</span> Wszystkich
              rekordów: <span className="font-medium">{apiResponse?.length}</span>.
            </p>
          </div>
          <div>
            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination">
              <PaginationButton
                type="first"
                disabled={!tableInstance.getCanPreviousPage()}
                onClick={() => tableInstance.setPageIndex(0)}
                className={undefined}
              />
              <PaginationButton
                type="prev"
                disabled={!tableInstance.getCanPreviousPage()}
                onClick={() => tableInstance.previousPage()}
                className={undefined}
              />
              {}
              {paginationPageNumber({
                allPages: tableInstance.getPageCount(),
                currentPage: tableInstance.getState().pagination.pageIndex
              }).map((page, i) => {
                return (
                  <PaginationButton
                    key={i}
                    type={
                      tableInstance.getState().pagination.pageIndex === page
                        ? 'isActivePage'
                        : 'page'
                    }
                    disabled={false}
                    onClick={() => {
                      tableInstance.setPageIndex(page);
                    }}
                    className={undefined}>
                    {page + 1}
                  </PaginationButton>
                );
              })}
              <PaginationButton
                type="next"
                disabled={!tableInstance.getCanNextPage()}
                onClick={() => tableInstance.nextPage()}
                className={undefined}
              />
              <PaginationButton
                type="last"
                disabled={!tableInstance.getCanNextPage()}
                onClick={() => tableInstance.setPageIndex(tableInstance.getPageCount() - 1)}
                className={undefined}
              />
            </nav>
          </div>
          <span className="flex items-center">
            <p className="text-gray-700 font-medium text-sm mr-6">Ilość wyników na stronie: </p>
            <select
              value={tableInstance.getState().pagination.pageSize}
              onChange={(e) => {
                tableInstance.setPageSize(Number(e.target.value));
              }}
              className="h-[38px]  p-1 w-28 relative inline-flex items-center px-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              {[10, 20, 30, 40, 50, 100].map((pageSize) => (
                <option key={pageSize} value={pageSize} className="font-medium">
                  {pageSize}
                </option>
              ))}
            </select>
          </span>
        </div>
      </div>

      {isOpen && (
        <DialogModal
          openStatus={isOpen}
          title={'Projekt'}
          message={`Czy na pewno chcesz usunąć lokalizację ${dataToDelete.uniqNumber}?`}
          closeModal={closeModalDelete}>
          <div className="">
            <div className="mt-10 mb-10"></div>
            <div className="flex justify-between ">
              <Button size="md" typeBtn="support" onClick={() => closeModalDelete()}>
                Anuluj
              </Button>

              <Button
                size="md"
                type="submit"
                typeBtn="warning"
                onClick={() => mutationDelete.mutate(dataToDelete)}>
                Usuń lokalizację
              </Button>
            </div>
          </div>
        </DialogModal>
      )}

      {isOpenEdit && (
        <DialogModal
          openStatus={isOpenEdit}
          title={'Edycja danych'}
          message={`Formularz edytowania danych lokalizacji`}
          closeModal={closeModalEdit}>
          <div className="">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mt-10 mb-10 s">
                <Input
                  className="w-full mb-6"
                  mainName="ID placówki"
                  label="uniqNumber"
                  register={register}
                  error={errors.uniqNumber}
                  autoComplete="off"
                  placeholder={dataToEdit.uniqNumber}
                />
                <Input
                  className="w-full mb-6"
                  mainName="Adres"
                  label="address"
                  register={register}
                  error={errors.address}
                  autoComplete="off"
                  placeholder={dataToEdit.address}
                />
                <Input
                  className="w-full mb-6"
                  mainName="Miasto"
                  label="city"
                  register={register}
                  error={errors.city}
                  autoComplete="off"
                  placeholder={dataToEdit.city}
                />

                <Input
                  className="w-full mb-6"
                  mainName="Kod pocztowy"
                  label="zipCode"
                  register={register}
                  error={errors.zipCode}
                  autoComplete="off"
                  placeholder={dataToEdit.zipCode}
                />
                <Input
                  className="w-full mb-6"
                  mainName="Województwo"
                  label="province"
                  register={register}
                  error={errors.province}
                  autoComplete="off"
                  placeholder={dataToEdit.province}
                />
              </div>
              <div className="flex justify-between ">
                <Button size="md" typeBtn="support" onClick={() => closeModalEdit()}>
                  Anuluj
                </Button>

                <Button size="md" type="submit" typeBtn="submit" isSubmitting={isSubmitting}>
                  Aktualizuj lokalizację
                </Button>
              </div>
            </form>
          </div>
        </DialogModal>
      )}

      {isOpenAddUser && (
        <DialogModal
          openStatus={isOpenAddUser}
          title={'Lista podwykonawców'}
          message={`Lista przypisanych podwykonawców do zadań w danej placówce`}
          closeModal={closeModalAddUser}>
          <div className="">
            <div className="mt-10 mb-10">
              {assignedData &&
                assignedData.map((x, i) => (
                  <div
                    key={i}
                    className="text-sm font-medium text-gray-500 ">{`${x.assignedTo.firstName} ${x.assignedTo.lastName} (${x.assignedTo.email})`}</div>
                ))}
            </div>
            <div className="flex justify-between ">
              <Button size="md" typeBtn="support" onClick={() => closeModalAddUser()}>
                Anuluj
              </Button>
            </div>
          </div>
        </DialogModal>
      )}

      {isOpenAddPhoto && (
        <DialogModal
          size="scale"
          openStatus={isOpenAddPhoto}
          title={'Zdjęcia wybranej lokalizacji'}
          message={`Zdjęcia przypisane do placówki`}
          closeModal={closeModalAddPhoto}>
          <div className="w-full">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mt-10 mb-10 s">
                <div className="">
                  <Gallery
                    onDelete={onDeletePhoto}
                    photos={
                      apiResponse.find(
                        (localize: { id: number | undefined }) => localize.id === photosData?.id
                      ).photos
                    }
                  />
                </div>
              </div>
              <div className="flex justify-between ">
                <Button size="md" typeBtn="support" onClick={() => closeModalAddPhoto()}>
                  Anuluj
                </Button>
                <UploadFileButton
                  dataQuery={dataStore.localizations}
                  localizationId={photosData?.id}
                />
              </div>
            </form>
          </div>
        </DialogModal>
      )}

      {isAreas && (
        <DialogModal
          size="scale"
          openStatus={isAreas}
          title={'Powierzchnie zwymiarowane'}
          message={``}
          closeModal={closeAreasModal}>
          <div className="">
            <div className="mt-5 mb-10 ">
              <div className=" ">
                <div>
                  <div className="max-h-[60vh] overflow-scroll p-1">
                    <AreasTable
                      dataQuery={dataStore.localizations}
                      localizationId={areasData.localizationId}
                      data={apiResponse.find((x) => x.id === areasData.localizationId).areas}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between ">
              <Button size="md" typeBtn="support" onClick={() => closeAreasModal()}>
                Anuluj
              </Button>
            </div>
          </div>
        </DialogModal>
      )}
    </>
  );
};

export default LocalizationsTable;
