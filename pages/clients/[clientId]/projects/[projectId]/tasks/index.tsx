import { SpinnerButton } from 'components/atoms/SpinnerButton';
import Layout from 'components/Layout';
import Breadcrumbs from 'components/moleculs/Breadcrumps';
import Button from 'components/moleculs/Button';
import {
  createLocalizationsWithTasks,
  fetchAllTasks,
  fetchTasks,
  fetchUsers
} from 'lib/api-routes/my-api';
import { useAuth } from 'lib/context/auth.context';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import AllTaskTable from 'components/organism/AllTaskTable';
import { DownloadIcon, UploadIcon } from '@heroicons/react/outline';
import {
  structureConfig,
  allowColumn,
  csvJSON,
  delimiterStd,
  linebreake,
  prepareStructureToDB,
  delimiterTab
} from 'lib/utils/csv-2-json';
import DialogModal from 'components/moleculs/DialogModal';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Spinner } from 'components/atoms/Spinner';
import { useKeyPress } from 'lib/hooks/useKeyPress';
import { convertToCsv } from 'lib/utils/convert-2-csv';
import { downloadFile } from 'lib/utils/download-file';

const TasksInProject = () => {
  const router = useRouter();
  const query = router.query;
  const queryClient = useQueryClient();
  const { status, user, signOut } = useAuth();
  const [fileCsv, setFileCsv] = useState<string | undefined>();
  const [parseCSV2JSON, setParseCSV2JSON] = useState<string[]>();
  const [locStatus, setLocStatus] = useState(0);
  const [taskStatus, setTaskStatus] = useState(0);
  const [modalsConfirmState, setModalConfirm] = useState(false);
  const inputRef = useRef(null);

  const {
    isLoadingError,
    isLoading: isLoadingTasks,
    error: errorTasks,
    data: dataTasks
  } = useQuery(['allTasksData'], () => fetchAllTasks(query), {
    enabled: router.isReady
  });

  const {
    isLoading,
    error,
    data: dataUsers
  } = useQuery(['usersData'], fetchUsers, {
    enabled: router.isReady
  });

  const modalConfirmOpen = () => {
    setModalConfirm(true);
  };

  const modalConfirmClose = () => {
    setModalConfirm(false);
    setFileCsv(null);
    setParseCSV2JSON(undefined);
    setTaskStatus(0);
    setLocStatus(0);
  };

  useEffect(() => {
    if (dataTasks?.statusCode === 401) {
      signOut();
      router.push('/login');
    }
  }, [dataTasks]);

  const handleFileChange = (e) => {
    e.preventDefault();
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result as string;
      setFileCsv(text);
      decodeFile(text, delimiterStd);
      modalConfirmOpen();
    };

    reader.readAsText(e.target.files[0]);
  };

  const decodeFile = (file, delimiterType) => {
    const fileStr = file.toString();
    const csv = csvJSON(fileStr, { delimiter: delimiterType, allowColumn, linebreake });
    const struct = prepareStructureToDB(csv, structureConfig);
    setLocStatus(struct.length);
    const calcTask = struct.reduce((acc, curr) => curr?.tasks.length + acc, 0);
    setTaskStatus(calcTask);

    setParseCSV2JSON(struct);
  };

  const downloadTemplateCSV = () => {
    const allowStatuses = [
      { statusy: 'DRAFT' },
      { statusy: 'PLANNED' },
      { statusy: 'IN_PROGRESS' },
      { statusy: 'FINISHED' },
      { statusy: 'CONFIRMED' },
      { statusy: 'REJECTED' },
      { statusy: 'CANCELED' },
      { statusy: 'ARCHIVED' }
    ];
    const allowColumnTemplate = [
      {
        uniqNumber: 'TST-001',
        title: 'Przykładowy tytuł',
        description: 'Opis zadania',
        plannedDateRealize: '2022-12-24',
        status: 'DRAFT',
        zipCode: '44-105',
        province: 'Śląsk',
        city: 'Gliwice',
        address: 'ul. Wiązowa 12',
        assignedToId: '1',
        '': '',
        statusy: '',
        podwykonawca: '',
        podwykonawcaId: ''
      }
    ];

    const filterSubcontractor = dataUsers
      .filter((user) => user.role === 'SUBCONTRACTOR_ADMIN')
      .map((user) => {
        return {
          podwykonawca: `${user.firstName} ${user.lastName}`,
          podwykonawcaId: user.id
        };
      });

    const iterate =
      allowStatuses.length > filterSubcontractor.length ? allowStatuses : filterSubcontractor;

    const concateData = [];

    for (let i = 0; i <= iterate.length; i++) {
      concateData.push({
        ...allowStatuses[i],
        ...filterSubcontractor[i]
      });
    }

    const fullAllowColumnTemplate = [...allowColumnTemplate, ...concateData];

    const csv = convertToCsv(fullAllowColumnTemplate);

    downloadFile('template_excel_data.csv', csv);
  };

  const resetFileInput = () => {
    inputRef.current.value = null;
  };

  const mutationLocWithTasks = useMutation(createLocalizationsWithTasks, {
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries(['allTasksData']);
      modalConfirmClose();
    }
  });

  const onSubmitNewTaskAndLoc = async (e) => {
    e.preventDefault();
    const { clientId, projectId } = query;
    const data2create = parseCSV2JSON;

    mutationLocWithTasks.mutate({
      clientId,
      projectId,
      data2create
    });
  };

  const onKeyPress = (event) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === 'v') {
      setTimeout(async () => {
        const text = await navigator.clipboard.readText();
        try {
          setFileCsv(text);
          decodeFile(text, delimiterTab);
          modalConfirmOpen();
        } catch (e) {
          alert('Źle sklopiowane dane');
        }
      }, 1000);
    }
  };

  useKeyPress(['v'], onKeyPress);

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 w-full">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <div className="mb-6">
              <Breadcrumbs />
            </div>
            <div className="flex gap-4 justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Zadania w projekcie</h1>
                <p className="mt-2 text-sm text-gray-700">
                  Lista wszystkich zadań występujących w całym projekcie.
                </p>
              </div>

              <div className="self-center flex gap-2">
                <Button size="lg" typeBtn="submit" onClick={downloadTemplateCSV}>
                  <span className="flex ">
                    <DownloadIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                    Eksportuj szablon
                  </span>
                </Button>
                <label htmlFor="csv-file">
                  <span
                    onClick={resetFileInput}
                    className="px-3 py-2 cursor-pointer text-sm leading-4 rounded-md justify-between flex items-center border  border-transparent font-medium  shadow-sm    bg-green-100 text-green-800 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    <UploadIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                    <div>Importuj CSV</div>
                  </span>
                  <input
                    ref={inputRef}
                    id="csv-file"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none"> </div>
        </div>
        {isLoadingTasks ? (
          <SpinnerButton />
        ) : errorTasks ? (
          'ERROR'
        ) : (
          <AllTaskTable data={dataTasks} dataUsers={dataUsers} />
        )}
      </div>
      {modalsConfirmState && (
        <DialogModal
          openStatus={modalsConfirmState}
          title={'Dodajesz nowe zadania i lokalizacje'}
          message={`Poniej podsumowanie dodania nowych lokalizacji i zadań`}
          closeModal={modalConfirmClose}>
          <div className="">
            <form onSubmit={onSubmitNewTaskAndLoc}>
              <div className="mt-5 mb-10 ">
                <div className="max-h-96 overflow-scroll">
                  <div className="flex flex-col divide-y ">
                    Liczba nowych lokalizacji: {locStatus}
                  </div>
                  <div className="flex flex-col divide-y ">Liczba nowych zadań: {taskStatus}</div>
                  <div className="flex items-center justify-center w-full">
                    {mutationLocWithTasks.status === 'loading' && (
                      <div className="m-4 flex items-center justify-center flex-col">
                        <Spinner />
                        <p className="mt-2 text-xs font-light">trwa wysyłanie...</p>
                      </div>
                    )}
                    {mutationLocWithTasks.status === 'error' && (
                      <div className="m-4 flex items-center justify-center flex-col">
                        <p className="bg-red-100 text-red-600 p-2 rounded-md text-xs font-light">
                          Błąd w danych. Sprawdz CSV.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-between ">
                <Button size="md" typeBtn="support" onClick={modalConfirmClose}>
                  Anuluj
                </Button>
                <Button size="md" type="submit" typeBtn="submit">
                  Zatwierdź
                </Button>
              </div>
            </form>
          </div>
        </DialogModal>
      )}
    </Layout>
  );
};

export default TasksInProject;
