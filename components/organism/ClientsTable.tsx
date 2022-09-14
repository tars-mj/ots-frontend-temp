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
import { useMutation, useQueryClient } from 'react-query';
import { deleteClient } from '../../lib/api-routes/my-api';
import { getData } from 'lib/utils/fetch-wrapper';
import { EditButton } from '../atoms/EditButton';
import { SubmitHandler, useForm } from 'react-hook-form';
import Input from 'components/atoms/Input';
import { ChevronUpIcon, ChevronDownIcon, MapIcon } from '@heroicons/react/outline';
import { parseDate } from 'lib/utils/parse-date';
import { SortButton } from 'components/atoms/SortButton';
import Loading from 'components/moleculs/Loading';
import { useRouter } from 'next/router';
import { Badge } from 'components/atoms/Badge';
import { PaginationButton } from 'components/moleculs/PaginationButton';
import { paginationPageNumber } from 'lib/utils/pagination-page-number';

type InputsEditClient = {
  name: string;
  id: string;
  submitError: string;
};

type Client = {
  id: number;
  name: string;
  createdAt: string;
  localizations: [];
  author: {
    email: string;
    firstName: string;
    lastName: string;
  };
};

const ClientsTable = ({ data: apiResponse }) => {
  const [data, setTableData] = useState(() => []);
  // const [data, setTableData] = useState(() => [...mock]);
  // const [data, setTableData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [dataToDelete, setDataToDelete] = useState({});
  const [dataToEdit, setDataToEdit] = useState({});
  const queryClient = useQueryClient();

  const router = useRouter();

  const [sorting, setSorting] = useState<SortingState>([]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
    setError,
    clearErrors
  } = useForm<InputsEditClient>();

  useEffect(() => {
    setTableData(apiResponse);
  }, [apiResponse]);

  const columns = useMemo<ColumnDef<Client>[]>(
    () => [
      {
        header: 'ID',
        accessorKey: 'id',
        maxSize: 5
      },
      {
        header: 'Klient',
        accessorKey: 'name',
        maxSize: 45,
        cell: ({ getValue, row }) => getValue()
      },
      {
        header: 'Data utworzenia',
        accessorKey: 'createdAt',
        size: 20,
        cell: ({ row }) => parseDate(row.original?.createdAt)
      },
      {
        header: 'Autor',
        accessorKey: 'author',
        minSize: 20,
        cell: ({ row, getValue }) =>
          `${row.original?.author?.firstName} ${row.original?.author?.lastName}`
      },
      {
        header: () => (
          <div className="flex justify-center items-center w-full">
            <MapIcon className="h-5 w-5" aria-hidden="true" />
          </div>
        ),
        accessorKey: 'localizations',
        minSize: 10,

        cell: ({ row }) => {
          const number = row.original?.localizations.length;
          return (
            <Badge
              size="btn"
              color="gray"
              isButton="external"
              onClick={() => {
                const clientId = row.original.id;
                router.push(`/clients/${clientId}/localizations`);
              }}>{`${number}`}</Badge>
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
  };

  const openModalEdit = () => {
    setIsOpenEdit(true);
  };

  const mutationDelete = useMutation(deleteClient, {
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(['clientsData']);

      closeModalDelete();
    }
  });

  const mutationEdit = useMutation(editClient, {
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(['clientsData']);
      reset({ name: '' });
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
          message={`Czy na pewno chcesz usunąć klienta ${dataToDelete.name}?`}
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
          message={`Formularz edytowania danych klienta`}
          closeModal={closeModalEdit}>
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
                  placeholder={dataToEdit.name}
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
