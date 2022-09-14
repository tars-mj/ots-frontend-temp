import { deleteData, getData, postData, patchData, postFileData } from 'lib/utils/fetch-wrapper';
import { removeEmptyValue } from 'lib/utils/remove-empty-value';
import { ParsedUrlQuery } from 'querystring';
import { apiAddress } from 'lib/api-routes/api-address';

export const fetchClients = async () => {
  const res = await getData(new URL(`${apiAddress}/clients`));

  return res;
};

export const createClient = async (data) => {
  const res = await postData(new URL(`${apiAddress}/clients`), data);

  return res;
};

export const deleteClient = async (id) => {
  const res = await deleteData(new URL(`${apiAddress}/clients/${id}`));

  return res;
};

export const editClient = async (data) => {
  const res = await patchData(new URL(`${apiAddress}/clients/${data.id}`), {
    name: data.name
  });

  return res;
};

export const fetchUsers = async () => {
  const res = await getData(new URL(`${apiAddress}/users`));

  return res;
};

export const fetchUsersSubcontractor = async () => {
  const res = await getData(new URL(`${apiAddress}/users`));

  return res;
};

export const createUser = async (data) => {
  const res = await postData(new URL(`${apiAddress}/users`), data);

  return res;
};

export const deleteUser = async (id) => {
  const res = await deleteData(new URL(`${apiAddress}/users/${Number(id)}`));
  return res;
};

export const editUser = async (data) => {
  const dataParse = removeEmptyValue(data);
  const res = await patchData(new URL(`${apiAddress}/users/${data.id}`), {
    ...dataParse
  });

  return res;
};

export const fetchProjects = async () => {
  const res = await getData(new URL(`${apiAddress}/projects`));

  return res;
};

export const fetchProjectsOfClient = async (data) => {
  const { clientId, excludeProject } = data;
  const res = await getData(
    new URL(
      `${apiAddress}/clients/${clientId}/projects?fullLocalize=true&excludeProject=${excludeProject}`
    )
  );

  return res;
};

export const createProject = async (data) => {
  const res = await postData(new URL(`${apiAddress}/clients/${data.client.id}/projects/`), data);

  return res;
};

export const deleteProject = async (data) => {
  const res = await deleteData(
    new URL(`${apiAddress}/clients/${data.client.id}/projects/${data.id}`)
  );
  return res;
};

export const editProject = async (data) => {
  const dataParse = removeEmptyValue(data);
  const res = await patchData(
    new URL(`${apiAddress}/clients/${data.clientId}/projects/${data.projectId}`),
    {
      ...dataParse
    }
  );

  return res;
};

export const fetchProject = async ({ clientId, projectId }: ParsedUrlQuery) => {
  const res = await getData(new URL(`${apiAddress}/clients/${clientId}/projects/${projectId}`));

  return res;
};

export const fetchLocalizationsSubcontractor = async () => {
  const res = await getData(new URL(`${apiAddress}/localizations`));

  return res;
};

export const fetchTasksSubcontractor = async () => {
  const res = await getData(new URL(`${apiAddress}/tasks`));

  return res;
};

export const fetchLocalizations = async ({ clientId, projectId }: ParsedUrlQuery) => {
  const res = await getData(
    new URL(`${apiAddress}/clients/${clientId}/projects/${projectId}/localizations`)
  );

  return res;
};

export const fetchLocalizationsClientView = async ({ projectId }: ParsedUrlQuery) => {
  const res = await getData(new URL(`${apiAddress}/projects/${projectId}/localizations`));
  return res;
};

export const fetchLocalizationsParent = async ({ clientId }: ParsedUrlQuery) => {
  const res = await getData(new URL(`${apiAddress}/clients/${clientId}/localizations`));

  return res;
};

