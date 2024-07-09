const LoggingIn = () => {
  return (
    <main className="flex flex-col mb-16 h-full">
      {/* Hero Section */}
      <div className="flex sm:flex-row flex-col gap-4 p-4 items-left justify-between bg-gradient-to-r from-blue-400 to-purple-600 text-white py-8">
        <div className="flex flex-col gap-4">
          <h1 className="appear font-SFProItalic lg:text-6xl md:text-4xl text-4xl ">
            Logging you in...
          </h1>
          <p className="appear font-primary text-white/70 lg:text-lg md:text-md text-sm  ml-4 mt-2">
            Who wants to enter password everytime !?
          </p>
        </div>
      </div>
      <div className="flex justify-center items-center h-full w-full">
        <div className="flex flex-row gap-3 items-center">
          <div className="w-5 h-5 border-4 border-blue-500 spinner"></div>
          <p className="font-primary text-2xl font-medium text-neutral-700">
            Please wait...
          </p>
        </div>
      </div>
    </main>
  );
};

export default LoggingIn;
