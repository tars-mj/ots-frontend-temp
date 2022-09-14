import { TrashIcon } from '@heroicons/react/outline';
import DialogModal from 'components/moleculs/DialogModal';

type DeleteButton = {
  readonly onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export const DeleteButton = ({ onClick }: DeleteButton) => {
  return (
    <button
      onClick={onClick}
      title="Delete"
      type="button"
      className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-red-500 bg-red-100 hover:bg-red-200 hover:text-red-700 focus:outline-none focus:ring-red-600 focus:ring-offset-2 focus:bg-red-200 transition-all">
      <TrashIcon className="h-5 w-5" aria-hidden="true" />
    </button>
  );
};
