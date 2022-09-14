import { LocationMarkerIcon } from '@heroicons/react/outline';

type ShowDetailsButton = {
  readonly onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export const LocationButton = ({ onClick }: ShowDetailsButton) => {
  return (
    <button
      onClick={onClick}
      title="Show"
      type="button"
      className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-orange-500 bg-orange-100 hover:bg-orange-200 hover:text-orange-600 focus:outline-none focus:ring-orange-300 focus:ring-offset-2 focus:bg-orange-200 transition-all">
      <LocationMarkerIcon className="h-5 w-5" aria-hidden="true" />
    </button>
  );
};
