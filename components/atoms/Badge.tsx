import {
  CameraIcon,
  ChatIcon,
  ClipboardListIcon,
  ClockIcon,
  CollectionIcon,
  ExternalLinkIcon,
  PhotographIcon,
  PlusCircleIcon,
  UserAddIcon,
  UserGroupIcon
} from '@heroicons/react/outline';
import { capitalize } from 'lib/utils/capitalize';
import { useState } from 'react';
import { TaskStatus } from 'types';

const colors = {
  gray: 'bg-gray-100 text-gray-800',
  red: 'bg-red-100 text-red-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  green: 'bg-green-100 text-green-800',
  blue: 'bg-blue-100 text-blue-800',
  indigo: 'bg-indigo-100 text-indigo-800',
  purple: 'bg-purple-100 text-purple-800',
  pink: 'bg-pink-100 text-pink-800'
};

const sizes = {
  xs: 'px-2 py-0.5 rounded text-xs',
  md: 'px-2.5 py-0.5 rounded-md text-sm',
  btn: 'px-3 py-[5px] rounded-md text-sm'
};

type BadgeType = {
  readonly children: string;
  readonly size?: keyof typeof sizes;
  readonly color?: keyof typeof colors;
  readonly isButton?: boolean | string;
  readonly onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  readonly status?: TaskStatus;
};

export const Badge = ({
  children,
  size,
  color,
  isButton = false,
  status,
  onClick
}: BadgeType): JSX.Element => {
  const sizeBtn = size ? sizes[size] : sizes.md;
  const colorBtn = color ? colors[color] : colors.gray;

  const statusColors = [
    { DRAFT: colors['gray'] },
    { PLANNED: colors['purple'] },
    { IN_PROGRESS: colors['blue'] },
    { FINISHED: colors['green'] },
    { CONFIRMED: colors['indigo'] },
    { REJECTED: colors['red'] },
    { CANCELED: colors['gray'] },
    { ARCHIVED: colors['gray'] }
  ];

  const statusBtn = status && statusColors.filter((x) => x[status])[0][status];

  if (isButton) {
    return (
      <span
        onClick={onClick}
        className={`inline-flex items-center font-medium ${sizeBtn} ${
          statusBtn || colorBtn
        }  cursor-pointer hover:contrast-75`}>
        {capitalize(children)}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center font-medium ${sizeBtn} ${statusBtn || colorBtn}`}>
      {capitalize(children)}
    </span>
  );
};
