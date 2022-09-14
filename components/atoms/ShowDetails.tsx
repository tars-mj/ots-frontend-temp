import { ChevronDoubleRightIcon } from '@heroicons/react/outline';

type ShowDetailsButton = {
  readonly onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export const ShowDetails = ({ onClick }: ShowDetailsButton) => {
  return (
    <button
      onClick={onClick}
      title="Show"
      type="button"
      className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-green-500 bg-green-100 hover:bg-green-200 hover:text-green-600 focus:outline-none focus:ring-green-300 focus:ring-offset-2 focus:bg-green-200 transition-all">
      <ChevronDoubleRightIcon className="h-5 w-5" aria-hidden="true" />
    </button>
  );
};
