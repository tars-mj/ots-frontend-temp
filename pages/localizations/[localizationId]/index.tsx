import { SpinnerButton } from 'components/atoms/SpinnerButton';
import Layout from 'components/Layout';
import Breadcrumbs from 'components/moleculs/Breadcrumps';
import Button from 'components/moleculs/Button';
import { fetchLocalizationsSubcontractor, fetchTasksSubcontractor } from 'lib/api-routes/my-api';
import useSession from 'lib/hooks/useSession';
import Router, { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import LocalizationsSubcontractorTable from 'components/organism/LocalizationsSubcontractorTable';
import TasksSubcontractorTable from 'components/organism/TasksSubcontractorTable';
import dynamic from 'next/dynamic';
const Map = dynamic(() => import('components/organism/Map'), { ssr: false });

const TasksOnLocalizationsSubcontractor = () => {
  const session = useSession();
  const router = useRouter();
  const {
    status,
    isLoading: isLodaingLocalizations,
    error: errorLocalizations,
    data: dataLocalizations
  } = useQuery(['localizationsSubcontractorData'], fetchLocalizationsSubcontractor, {
    enabled: router.isReady
  });
  const { localizationId } = router.query;
  const {
    isLoading: isLoadingTasks,
    error: errorTasks,
    data: dataTasks
  } = useQuery(['tasksSubcontractorData'], fetchTasksSubcontractor, {
    enabled: router.isReady
  });

  const [localizationData, setLocalizationData] = useState();
  const [tasksData, setTasksData] = useState();

  useEffect(() => {
    if (!session) {
      Router.push('/login');
    }
  }, [session]);

  useEffect(() => {
    setLocalizationData(
      localizationId &&
        dataLocalizations.find((localization) => localization.id === Number(localizationId))
    );
  }, [dataLocalizations]);

  useEffect(() => {
    setTasksData(
      localizationId && dataTasks.filter((task) => task.localizationId === Number(localizationId))
    );
  }, [dataTasks]);

  const [selectedTask, setSelectedTask] = useState([]);

  const handleSelectTask = (id) => {
    setSelectedTask([id]);
  };

  const coordsFilter = () => {
    if (localizationData && dataTasks) {
      const tasksCoords = dataTasks
        .filter((loc) => loc.localizationId === Number(localizationId))
        .map((c) => c.coord && c.coord.id);
      const coordFilter = localizationData.layouts[0]?.coords.filter((x) =>
        tasksCoords.includes(x.id)
      );
      return coordFilter;
    }
  };

  return (
    <Layout title={`Lista zadań: ${localizationData?.uniqNumber}`}>
      <div className="hidden md:flex px-4 sm:px-6 lg:px-8 w-full">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <div className="mb-6">
              <Breadcrumbs />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Zadania</h1>
            <p className="mt-2 text-sm text-gray-700">Zadania w lokalizacji do wykonania</p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none"></div>
        </div>
      </div>
      <div className="w-full  md:flex md:flex-row">
        <div className="sm:flex sm:items-center">
          <div className="">
            {localizationData && localizationData.layouts[0] && (
              <Map
                url={localizationData.layouts[0].url}
                layoutId={localizationData?.layouts[0]?.id}
                coords={coordsFilter()}
                selectedTask={selectedTask}
                isParent={false}
                isLimited={true}
              />
            )}
          </div>
        </div>
        <div className=" h-[55vh] md:h-full overflow-y-scroll w-full ">
          {status === 'loading' ? (
            <SpinnerButton />
          ) : status === 'error' ? (
            'ERROR'
          ) : (
            <TasksSubcontractorTable data={tasksData} handleSelectTask={handleSelectTask} />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TasksOnLocalizationsSubcontractor;
