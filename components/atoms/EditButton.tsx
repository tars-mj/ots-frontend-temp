import { PencilIcon } from '@heroicons/react/outline';
import DialogModal from 'components/moleculs/DialogModal';

type EditButton = {
  readonly onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export const EditButton = ({ onClick }: EditButton) => {
  return (
    <button
      onClick={onClick}
      title="Edit"
      type="button"
      className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-blue-500 bg-blue-100 hover:bg-blue-200 hover:text-blue-600 focus:outline-none focus:ring-blue-300 focus:ring-offset-2 focus:bg-blue-200 transition-all">
      <PencilIcon className="h-5 w-5" aria-hidden="true" />
    </button>
  );
};
