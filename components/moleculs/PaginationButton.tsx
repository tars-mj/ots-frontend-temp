import {
  ChevronDoubleLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleRightIcon
} from '@heroicons/react/outline';
import { MouseEventHandler } from 'react';

type PaginationType = {
  type: keyof typeof styles;
  disabled: boolean;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
  className: string;
  children: string | null;
};

const styles = {
  first:
    'relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50',
  prev: 'relative inline-flex items-center px-2 py-2  border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50',
  next: 'relative inline-flex items-center px-2 py-2  border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50',
  last: 'relative inline-flex items-center px-2 py-2  rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50',
  page: 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium',
  isActivePage:
    'z-10 bg-indigo-50 border-indigo-500 text-indigo-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium',
  dots: 'relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700'
};

export const PaginationButton = ({
  type,
  disabled,
  onClick,
  className,
  children = null
}: PaginationType) => {
  return (
    <button
      disabled={disabled}
      onClick={(e) => onClick(e)}
      className={`${styles[type]} ${className}`}>
      {type === 'first' && <ChevronDoubleLeftIcon className="h-5 w-5" aria-hidden="true" />}
      {type === 'prev' && <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />}
      {type === 'next' && <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />}
      {type === 'last' && <ChevronDoubleRightIcon className="h-5 w-5" aria-hidden="true" />}
      {type === 'page' && <span>{children}</span>}
      {type === 'isActivePage' && <span>{children}</span>}
      {type === 'dots' && <span>{children}</span>}
    </button>
  );
};
