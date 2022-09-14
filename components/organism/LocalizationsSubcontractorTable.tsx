import { CheckCircleIcon, ChevronRightIcon, ExclamationIcon } from '@heroicons/react/outline';
import Button from 'components/moleculs/Button';
import Loading from 'components/moleculs/Loading';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const LocalizationsSubcontractorTable = ({ data: apiResponse }) => {
  const [data, setTableData] = useState(() => []);
  const [sortState, setSortState] = useState('none');
  const router = useRouter();

  useEffect(() => {
    setTableData(apiResponse);
  }, [apiResponse]);

  const sortMethods = {
    none: {
      method: (a, b) => null
    },
    projectName: {
      method: (a, b) => a.project.projectName.localeCompare(b.project.projectName)
    },
    city: {
      method: (a, b) =>
        a.city.toString().toLowerCase().localeCompare(b.city.toString().toLowerCase())
    },
    plannedDateRealize: {
      method: (a, b) => {
        const dateA = new Date(
          a.tasks.sort((c, d) => {
            const dateC = new Date(c.plannedDateRealize).getTime();
            const dateD = new Date(d.plannedDateRealize).getTime();
            return dateC - dateD;
          })[0].plannedDateRealize
        ).getTime();

        const dateB = new Date(
          b.tasks.sort((c, d) => {
            const dateC = new Date(c.plannedDateRealize).getTime();
            const dateD = new Date(d.plannedDateRealize).getTime();
            return dateC - dateD;
          })[0].plannedDateRealize
        ).getTime();

        return dateA - dateB;
      }
    }
  };

  const nearestPlannedDateRealized = (tasks) => {
    const plannedDate = tasks.sort((a, b) => {
      const dateA = new Date(a.plannedDateRealize).getTime();
      const dateB = new Date(b.plannedDateRealize).getTime();

      return dateA - dateB;
    });

    const parseDate = new Date(plannedDate[0].plannedDateRealize);
    return `${parseDate.getDate()}-${parseDate.getMonth() + 1}-${parseDate.getFullYear()}`;
  };

  const checkStatus = (tasks) => {
    const finishedStatuses = ['CANCELED', 'FINISHED', 'ARCHIVED', 'REJECTED'];

    const finishedTasks = tasks.filter((x) => finishedStatuses.includes(x.status)).length;

    return finishedTasks === tasks.length ? (
      <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
    ) : (
      <div
        className="h-5 w-5 m-[2px] border-2 border-gray-300 rounded-full"
        aria-hidden="true"></div>
    );
  };

  if (!data) {
    return <Loading />;
  }

  return (
    <>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="">
              <div className="flex w-full justify-end p-4 gap-2 relative border-0 shadow-sm bg-gray-50">
                <Button
                  size="sm"
                  typeBtn="default"
                  className="w-full"
                  onClick={() => setSortState('projectName')}>
                  Kampania
                </Button>
                <Button
                  size="sm"
                  typeBtn="default"
                  className="w-full"
                  onClick={() => setSortState('plannedDateRealize')}>
                  Data realizacji
                </Button>
                <Button
                  size="sm"
                  typeBtn="default"
                  className="w-full"
                  onClick={() => setSortState('city')}>
                  Miasto
                </Button>
              </div>
            </div>
            <div className="overflow-hidden ring-opacity-5 ">
              {data.length &&
                [...data].sort(sortMethods[sortState].method).map((localize, i) => {
                  return (
                    <div
                      key={localize.id}
                      onClick={() => router.push(`/localizations/${localize.id}`)}
                      className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-1 gap-x-6 m-2 shadow-md bg-white  rounded-md hover:bg-gray-100 items-center relative cursor-pointer">
                      <div className="flex justify-center items-center absolute right-5">
                        <ChevronRightIcon className="h-6 w-6 text-gray-600" aria-hidden="true" />
                      </div>
                      <div className="flex justify-center items-center absolute left-5 ">
                        {checkStatus(localize.tasks)}
                        {localize.tasks.some((x) => x.status === 'REJECTED') && (
                          <ExclamationIcon
                            className="h-6 w-6 ml-2 text-red-500"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                      <div className="text-[0.5rem] font-medium text-gray-400 justify-self-end ">
                        NAJBLIŻSZA DATA REALIZACJI
                      </div>
                      <div className="text-xs font-medium text-gray-600">
                        {nearestPlannedDateRealized(localize.tasks)}
                      </div>
                      <div className="text-[0.5rem] font-medium text-gray-400 justify-self-end">
                        NAZWA PROJEKTU
                      </div>
                      <div className="text-xs font-medium text-gray-600">
                        {localize.project.projectName}
                      </div>

                      <div className="text-[0.5rem] font-medium text-gray-400 justify-self-end">
                        NUMER PLACOWKI
                      </div>
                      <div className="text-xs font-medium text-gray-600">{localize.uniqNumber}</div>
                      <div className="text-[0.5rem] font-medium text-gray-400 justify-self-end ">
                        ADRES PLACWKI
                      </div>
                      <div className="text-xs font-medium text-gray-600">
                        <div>
                          <div>
                            {localize.address}, {localize.city}
                          </div>
                          <div>
                            {localize.zipCode && `${localize.zipCode}, `} {localize.province}
                          </div>
                        </div>
                      </div>
                    </div>
                    // <div
                    //   key={localize.id}
                    //   onClick={() => router.push(`/localizations/${localize.id}`)}
                    //   className="p-4 grid grid-cols-5 grid-rows-1 gap-4 shadow-md bg-white m-2 rounded-md hover:bg-gray-100">
                    //   <div className="col-start-1 col-span-2">
                    //     <div className="text-[0.5rem] font-medium text-gray-400">
                    //       NAJBLIŻSZA DATA REALIZACJI
                    //     </div>
                    //     <div className="text-xs font-medium text-gray-600">
                    //       {nearestPlannedDateRealized(localize.tasks)}
                    //     </div>

                    //     <div className="text-[0.5rem]  font-medium text-gray-400 mt-2">
                    //       NAZWA PROJEKTU
                    //     </div>
                    //     <div className="text-xs font-medium text-gray-600">
                    //       {localize.project.projectName}
                    //     </div>
                    //   </div>
                    //   <div className="col-start-3 col-span-2">
                    //     <div className="text-[0.5rem] font-medium text-gray-400">NUMER PLACOWKI</div>
                    //     <div className="text-xs font-medium text-gray-600">{localize.uniqNumber}</div>
                    //     <div className="text-[0.5rem]  font-medium text-gray-400 mt-2">ADRES</div>
                    //     <div className="text-xs font-medium text-gray-600 ">{localize.address}</div>
                    //     <div className="flex gap-1">
                    //       <div className="text-xs font-medium text-gray-600">
                    //         {localize.zipCode},{' '}
                    //       </div>
                    //       <div className="text-xs font-medium text-gray-600">{localize.city}</div>
                    //     </div>
                    //     <div className="text-xs font-medium text-gray-600">{localize.province}</div>
                    //   </div>
                    //   <div className="flex justify-center items-center">
                    //     <ChevronRightIcon className="h-5 w-5 text-gray-600" aria-hidden="true" />
                    //   </div>
                    // </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LocalizationsSubcontractorTable;
