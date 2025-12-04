import { ChevronDown } from 'lucide-react';

export default function Select({
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  className = '',
  disabled = false,
  name = '',
  required = false,
  autoFocus = false
}) {
  // Check if cyan border classes are in className
  const hasCyanBorder = className.includes('border-cyan');
  const baseBorderClass = hasCyanBorder ? '' : 'border-gray-300';
  const focusBorderClass = hasCyanBorder ? '' : 'focus:border-cyan';

  return (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        autoFocus={autoFocus}
        className={`w-full px-4 py-2.5 pr-10 border ${baseBorderClass} rounded-md shadow-neumorphic-inset focus:outline-none focus:ring-2 focus:ring-cyan-600/20 ${focusBorderClass} disabled:bg-gray-100 disabled:cursor-not-allowed transition-all text-sm appearance-none bg-white ${className}`}
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
