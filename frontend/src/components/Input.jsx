const Input = ({ label, error, helper, className = "", ...props }) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="label">
          {label}
        </label>
      )}
      <input
        className={`input-field ${
          error ? "border-red-400 focus:ring-red-500 focus:border-red-500" : ""
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
      {helper && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{helper}</p>
      )}
    </div>
  );
};

export default Input;
