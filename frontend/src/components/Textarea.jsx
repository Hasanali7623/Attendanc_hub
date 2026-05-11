const Textarea = ({ label, error, className = "", ...props }) => {
  return (
    <div className="mb-4">
      {label && <label className="label">{label}</label>}
      <textarea
        className={`input-field resize-none ${
          error ? "border-red-500 focus:ring-red-500" : ""
        } ${className}`}
        rows={4}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default Textarea;
