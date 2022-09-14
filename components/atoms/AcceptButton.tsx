import { CheckIcon, TrashIcon } from '@heroicons/react/outline';
import DialogModal from 'components/moleculs/DialogModal';

type AcceptButton = {
  readonly onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export const AcceptButton = ({ onClick }: AcceptButton) => {
  return (
    <button
      onClick={onClick}
      title="Delete"
      type="button"
      className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-green-500 bg-green-100 hover:bg-green-200 hover:text-green-700 focus:outline-none focus:ring-green-600 focus:ring-offset-2 focus:bg-green-200 transition-all">
      <CheckIcon className="h-5 w-5" aria-hidden="true" />
    </button>
  );
};
