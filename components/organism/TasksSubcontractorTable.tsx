import { SortingState } from '@tanstack/react-table';
import { SortButton } from 'components/atoms/SortButton';
import Loading from 'components/moleculs/Loading';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from 'react-query';
import { ChevronRightIcon, DotsVerticalIcon } from '@heroicons/react/solid';
import { DotsCircleHorizontalIcon, DotsHorizontalIcon } from '@heroicons/react/outline';
import { Badge } from 'components/atoms/Badge';
import { capitalize } from 'lib/utils/capitalize';

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

const LocalizationsSubcontractorTable = ({ data: apiResponse, handleSelectTask }) => {
  const [data, setTableData] = useState(() => []);
  const queryClient = useQueryClient();
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    setTableData(apiResponse);
  }, [apiResponse]);

  if (!data) {
    return <Loading />;
  }

  return (
    <>
      <div className="mt-8 flex flex-col">
        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div className="overflow-y-scroll">
            {data.map((task) => {
              return (
                <div
                  key={task.id}
                  onClick={() => handleSelectTask(task.id)}
                  className="p-4 grid grid-cols-6 grid-rows-1 gap-4 shadow-md  max-w-[728px] m-2 rounded-md hover:bg-gray-100">
                  <div className="col-start-1 col-span-3">
                    <span className="flex items-center">
                      <div className="text-xs font-medium text-gray-400 ">ID: {task.id}</div>
                    </span>
                    <span className="flex items-center mt-2">
                      <div className="text-xs font-medium text-gray-400">
                        Przypisany: {`${task.assignedTo.firstName} ${task.assignedTo.lastName}`}
                      </div>
                    </span>
                    <span className="flex items-center mt-2">
                      <div className="text-sm font-medium text-gray-600">{task.title}</div>
                    </span>
                  </div>

                  <div className="col-start-4 row-start-1 row-end-2 col-span-2">
                    <div className="flex justify-end items-center h-full gap-1">
                      <div className="text-xs font-medium text-gray-600">
                        <Badge size="md" status={task.status.toUpperCase()}>
                          {capitalize(task.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div
                    className="flex justify-center items-center"
                    onClick={() =>
                      router.push(`/localizations/${task.localizationId}/tasks/${task.id}`)
                    }>
                    <DotsVerticalIcon className="h-5 w-5 text-gray-600" aria-hidden="true" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default LocalizationsSubcontractorTable;
