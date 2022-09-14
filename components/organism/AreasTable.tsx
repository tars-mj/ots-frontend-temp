import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable
} from '@tanstack/react-table';
import { DeleteButton } from 'components/atoms/DeleteButton';
import { EditButton } from 'components/atoms/EditButton';
import { SortButton } from 'components/atoms/SortButton';
import { deleteArea } from 'lib/api-routes/my-api';
import { parseDate } from 'lib/utils/parse-date';
import { useRouter } from 'next/router';
import { useState, useEffect, useMemo } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { AcceptButton } from '../atoms/AcceptButton';

declare module '@tanstack/react-table' {
  interface TableMeta {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
  }
}

type Area = {
  id: number;
  name: string;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
};

type AreasTableType = {
  apiResponse: any;
  taskId?: number;
  localizationId?: number;
  dataQuery:
    | 'allTasksData'
    | 'tasksData'
    | 'localizationsParentData'
    | 'localizationsInProjectData';
};

const AreasTable = ({
  data: apiResponse,
  taskId = undefined,
  localizationId = undefined,
  dataQuery
}: AreasTableType) => {
  const [data, setTableData] = useState(() => []);
  const [sorting, setSorting] = useState<SortingState>([]);
  const router = useRouter();
  const query = router.query;

  useEffect(() => {
    const dataFlat = taskId ? apiResponse.map((x) => x.area) : apiResponse;
    setTableData(dataFlat);
  }, [apiResponse]);

  const columns = useMemo<ColumnDef<Area>[]>(
    () => [
      {
        header: 'ID',
        accessorKey: 'id',
        maxSize: 5,
        cell: ({ getValue, row }) => row.original?.id
      },
      {
        header: 'Nazwa',
        accessorKey: 'name',
        maxSize: 25,
        cell: ({ getValue, row }) => row.original?.name
      },
      {
        header: 'Szerokość',
        accessorKey: 'width',
        maxSize: 25,
        cell: ({ getValue, row }) => row.original?.width
      },
      {
        header: 'Wysokość',
        accessorKey: 'height',
        maxSize: 25,
        cell: ({ getValue, row }) => row.original?.height
      },
      {
        header: 'Utworzono',
        accessorKey: 'createdAt',
        maxSize: 25,
        cell: ({ getValue, row }) => parseDate(row.original?.createdAt)
      },
      // {
      //   header: 'Aktualizacja',
      //   accessorKey: 'updatedAt',
      //   maxSize: 45,
      //   cell: ({ getValue, row }) => parseDate(row.original?.updatedAt)
      // },
      {
        header: ' ',
        minSize: 10,
        cell: ({ row }) => {
          return (
            <span className="flex justify-end ">
              <span className="flex w-20 justify-end ">
                <DeleteButton
                  onClick={() => {
                    deleteAreaData(row.original?.id);
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

  const queryClient = useQueryClient();

  const mutationDelete = useMutation(deleteArea, {
    onSuccess: () => {
      // Invalidate and refetch

      queryClient.invalidateQueries([dataQuery]);
    }
  });

  const deleteAreaData = (areaId) => {
    mutationDelete.mutate({ areaId });
  };

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

  return (
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
  );
};

export default AreasTable;
