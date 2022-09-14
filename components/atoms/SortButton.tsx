import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/outline';

type DirectionButtonType = {
  direction: 'asc' | 'desc';
};

export const SortButton = ({ direction }: DirectionButtonType) => {
  if (direction === 'asc') {
    return (
      <span className="relative">
        <ChevronUpIcon
          className="h-5 w-5 bg-neutrals-blueGray-100 rounded-full ml-2 p-1 absolute"
          aria-hidden="true"
        />
      </span>
    );
  }
  return (
    <span className="relative">
      <ChevronDownIcon
        className="h-5 w-5 bg-neutrals-blueGray-100 rounded-full ml-2 p-1 absolute"
        aria-hidden="true"
      />
    </span>
  );
};
