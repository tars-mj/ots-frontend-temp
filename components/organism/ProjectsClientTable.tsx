import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender,
  SortingState,
  getSortedRowModel
} from '@tanstack/react-table';

import { useEffect, useMemo, useState } from 'react';
import { MapIcon } from '@heroicons/react/outline';
import { parseDate } from 'lib/utils/parse-date';
import { useRouter } from 'next/router';
import { SortButton } from 'components/atoms/SortButton';
import Loading from 'components/moleculs/Loading';
import { Badge } from 'components/atoms/Badge';

type Project = {
  id: number;
  projectName: string;
  client: {
    id: number;
    name: string;
  };
  startDate: string;
  deadline: string;
  createdAt: string;
  isActive: boolean;
  tasks: [];
  _count: {
    tasks: number;
  };
  localizations: [];
  author: {
    firstName: string;
    lastName: string;
  };
};

const ProjectsClientTable = ({ data: apiResponse }) => {
  const [data, setTableData] = useState(() => []);

  const [sorting, setSorting] = useState<SortingState>([]);
  const router = useRouter();

  useEffect(() => {
    setTableData(apiResponse);
  }, [apiResponse]);

  const columns = useMemo<ColumnDef<Project>[]>(
    () => [
      {
        header: 'ID',
        accessorKey: 'id',
        maxSize: 5
      },
      {
        header: 'Projekt',
        accessorKey: 'projectName',
        maxSize: 5
      },
      {
        header: 'Start',
        maxSize: 5,
        accessorKey: 'startDate',
        cell: ({ row }) => parseDate(row.original?.startDate)
      },
      {
        header: 'Deadline',
        accessorKey: 'deadline',
        maxSize: 10,
        cell: ({ row }) => parseDate(row.original?.deadline)
      },
      {
        header: 'Data utworzenia',
        accessorKey: 'createdAt',
        minSize: 10,
        cell: ({ row }) => parseDate(row.original?.createdAt)
      },

      {
        header: 'Status',
        accessorKey: '_count',
        maxSize: 5,
        cell: ({ row }) => {
          const finishedStatuses = ['CANCELED', 'FINISHED', 'ARCHIVED'];

          const finishedTasks = row.original?.tasks.filter((x) =>
            finishedStatuses.includes(x.status)
          ).length;

          return row.original?.isActive === true ? (
            <Badge
              size="btn"
              color={finishedTasks === row.original?.tasks.length ? 'green' : 'red'}>{`${
              finishedTasks === row.original?.tasks.length ? 'zakończone' : 'realizacja'
            }`}</Badge>
          ) : (
            <Badge size="btn" color="gray">
              Zarchiwizowane
            </Badge>
          );
        }
      },
      {
        id: 'localizations',
        header: () => (
          <div className="flex justify-center items-center w-full">
            <MapIcon className="h-5 w-5" aria-hidden="true" />
          </div>
        ),
        accessorKey: 'localizations',
        maxSize: 5,

        cell: ({ row }) => {
          const number = row.original?.localizations.length;
          return (
            <Badge
              size="btn"
              color="gray"
              isButton="external"
              onClick={() => {
                const projectId = row.original.id;
                router.push(`/client-projects/${projectId}`);
              }}>{`${number}`}</Badge>
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
    </>
  );
};

export default ProjectsClientTable;
