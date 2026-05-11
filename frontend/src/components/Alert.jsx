import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

const Alert = ({ type = "info", message, onClose }) => {
  const types = {
    success: {
      container:
        "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800",
      icon: "text-emerald-500",
      text: "text-emerald-800 dark:text-emerald-200",
      close: "hover:bg-emerald-100 dark:hover:bg-emerald-900/40",
      Icon: CheckCircle,
    },
    error: {
      container:
        "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
      icon: "text-red-500",
      text: "text-red-800 dark:text-red-200",
      close: "hover:bg-red-100 dark:hover:bg-red-900/40",
      Icon: AlertCircle,
    },
    warning: {
      container:
        "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800",
      icon: "text-amber-500",
      text: "text-amber-800 dark:text-amber-200",
      close: "hover:bg-amber-100 dark:hover:bg-amber-900/40",
      Icon: AlertTriangle,
    },
    info: {
      container:
        "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
      icon: "text-blue-500",
      text: "text-blue-800 dark:text-blue-200",
      close: "hover:bg-blue-100 dark:hover:bg-blue-900/40",
      Icon: Info,
    },
  };

  const config = types[type] || types.info;
  const { Icon } = config;

  return (
    <div
      className={`${config.container} border rounded-lg px-4 py-3 flex items-start gap-3 animate-fade-in`}
    >
      <Icon className={`${config.icon} w-4 h-4 mt-0.5 flex-shrink-0`} />
      <p className={`${config.text} flex-1 text-sm leading-relaxed`}>
        {message}
      </p>
      {onClose && (
        <button
          onClick={onClose}
          className={`${config.close} flex-shrink-0 p-0.5 rounded transition-colors`}
          aria-label="Dismiss"
        >
          <X className={`${config.icon} w-4 h-4`} />
        </button>
      )}
    </div>
  );
};

export default Alert;
