import { SelectorIcon } from '@heroicons/react/outline';

type SelectAll = {
  readonly onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export const SelectAllButton = ({ onClick }: SelectAll) => {
  return (
    <button
      onClick={onClick}
      title="Show"
      type="button"
      className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-primary-blue-500 bg-primary-blue-100 hover:bg-primary-blue-100 hover:text-primary-blue-500 focus:outline-none focus:ring-primary-blue-300 focus:ring-offset-2 focus:bg-primary-blue-100 transition-all">
      <SelectorIcon className="h-5 w-5" aria-hidden="true" />
    </button>
  );
};
