import { UploadIcon } from '@heroicons/react/outline';
import { uploadLayoutOnLocalization, uploadPhotoLocalization } from 'lib/api-routes/my-api';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useQueryClient, useMutation } from 'react-query';
import Compressor from 'compressorjs';

type UploadLayoutType = {
  clientId: string | number;
  projectId: string | number | undefined;
  localizationId: string | number;
  dataQuery: 'layoutsOnLocalizationData' | 'layoutsOnLocalizationParentData';
  title: string;
};

const UploadLayoutButton = ({
  clientId,
  projectId,
  localizationId,
  dataQuery
}: UploadLayoutType) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const query = router.query;
  const [inputKey, setInputKey] = useState(Date.now());

  const mutation = useMutation(uploadLayoutOnLocalization, {
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
        success: (result) => {
          mutation.mutate({
            ids: {
              clientId,
              projectId,
              localizationId
            },
            result
          });
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
        <span className="px-3 py-2 cursor-pointer text-sm leading-4 rounded-md justify-between inline-flex items-center border  border-transparent font-medium  shadow-sm    bg-green-100 text-green-800 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
          <UploadIcon className="h-5 w-5 mr-2" aria-hidden="true" />
          <div>Dodaj nowe zdjęcia</div>
        </span>
        <input
          onChange={onSelectFile}
          id="dropzone-file"
          type="file"
          className="hidden"
          accept="image/*;capture=camera"
          key={inputKey}
          multiple={false}
        />
      </label>
    </div>
  );
};

export default UploadLayoutButton;