export const addLocalizationToProject = async ({
  clientId,
  projectId,
  localizations,
  selectedToCopy
}) => {
  const res = await postData(new URL(`${apiAddress}/clients/${clientId}/projects/${projectId}`), {
    localizations,
    selectedToCopy
  });

  return res;
};

export const fetchLayoutsOnLocalization = async ({
  clientId,
  projectId,
  localizationId
}: ParsedUrlQuery) => {
  const res = await getData(
    new URL(
      `${apiAddress}/clients/${clientId}/projects/${projectId}/localizations/${localizationId}/layouts`
    )
  );

  return res;
};

export const fetchLayoutsOnLocalizationParent = async ({
  clientId,
  localizationId
}: ParsedUrlQuery) => {
  const res = await getData(
    new URL(`${apiAddress}/clients/${clientId}/localizations/${localizationId}/layouts`)
  );

  return res;
};

export const uploadLayoutOnLocalization = async ({ ids, result }) => {
  const { clientId, projectId, localizationId } = ids;

  const res = await postFileData(
    new URL(
      `${apiAddress}/clients/${clientId}/${
        projectId ? `projects/${projectId}/` : ''
      }localizations/${localizationId}/layouts/`
    ),
    result
  );

  return res;
};

export const deleteLayout = async ({ layoutId }: ParsedUrlQuery) => {
  const res = await deleteData(new URL(`${apiAddress}/layouts/${layoutId}`));

  return res;
};

export const createLocalization = async (data) => {
  const { clientId, projectId, address, uniqNumber, city } = data;
  const res = await postData(
    new URL(`${apiAddress}/clients/${clientId}/projects/${projectId}/localizations`),
    { address, uniqNumber, city }
  );

  return res;
};

export const createLocalizationParent = async (data) => {
  const { clientId, address, uniqNumber, city, zipCode, province } = data;
  const res = await postData(new URL(`${apiAddress}/clients/${clientId}/localizations`), {
    address,
    uniqNumber,
    city,
    zipCode,
    province
  });

  return res;
};

export const deleteLocalization = async (data) => {
  const res = await deleteData(new URL(`${apiAddress}/localizations/${data.id}`));
  return res;
};

export const editLocalization = async (data) => {
  const dataParse = removeEmptyValue(data);

  const res = await patchData(new URL(`${apiAddress}/localizations/${data.localizationId}`), {
    ...dataParse
  });

  return res;
};

//tasks in one localization
export const fetchTasks = async ({ clientId, projectId, localizationId }: ParsedUrlQuery) => {
  const res = await getData(
    new URL(
      `${apiAddress}/clients/${clientId}/projects/${projectId}/localizations/${localizationId}/tasks`
    )
  );

  return res;
};

//all tasks in project
export const fetchAllTasks = async ({ clientId, projectId }: ParsedUrlQuery) => {
  const res = await getData(
    new URL(`${apiAddress}/clients/${clientId}/projects/${projectId}/tasks`)
  );

  return res;
};

//fetch tasks in template localization
export const fetchTasksParent = async ({ clientId, localizationId }: ParsedUrlQuery) => {
  const res = await getData(
    new URL(`${apiAddress}/clients/${clientId}/localizations/${localizationId}/tasks`)
  );

  return res;
};

export const createTask = async (data) => {
  const {
    clientId,
    projectId,
    localizationId,
    title,
    plannedDateRealize,
    description,
    isAllowAreas
  } = data;

  const res = await postData(
    new URL(
      `${apiAddress}/clients/${clientId}/${
        projectId ? `projects/${projectId}/` : ''
      }localizations/${localizationId}/tasks`
    ),
    { title, plannedDateRealize, description, isAllowAreas }
  );

  return res;
};

export const createLocalizationsWithTasks = async (data) => {
  const { clientId, projectId, data2create } = data;
  const res = await postData(
    new URL(`${apiAddress}/clients/${clientId}/projects/${projectId}/csv-data`),
    data2create
  );

  return res;
};

