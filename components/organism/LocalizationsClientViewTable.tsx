import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender,
  SortingState,
  getSortedRowModel,
  getPaginationRowModel
} from '@tanstack/react-table';
import Button from 'components/moleculs/Button';
import DialogModal from 'components/moleculs/DialogModal';
import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { CameraIcon, ClipboardListIcon } from '@heroicons/react/outline';
import { useRouter } from 'next/router';
import { Badge } from 'components/atoms/Badge';
import { SortButton } from 'components/atoms/SortButton';
import Loading from 'components/moleculs/Loading';
import { PaginationButton } from 'components/moleculs/PaginationButton';
import Gallery from './Gallery';

import { paginationPageNumber } from 'lib/utils/pagination-page-number';

type Localization = {
  id: number;
  uniqNumber: string;
  client: {
    id: number;
    name: string;
  };
  areas: [];
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

const LocalizationsClientViewTable = ({ data: apiResponse, isParent = false }) => {
  const [data, setTableData] = useState(() => []);
  const [isOpenAddPhoto, setIsOpenAddPhoto] = useState(false);
  const [photosData, setPhotosData] = useState<{ id: number | undefined }>();
  const [sorting, setSorting] = useState<SortingState>([]);

  const router = useRouter();
  const query = router.query;

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
        minSize: 40,
        accessorKey: 'address',
        cell: (info) => info.getValue()
      },

      {
        id: 'photos',
        header: () => (
          <div className="flex justify-center items-center w-full">
            <CameraIcon className="h-5 w-5" aria-hidden="true" />
          </div>
        ),
        accessorKey: 'photos',
        minSize: 10,
        cell: ({ row }) => {
          const number = row.original?.tasks
            .map((task) => task.photos)
            .flatMap((num) => num).length;
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
        id: 'tasks',
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
              color={finishedTasks === row.original?.tasks.length ? 'green' : 'red'}>
              {finishedTasks === row.original?.tasks.length ? 'Zakończone' : 'Realizacja'}
            </Badge>
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

  const closeModalAddPhoto = () => {
    setIsOpenAddPhoto(false);
    setPhotosData({ id: undefined });
  };

  const openModalAddPhoto = (id) => {
    setPhotosData({ id });
    setIsOpenAddPhoto(true);
  };

  const filterTaskPhotos = () => {
    const filterPhotos = apiResponse
      .find((localize: { id: number | undefined }) => localize.id === photosData?.id)
      .tasks.map((task) => task.photos)
      .flatMap((num) => num);
    return filterPhotos;
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

      {isOpenAddPhoto && (
        <DialogModal
          size="scale"
          openStatus={isOpenAddPhoto}
          title={'Zdjęcia wybranej lokalizacji'}
          message={`Zdjęcia z wykonanych zadań`}
          closeModal={closeModalAddPhoto}>
          <div className="w-full">
            <div className="mt-10 mb-10 s">
              <div className="">
                <Gallery photos={filterTaskPhotos()} />
              </div>
            </div>
            <div className="flex justify-between ">
              <Button size="md" typeBtn="support" onClick={() => closeModalAddPhoto()}>
                Anuluj
              </Button>
            </div>
          </div>
        </DialogModal>
      )}
    </>
  );
};

export default LocalizationsClientViewTable;
