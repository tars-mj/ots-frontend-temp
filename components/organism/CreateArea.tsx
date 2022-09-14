import Input from 'components/atoms/Input';
import * as yup from 'yup';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import Button from 'components/moleculs/Button';
import { useMutation, useQueryClient } from 'react-query';
import { createArea } from 'lib/api-routes/my-api';
import { useRouter } from 'next/router';

type Area = {
  id: number;
  name: string;
  description: string;
  width: string;
  height: string;
};

type CreateArea = {
  taskId: number;
  dataQuery: 'tasksData' | 'allTasksData';
  localizationId: number;
};

const CreateArea = ({ taskId, dataQuery, localizationId }: CreateArea) => {
  const router = useRouter();
  const query = router.query;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    control
  } = useForm<Area>();

  const queryClient = useQueryClient();

  const mutationArea = useMutation(createArea, {
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries([dataQuery]);

      reset();
      clearErrors();
    }
  });

  const onSubmit: SubmitHandler<Area> = async (data) => {
    const { clientId, projectId } = query;

    const res = mutationArea.mutate({
      data,
      ids: {
        clientId,
        projectId,
        localizationId,
        taskId
      }
    });
  };

  return (
    <div className="border-solid border-[1px] rounded-md border-gray-200 bg-gray-50 w-full">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-flow-col auto-cols-max gap-4 p-4 text-sm font-medium text-gray-600 ">
          <div>Dodaj nowy obszar</div>
        </div>
        <div className="grid grid-flow-col auto-cols-max  gap-4 p-4 items-center">
          <Input
            className="w-max"
            mainName="Nazwa"
            label="name"
            register={register}
            required
            error={errors.name}
            autoComplete="off"
          />
          <Input
            className="w-max"
            mainName="Szerokość"
            label="width"
            required
            register={register}
            error={errors.width}
            autoComplete="off"
          />
          <Input
            className="w-max"
            mainName="Wysokość"
            label="height"
            required
            register={register}
            error={errors.height}
            autoComplete="off"
          />

          <span className="justify-self-center self-end">
            {/* <DeleteButton
                onClick={() => {
                  console.log('delete area');
                }}
              />
              <AcceptButton
                onClick={() => {
                  console.log('delete area');
                }}
              /> */}
            <Button
              size="lg"
              type="submit"
              typeBtn="submit"
              isSubmitting={isSubmitting}
              className="">
              Dodaj
            </Button>
          </span>
        </div>
      </form>
    </div>
  );
};

export default CreateArea;
