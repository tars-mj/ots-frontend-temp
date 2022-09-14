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
import { editClient, fetchClients } from 'lib/api-routes/my-api';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { deleteUser, editUser } from '../../lib/api-routes/my-api';
import { getData } from 'lib/utils/fetch-wrapper';
import { EditButton } from '../atoms/EditButton';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import Input from 'components/atoms/Input';
import MySwitch from 'components/atoms/Switch';
import { role } from 'lib/constants/role';
import { parseDate } from 'lib/utils/parse-date';
import { SortButton } from 'components/atoms/SortButton';
import Loading from 'components/moleculs/Loading';
import { InputSelectRoles } from 'components/rbac';
import { withProcessManagerRoleAllow } from 'lib/hoc/withRole';
import { useAuth } from 'lib/context/auth.context';
import { PaginationButton } from 'components/moleculs/PaginationButton';
import { paginationPageNumber } from 'lib/utils/pagination-page-number';

const allowClientAssign = ['CLIENT_MANAGER', 'CLIENT_WORKER'];

type InputsEditClient = {
  firstName?: string;
  lastName?: string;
  email: string;
  role?: string;
  id: string;
  submitError: string;
};

type User = {
  id: number;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
  createdBy: {
    email: string;
    firstName: string;
    lastName: string;
  };
  clientManager: {
    name: string;
  };
};

const ClientsTable = ({ data: apiResponse }) => {
  const [data, setTableData] = useState(() => []);
  // const [data, setTableData] = useState(() => [...mock]);
  // const [data, setTableData] = useState([]);
  const { status, user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [dataToDelete, setDataToDelete] = useState({});
  const [dataToEdit, setDataToEdit] = useState({});
  const queryClient = useQueryClient();

  const {
    isLoading: isLoadingClients,
    error: errorLients,
    data: dataClients
  } = useQuery(['clientsData'], fetchClients, { enabled: withProcessManagerRoleAllow(user) });

  const [sorting, setSorting] = useState<SortingState>([]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    control
  } = useForm<InputsEditClient>();

  useEffect(() => {
    setTableData(apiResponse);
  }, [apiResponse]);

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        header: 'ID',
        accessorKey: 'id',
        maxSize: 5
      },
      {
        header: 'Uzytkownik',
        accessorKey: 'firstName',
        maxSize: 15,
        cell: ({ row }) => {
          return `${row.original?.firstName} ${row.original?.lastName}`;
        }
      },
      {
        header: 'Email/Login',
        maxSize: 20,
        accessorKey: 'email'
      },
      {
        header: 'Rola',
        maxSize: 15,
        accessorKey: 'role'
      },
      {
        header: 'Klient',
        maxSize: 15,
        accessorKey: 'clientManager',
        cell: ({ row }) => {
          return `${row.original?.clientManager?.name || 'Brak'}`;
        }
      },
      {
        header: 'Autor',
        accessorKey: 'author',
        maxSize: 15,
        cell: ({ row }) =>
          `${row.original?.createdBy?.firstName} ${row.original?.createdBy?.lastName}`
      },
      {
        header: 'Data utworzenia',
        accessorKey: 'createdAt',
        size: 15,
        cell: ({ row }) => parseDate(row.original?.createdAt)
      },
      {
        header: 'Aktywność',
        accessorKey: 'isActive',
        size: 15,
        cell: ({ row }) => (
          <MySwitch
            isActive={row.original?.isActive}
            mutate={(e) => mutationEdit.mutate({ isActive: e, id: row.original?.id })}
          />
        )
      },
      {
        header: ' ',
        minSize: 5,
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

  const columnVisibility = () => {
    if (user.role !== 'PROCESS_MANAGER') {
      return {
        role: false,
        clientManager: false,
        author: false
      };
    }
  };

  const tableInstance = useReactTable({
    data,
    columns,

    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting,
      columnVisibility: columnVisibility()
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel()
  });

  const closeModalDelete = () => {
    setIsOpen(false);
  };

  const openModalDelete = () => {
    setIsOpen(true);
  };

  const closeModalEdit = () => {
    setIsOpenEdit(false);
    setDataToEdit({});
    reset({ email: '', role: '', firstName: '', lastName: '' });
    clearErrors();
  };

  const openModalEdit = () => {
    setIsOpenEdit(true);
  };

  const mutationDelete = useMutation(deleteUser, {
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(['usersData']);

      closeModalDelete();
    }
  });

  const mutationEdit = useMutation(editUser, {
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(['usersData']);
      reset({ email: '', role: '', firstName: '', lastName: '' });
      clearErrors();

      closeModalEdit();
    }
  });

  const onSubmit: SubmitHandler<InputsEditClient> = async (data) => {
    const res = mutationEdit.mutate({ ...data, id: dataToEdit.id });
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
          title={'Klient'}
          message={`Czy na pewno chcesz usunąć uzytkownika ${dataToDelete.email}?`}
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
                onClick={() => mutationDelete.mutate(dataToDelete.id)}>
                Usuń klienta
              </Button>
            </div>
          </div>
        </DialogModal>
      )}

      {isOpenEdit && (
        <DialogModal
          openStatus={isOpenEdit}
          title={'Edycja danych'}
          message={`Formularz edytowania danych uzytkownika`}
          closeModal={closeModalEdit}>
          <div className="">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mt-10 mb-10 s">
                <Controller
                  control={control}
                  name="role"
                  render={({ field: { onChange, value } }) => (
                    <InputSelectRoles
                      list={role}
                      dataField="name"
                      className="mb-6"
                      mainName="Rola uzytkownika"
                      register={register}
                      label="role"
                      error={errors.role}
                      onChange={(role) => onChange(role.name)}
                      value={dataToEdit.role}
                    />
                  )}
                />
                {allowClientAssign.includes(watch().role) && (
                  <Controller
                    control={control}
                    name="clientManagerId"
                    render={({ field: { onChange } }) => (
                      <InputSelectRoles
                        list={dataClients}
                        dataField="name"
                        className="mb-6"
                        mainName="Przypisz klienta"
                        register={register}
                        label="clientManagerId"
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
                  error={errors.firstName}
                  autoComplete="off"
                  placeholder={dataToEdit.firstName}
                />
                <Input
                  className="w-full mb-6"
                  mainName="Nazwisko"
                  label="lastName"
                  register={register}
                  error={errors.lastName}
                  autoComplete="off"
                  placeholder={dataToEdit.lastName}
                />
                <Input
                  className="w-full mb-6"
                  mainName="Email / login"
                  label="email"
                  register={register}
                  error={errors.email}
                  autoComplete="off"
                  placeholder={dataToEdit.email}
                />
              </div>
              <div className="flex justify-between ">
                <Button size="md" typeBtn="support" onClick={() => closeModalEdit()}>
                  Anuluj
                </Button>

                <Button size="md" type="submit" typeBtn="submit" isSubmitting={isSubmitting}>
                  Aktualizuj klienta
                </Button>
              </div>
            </form>
          </div>
        </DialogModal>
      )}
    </>
  );
};

export default ClientsTable;
