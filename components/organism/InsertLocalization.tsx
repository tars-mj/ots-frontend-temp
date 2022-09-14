import Loading from 'components/moleculs/Loading';
import {
  addLocalizationToProject,
  fetchLocalizationsParent,
  fetchProjectsOfClient
} from 'lib/api-routes/my-api';
import { parseDate } from 'lib/utils/parse-date';
import router, { useRouter } from 'next/router';
import { MouseEvent, ReactEventHandler, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import Button from 'components/moleculs/Button';
import { SelectAllButton } from 'components/atoms/SelectAllButton';
import { Spinner } from 'components/atoms/Spinner';

const toCopyList = [
  { toCopy: 'Zadania', id: 1, label: 'tasks' },
  { toCopy: 'Powierzchnie', id: 2, label: 'areas' },
  { toCopy: 'Zdjęcia', id: 3, label: 'photos' },
  { toCopy: 'Mapa', id: 4, label: 'layouts' }
];

type CheckboxType = {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  title: string;
};

const Checkbox = ({ onChange, title }: CheckboxType) => {
  return (
    <div className="flex items-center h-5">
      <input
        title={title}
        onChange={onChange}
        id="comments"
        aria-describedby="comments-description"
        name="comments"
        type="checkbox"
        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
      />
    </div>
  );
};
const InsertLocalization = ({ currentDataLocalizations }) => {
  const router = useRouter();
  const query = router.query;
  const [selectedProject, setSelectedProject] = useState<number>(0);
  const [selectedLocalization, setSelectedLocalization] = useState<number[]>([]);
  const [selectedToCopy, setSelectedToCopy] = useState<{ title: string }[]>([]);
  const [isErrorSelected, setErrorSelected] = useState<boolean>();
  const [concateData, setConcateData] = useState<object[]>();

  const queryClient = useQueryClient();

  const {
    isLoadingError,
    isLoading: isLoadingProjects,
    error: errorProjects,
    status,
    data: dataProjects
  } = useQuery(
    ['projectsOfClientData'],
    () => fetchProjectsOfClient({ clientId: query.clientId, excludeProject: query.projectId }),
    {
      enabled: router.isReady
    }
  );

  const {
    isLoadingError: isLoadingErrorParent,
    isLoading: isLoadingParent,
    error: errorParent,
    status: statusParent,
    data: dataParent
  } = useQuery(
    ['localizationsParentData'],
    () => fetchLocalizationsParent({ clientId: query.clientId }),
    {
      enabled: router.isReady
    }
  );

  useEffect(() => {
    if (dataProjects && dataParent) {
      setConcateData(concatenateProjects());
    }
  }, [dataProjects, dataParent, currentDataLocalizations]);

  const mutation = useMutation(addLocalizationToProject, {
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(['localizationsInProjectData']);
    }
  });

  const sendData = () => {
    const { clientId, projectId } = query;
    const fields = selectedToCopy.map((x) => x.title);
    const data = {
      clientId,
      projectId,
      localizations: selectedLocalization,
      selectedToCopy: fields
    };

    mutation.mutate(data);
  };

  const setProject = (id: number) => {
    setSelectedProject(id);
    setErrorSelected(false);
    setSelectedLocalization([]); //reset selected localizations when changed project
  };

  const setLocalization = (e: MouseEvent<HTMLDivElement, MouseEvent>, id: number) => {
    setErrorSelected(false);
    if (e && e.altKey) {
      if (selectedLocalization?.includes(id)) {
        const filter = selectedLocalization?.filter((x) => x !== id);
        setSelectedLocalization([...filter]);
        return;
      }
      setSelectedLocalization([...selectedLocalization, id]);
      return;
    }
    setSelectedLocalization([id]);
  };

  const selectAllLocalizations = () => {
    setErrorSelected(false);

    const ids = concateData
      .find((project: { id: number | undefined }) => project.id === selectedProject)
      .localizations.map((x: { id: any }) => {
        return x.id;
      });

    setSelectedLocalization(ids);
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked === true) {
      setSelectedToCopy([...selectedToCopy, { title: e.target.title }]);
    } else {
      const filter = selectedToCopy.filter((x) => x.title !== e.target.title);
      setSelectedToCopy([...filter]);
    }
  };

  const addLocalizations = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (selectedLocalization.length === 0) {
      setErrorSelected(true);
      return;
    }
    sendData();
  };

  const concatenateProjects = () => {
    const parent = {
      id: 0,
      projectName: 'Lokalizacje szablonowe',
      createdAt: 'bd',
      localizations: dataParent ? [...dataParent] : []
    };

    const flatCurrentDataLocalizations = currentDataLocalizations.map((x) => x.uniqNumber);
    const concate = [parent, ...dataProjects];
    const filterConcate = concate.map((project) => {
      project.localizations = project.localizations?.filter(
        (localize) => !flatCurrentDataLocalizations.includes(localize.uniqNumber)
      );

      return project;
    });

    return filterConcate;
  };

  return (
    <>
      <div className="flex flex-row justify-between w-full gap-2 h-[65vh] relative">
        {mutation.status === 'loading' && (
          <div className="absolute w-full h-full bg-primary-blue-600 opacity-75 flex justify-center items-center rounded-lg">
            <Spinner color="#ccc" />
          </div>
        )}
        <div className="basis-2/5">
          <div className="bg-primary-blue-500 p-4 text-base font-medium text-primary-blue-100 rounded-tl-lg h-16 flex items-center">
            Projekt
          </div>
          <div className={`h-full overflow-y-scroll divide-y-2 divide-white `}>
            {status === 'error' && <div>{errorProjects && errorProjects.message}</div>}

            {status === 'loading' && <Loading />}

            {status === 'success' &&
              dataProjects &&
              concatenateProjects().map((project) => {
                return project.id === 0 ? (
                  <div
                    key={project.id}
                    onClick={() => setProject(project.id)}
                    className={`${
                      selectedProject === project.id && 'bg-primary-blue-100'
                    } px-4 py-2 text-sm font-bold hover:bg-primary-blue-100 text-primary-blue-600 select-none cursor-pointer `}>
                    {`${project.projectName}`}
                  </div>
                ) : (
                  <div
                    key={project.id}
                    onClick={() => setProject(project.id)}
                    className={`${
                      selectedProject === project.id && 'bg-primary-blue-100'
                    } px-4 py-2 text-sm font-light hover:bg-primary-blue-100 text-primary-blue-600 select-none cursor-pointer `}>
                    {`${project.projectName} (${parseDate(project.createdAt)})`}
                  </div>
                );
              })}
          </div>
        </div>
        <div className="basis-2/5 ">
          <div
            className={`${
              isErrorSelected ? 'bg-red-700' : 'bg-primary-blue-500'
            } text-primary-blue-100 p-4 text-base font-medium flex justify-between h-16 items-center `}>
            {isErrorSelected ? (
              <p className="text-red-100">Zaznacz przynajmniej jedną lokalizację</p>
            ) : (
              <p>Lokalizacje</p>
            )}
            <span>
              {selectedProject !== undefined && (
                <SelectAllButton onClick={() => selectAllLocalizations()} />
              )}
            </span>
          </div>

          <div className={`divide-y-2 divide-white h-full overflow-y-scroll`}>
            {selectedProject !== undefined &&
              concateData &&
              concateData
                .find((project) => project.id === selectedProject)
                .localizations.map((localize) => {
                  return (
                    <div
                      onClick={(e) => setLocalization(e, localize.id)}
                      key={localize.id}
                      className={`${
                        selectedLocalization?.includes(localize.id) && 'bg-primary-blue-100'
                      } px-4 py-2 text-sm font-light hover:bg-primary-blue-100 text-primary-blue-600 select-none cursor-pointer`}>
                      {`${localize.uniqNumber}, ${localize.address}, ${localize.city}`}
                    </div>
                  );
                })}
          </div>
        </div>
        <div className="basis-1/5">
          <div className="bg-primary-blue-500 p-4 text-base font-medium text-primary-blue-100 rounded-tr-lg h-16 flex items-center">
            Dodatkowe pola
          </div>
          <div className="mt-4 h-full overflow-y-scroll">
            {toCopyList.map((item) => {
              return (
                <div key={item.id} className="px-4 py-2 text-sm font-light flex gap-4">
                  <Checkbox onChange={handleOnChange} title={item.label} />
                  <p>{item.toCopy}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <span className="absolute right-6 bottom-6">
        <Button size="md" type="submit" typeBtn="submit" onClick={addLocalizations}>
          Dodaj lokalizację
        </Button>
      </span>
    </>
  );
};

export default InsertLocalization;
