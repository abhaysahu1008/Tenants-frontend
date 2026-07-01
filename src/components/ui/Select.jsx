import { cn } from "../../utils/cn";

export const Select = ({
  label,
  error,
  options = [],
  className,
  containerClassName,
  placeholder = "Select...",
  ...props
}) => (
  <div className={cn("w-full", containerClassName)}>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
    )}
    <select
      className={cn(
        "w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors appearance-none",
        error && "border-danger focus:ring-danger",
        className,
      )}
      {...props}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="mt-1 text-sm text-danger">{error}</p>}
  </div>
);
