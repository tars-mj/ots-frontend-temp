import { LocationMarkerIcon } from '@heroicons/react/outline';
import { Badge } from 'components/atoms/Badge';
import { useEffect, useState } from 'react';
import { TaskStatus } from 'types';
import { capitalize } from '../../lib/utils/capitalize';

type TaskListItemType = {
  readonly id: string;
  readonly title: string;
  readonly status: TaskStatus;
  readonly isSelected?: boolean;
  readonly onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  readonly isCoord: boolean;
};

const TaskListItem = ({
  id,
  title,
  status,
  isSelected = false,
  onClick,
  isCoord
}: TaskListItemType) => {
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    setSelected(isSelected);
  }, [isSelected]);

  return (
    <button
      className={`text-left py-2 ${
        selected && 'bg-gray-50'
      } flex hover:bg-gray-50 cursor-pointer select-none w-full`}
      onClick={onClick}>
      <div className="ml-2 mr-2 w-full">
        <div className="flex justify-between  mb-1">
          <p className="text-xs  text-gray-500">{id}</p>
          <span className="flex flex-row">
            <Badge size="xs" status={status}>
              {capitalize(status)}
            </Badge>
            <LocationMarkerIcon
              className={`h-5 w-5 ml-2 ${isCoord ? 'text-gray-700' : 'text-gray-200'}`}
              aria-hidden="true"
            />
          </span>
        </div>
        <p className="text-xs font-medium text-gray-900 ">{title}</p>
      </div>
    </button>
  );
};

export default TaskListItem;
