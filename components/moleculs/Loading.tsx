import { Spinner } from 'components/atoms/Spinner';

const Loading = () => {
  return (
    <div className="w-full h-3/4 flex justify-center items-center">
      <Spinner />
    </div>
  );
};
export default Loading;
