import { UploadIcon, CameraIcon } from '@heroicons/react/outline';
import {
  uploadLayoutOnLocalization,
  uploadPhotoLocalization,
  uploadPhotoTask
} from 'lib/api-routes/my-api';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useQueryClient, useMutation } from 'react-query';
import Compressor from 'compressorjs';

type UploadFileType = {
  clientId?: string | number;
  projectId?: string | number;
  localizationId?: string | number;
  taskId?: string | number;
  dataQuery:
    | 'localizationsInProjectData'
    | 'tasksData'
    | 'allTasksData'
    | 'localizationsParentData'
    | 'tasksSubcontractorData';
  title: string;
};

const UploadFileButton = ({
  localizationId = undefined,
  taskId = undefined,
  dataQuery
}: UploadFileType) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const query = router.query;
  const [inputKey, setInputKey] = useState(Date.now());

  const mutation = useMutation(uploadPhotoLocalization, {
    onSuccess: () => {
      // Invalidate and refetch
      console.log(dataQuery);
      queryClient.invalidateQueries([dataQuery]);
    }
  });

  const mutationTaskPhoto = useMutation(uploadPhotoTask, {
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries([dataQuery]);
    }
  });

  const reserInputKey = () => {
    setInputKey(Date.now());
  };

  const onSelectFile = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const images = e.target.files;

    Object.keys(images).forEach((key) => {
      const image = images[key];

      new Compressor(image, {
        quality: 0.6,
        maxWidth: 1000,
        maxHeight: 1500,
        success: (result) => {
          if (taskId) {
            //task photo
            mutationTaskPhoto.mutate({
              ids: {
                taskId,
                localizationId
              },
              result
            });
          } else {
            //localization photo
            mutation.mutate({
              ids: {
                localizationId
              },
              result
            });
          }

          reserInputKey();
        },

        error(err) {
          console.log(err.message);
          reserInputKey();
        }
      });
    });
  };

  return (
    <div className="">
      <label htmlFor="dropzone-file">
        <span className="hidden  px-3 py-2 cursor-pointer text-sm leading-4 rounded-md justify-between md:inline-flex items-center border  border-transparent font-medium  shadow-sm    bg-green-100 text-green-800 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
          <UploadIcon className="h-5 w-5 mr-2 " aria-hidden="true" />
          <div className="">Dodaj nowe zdjęcia</div>
        </span>
        <CameraIcon className="h-7 w-7 md:hidden" aria-hidden="true" />
        <input
          onChange={onSelectFile}
          id="dropzone-file"
          type="file"
          className="hidden"
          accept="image/*;capture=camera"
          key={inputKey}
          multiple
        />
      </label>
    </div>
  );
};

export default UploadFileButton;
