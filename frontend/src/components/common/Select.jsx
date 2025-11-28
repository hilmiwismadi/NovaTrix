import { ChevronDown } from 'lucide-react';

export default function Select({
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  className = '',
  disabled = false,
  name = '',
  required = false
}) {
  return (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-md shadow-neumorphic-inset focus:outline-none focus:ring-2 focus:ring-cyan/20 focus:border-cyan disabled:bg-gray-100 disabled:cursor-not-allowed transition-all text-sm appearance-none bg-white ${className}`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={18}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
    </div>
  );
}
