const Loader = ({ size = "md", fullScreen = false, text = "" }) => {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-7 h-7 border-[3px]",
    lg: "w-10 h-10 border-4",
    xl: "w-14 h-14 border-4",
  };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${sizes[size]} border-gray-200 dark:border-gray-700 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin`}
      />
      {text && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-12">
      {spinner}
    </div>
  );
};

export default Loader;