export const deleteTask = async (data) => {
  const { id: taskId } = data;

  const res = await deleteData(new URL(`${apiAddress}/tasks/${taskId}`));
  return res;
};

export const statusTask = async (data) => {
  const dataParse = removeEmptyValue(data.data);
  const { localizationId, taskId } = data.ids;
  const res = await patchData(
    new URL(`${apiAddress}/localizations/${localizationId}/tasks/${taskId}`),
    {
      ...dataParse
    }
  );

  return res;
};

export const editTask = async (data) => {
  const dataParse = removeEmptyValue(data.data);
  const { clientId, projectId, localizationId, taskId } = data.ids;
  const res = await patchData(
    new URL(
      `${apiAddress}/clients/${clientId}/${
        projectId ? `projects/${projectId}/` : ''
      }localizations/${localizationId}/tasks/${taskId}`
    ),
    {
      ...dataParse
    }
  );

  return res;
};

export const reassignUserToTask = async (data) => {
  const dataParse = removeEmptyValue(data.data);
  const { taskId } = data.ids;
  const res = await patchData(new URL(`${apiAddress}/tasks/${taskId}`), {
    ...dataParse
  });

  return res;
};

export const createComment = async (data) => {
  const { clientId, projectId, localizationId, taskId } = data.ids;
  const res = await postData(
    new URL(
      `${apiAddress}/clients/${clientId}/${
        projectId ? `projects/${projectId}/` : ''
      }localizations/${localizationId}/tasks/${taskId}/comments`
    ),
    { comment: data.data.comment }
  );

  return res;
};

export const createArea = async ({ ids, data }) => {
  const { clientId, projectId, localizationId, taskId } = ids;
  const res = await postData(
    new URL(
      `${apiAddress}/clients/${clientId}/${
        projectId ? `projects/${projectId}/` : ''
      }localizations/${localizationId}/tasks/${taskId}/areas`
    ),
    { ...data }
  );

  return res;
};

export const deleteArea = async (data) => {
  const { areaId } = data;

  const res = await deleteData(new URL(`${apiAddress}/areas/${areaId}`));
  return res;
};

export const uploadPhotoLocalization = async ({ ids, result }) => {
  const { clientId, projectId, localizationId } = ids;

  const res = await postFileData(
    new URL(`${apiAddress}/localizations/${localizationId}/photos/`),
    result
  );

  return res;
};

export const uploadPhotoTask = async ({ ids, result }) => {
  const { localizationId, taskId } = ids;

  const res = await postFileData(
    new URL(`${apiAddress}/localizations/${localizationId}/tasks/${taskId}/photos/`),
    result
  );

  return res;
};

export const deletePhotoLocalization = async ({ id }) => {
  const res = await deleteData(new URL(`${apiAddress}/photos/${id}`));

  return res;
};

export const deletePhotoTask = async ({ id }) => {
  const res = await deleteData(new URL(`${apiAddress}/photos/${id}`));

  return res;
};

export const createCoord = async ({ ids, data }) => {
  const { localizationId, layoutId } = ids;
  const res = await postData(
    new URL(`${apiAddress}/localizations/${localizationId}/layouts/${layoutId}/coords`),
    { x: data.x, y: data.y }
  );

  return res;
};

export const dragCoord = async ({ ids, data }) => {
  const { coordId } = ids;
  const res = await patchData(new URL(`${apiAddress}/coords/${coordId}`), {
    x: data.x,
    y: data.y
  });

  return res;
};

export const deleteCoord = async ({ ids }) => {
  const { clientId, projectId, localizationId, layoutId, coordId } = ids;
  const res = await deleteData(new URL(`${apiAddress}/coords/${coordId}`));

  return res;
};

export const addCoordToTasks = async ({ ids, selectedTask }) => {
  const { coordId } = ids;

  const res = await patchData(new URL(`${apiAddress}/coords/${coordId}`), { selectedTask });

  return res;
};
