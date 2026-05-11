const Select = ({ label, error, options = [], className = "", ...props }) => {
  return (
    <div className="mb-4">
      {label && <label className="label">{label}</label>}
      <select
        className={`input-field text-gray-900 dark:text-gray-100 ${
          error ? "border-red-500 focus:ring-red-500" : ""
        } ${className}`}
        {...props}
      >
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default Select;
