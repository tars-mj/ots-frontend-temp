import Button from 'components/moleculs/Button';
import DialogModal from 'components/moleculs/DialogModal';
import { createCoord, deleteCoord, deleteLayout, dragCoord } from 'lib/api-routes/my-api';
import { dataQuery } from 'lib/constants/data-query';
import { useRouter } from 'next/router';
import { MouseEvent, useEffect, useReducer, useRef, useState } from 'react';
import { Stage, Layer, Circle, Image, Group, Text } from 'react-konva';
import { useMutation, useQueryClient } from 'react-query';
import useImage from 'use-image';

//https://ipcdn.freshop.com/convert?url=https://r4e3a3i4.stackpathcdn.com/wp-content/uploads/2016/01/store-directory.jpg&type=webp&quality=90

const layoutSize = {
  width: 600,
  height: 400
};

const ImageMap = ({ url }) => {
  const [image] = useImage(url);

  return (
    <Image
      alt="map"
      image={image}
      width={layoutSize.width}
      height={layoutSize.height}
      x={0}
      y={0}
    />
  );
};

type MapType = {
  url: string;
  layoutId: string;
  coords: [];
  selectTasksFn?: (ids: Array<number>) => void;
  selectCoordFn?: (id: number) => void;
  selectedTask: [];
  isParent: boolean;
  isLimited: boolean;
};
const Map = ({
  url,
  layoutId,
  coords,
  selectTasksFn,
  selectCoordFn,
  selectedTask,
  isParent = false,
  isLimited = false
}: MapType) => {
  const router = useRouter();
  const query = router.query;

  const dataStore = dataQuery[isParent ? 'isParent' : 'noParent'];

  const isSelectedTask = (pointId) => {
    const coord = coords.find((p) => p.id === pointId);

    return coord && coord.tasks.some((x) => selectedTask.includes(x.id));
  };

  const [draggable, setDraggable] = useState<{ isDraggable: boolean; x: number; y: number }>({
    isDraggable: false,
    x: 200,
    y: 200
  });

  const [tooltip, setTooltip] = useState<{ coordId: number; x: number; y: number }>();

  const [stage, setStage] = useState({
    scale: 1,
    x: 0,
    y: 0
  });

  useEffect(() => {
    if (window.screen.width <= layoutSize.width) {
      setStage({
        scale: window.screen.width / layoutSize.width,
        x: 0,
        y: 0
      });
    }
  }, []);
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const [stageWidth, setStageWidth] = useState(1000);
  const ref = useRef();
  const [points, setPoint] =
    useState<{ x: number; y: number; id: number; isDraggable: boolean }[]>();

  const closeModalDelete = () => {
    setIsOpen(false);
  };

  const openModalDelete = () => {
    setIsOpen(true);
  };

  const mutationDelete = useMutation(deleteLayout, {
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries([dataStore.layouts]);
      queryClient.invalidateQueries([dataStore.tasks]);
      closeModalDelete();
    }
  });

  const mutationCoord = useMutation(createCoord, {
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries([dataStore.layouts]);
    }
  });

  const mutationCoordDelete = useMutation(deleteCoord, {
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries([dataStore.layouts]);
      queryClient.invalidateQueries([dataStore.tasks]);
    }
  });

  const mutationCoordDrag = useMutation(dragCoord, {
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries([dataStore.layouts]);
    }
  });

  const onDeleteLayout = () => {
    const { clientId, projectId, localizationId } = query;
    mutationDelete.mutate({ clientId, projectId, localizationId, layoutId });
  };

  useEffect(() => {
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  });

  useEffect(() => {
    checkSize();
  }, []);

  //coords init
  useEffect(() => {
    setPoint(coords);
  }, [coords]);

  const checkSize = () => {
    const width = ref.current.offsetWidth;
    setStageWidth(width);
  };

  const startDraggable = (id: number) => {
    // const point = points?.find((p) => p.id === id);
    // const updatePoint = { ...point, isDraggable: true };
    // setPoint(
    //   points?.map((point) => {
    //     return { ...point, updatePoint };
    //   })
    // );
  };

  const endDraggable = (event, id) => {
    // const point = points?.find((p) => p.id === id);
    // const updatePoint = { ...point, isDraggable: false, x: event.target.x(), y: event.target.y() };

    // setPoint(
    //   points?.map((point) => {
    //     return { ...point, updatePoint };
    //   })
    // );

    const updatePoint = { id, x: event.target.x(), y: event.target.y() };
    const coordId = id;
    mutationCoordDrag.mutate({
      ids: { coordId },
      data: updatePoint
    });
  };

  const handleDeleteCoord = (id) => {
    const coordId = id;

    mutationCoordDelete.mutate({ ids: { coordId } });
    setTooltip(undefined);
  };

  const handleZoom = (e) => {
    e.evt.preventDefault();

    const scaleBy = 1.02;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    setStage({
      scale: newScale,
      x: (stage.getPointerPosition().x / newScale - mousePointTo.x) * newScale,
      y: (stage.getPointerPosition().y / newScale - mousePointTo.y) * newScale
    });
  };

  const addPoint = (e: MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    const { clientId, projectId, localizationId } = query;
    mutationCoord.mutate({
      ids: { clientId, projectId, localizationId, layoutId },
      data: { x: 50, y: 50 }
    });

    // if (points) {
    //   setPoint([...points, { x: 50, y: 50, id: Date.now(), isDraggable: false }]);
    //   return;
    // }
    // setPoint([{ x: 50, y: 50, id: Date.now(), isDraggable: false }]);
  };

  const finishedStatuses = ['CANCELED', 'FINISHED', 'ARCHIVED'];

  const pointColor = (point) => {
    return !coords.find((p) => p.id === point.id)?.tasks?.length
      ? '#e5e7eb'
      : point.tasks.every((x) => finishedStatuses.includes(x.status))
      ? '#84cc16'
      : '#ef4444';
  };

  const [coordsMouse, setCoordsMouse] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event) => {
    setCoordsMouse({
      x: event.clientX - event.target.offsetLeft,
      y: event.clientY - event.target.offsetTop
    });
  };

  return (
    <>
      {!isLimited && (
        <span className="flex justify-between">
          <Button onClick={(e) => addPoint(e)} typeBtn="isActive">
            Dodaj punkt
          </Button>
          <Button onClick={() => openModalDelete()} typeBtn="warning">
            Usuń layout
          </Button>
        </span>
      )}
      <div
        onMouseMove={handleMouseMove}
        className={`md:mt-2 relative  overflow-hidden`}
        style={{
          width: '100%',
          backgroundColor: 'red'
        }}
        ref={ref}>
        <Stage
          scaleX={stage.scale}
          scaleY={stage.scale}
          x={stage.x}
          y={stage.y}
          onWheel={handleZoom}
          width={stageWidth}
          height={600}
          className="h-[35vh] md:h-full"
          style={{ backgroundColor: '#f9fafb', overflow: 'hidden' }}>
          <Layer>
            <Group draggable>
              <ImageMap url={url} />

              {points &&
                points.map((point) => {
                  const color = pointColor(point);
                  if (isLimited) {
                    return (
                      <Circle
                        key={point.id}
                        radius={50}
                        x={point.x}
                        y={point.y}
                        fill={isSelectedTask(point.id) ? '#3b82f6' : '#d1d5db'}
                        shadowBlur={2}
                        stroke="#fff"
                        strokeWidth={5}
                        width={stage.scale < 1 ? 50 : 50 / stage.scale}
                        height={stage.scale < 1 ? 50 : 50 / stage.scale}
                      />
                    );
                  } else {
                    return (
                      <Circle
                        key={point.id}
                        radius={50}
                        x={point.x}
                        y={point.y}
                        fill={color}
                        shadowBlur={2}
                        draggable
                        stroke={isSelectedTask(point.id) ? '#fbbf24' : '#fff'}
                        strokeWidth={5}
                        width={stage.scale < 1 ? 50 : 50 / stage.scale}
                        height={stage.scale < 1 ? 50 : 50 / stage.scale}
                        onDragStart={() => startDraggable(point.id)}
                        onDragEnd={(e) => endDraggable(e, point.id)}
                        onMouseUp={(e) =>
                          !tooltip && setTooltip({ coordId: point.id, x: point.x, y: point.y })
                        }
                      />
                    );
                  }
                })}
            </Group>
          </Layer>
        </Stage>
      </div>

      {!isLimited && tooltip && (
        <div
          onMouseLeave={() => setTooltip(undefined)}
          className={`absolute w-40 h-40 bg-gray-200 rounded-md border-4 border-gray-50  shadow-2xl flex flex-col justify-center`}
          style={{ top: coordsMouse.y - 40, left: coordsMouse.x - 30 }}>
          <button
            className="h-10 hover:bg-gray-300 cursor-pointer font-medium text-gray-500"
            onClick={(e) => {
              e.preventDefault();
              selectTasksFn(coords.find((x) => x.id === tooltip.coordId).tasks.map((x) => x.id));
            }}>
            Pokaż wszystkie
          </button>
          <button
            className="h-10 hover:bg-gray-300 cursor-pointer font-medium text-gray-500"
            onClick={(e) => {
              e.preventDefault();
              selectCoordFn(tooltip.coordId);
              setTooltip(undefined);
            }}>
            Przypisz zadanie
          </button>
          <button
            className="h-10 hover:bg-gray-300 cursor-pointer font-medium text-gray-500"
            onClick={(e) => {
              e.preventDefault();
              handleDeleteCoord(tooltip.coordId);
            }}>
            Usuń punkt
          </button>
        </div>
      )}
      {isOpen && (
        <DialogModal
          openStatus={isOpen}
          title={'Plan lokalizacji'}
          message={`Czy na pewno chcesz usunąć plan lokalizacji?`}
          closeModal={closeModalDelete}>
          <div className="">
            <div className="mt-10 mb-10"></div>
            <div className="flex justify-between ">
              <Button size="md" typeBtn="support" onClick={() => closeModalDelete()}>
                Anuluj
              </Button>

              <Button size="md" type="submit" typeBtn="warning" onClick={() => onDeleteLayout()}>
                Usuń
              </Button>
            </div>
          </div>
        </DialogModal>
      )}
    </>
  );
};

export default Map;
