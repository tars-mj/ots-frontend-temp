const PermisionDenied = () => {
  return (
    <div className="w-full h-full overflow-hidden flex bg-primary-blue-50 ">
      <div className="l flex justify-center items-center h-screen w-full">
        <div className="mx-auto flex flex-col items-start justify-between ">
          <span className="text-2xl font-light w-full text-center text-primary-blue-500">
            Brak uprawnień
          </span>
        </div>
      </div>
    </div>
  );
};

export default PermisionDenied;
