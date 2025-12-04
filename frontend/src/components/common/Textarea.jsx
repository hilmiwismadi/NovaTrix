export default function Textarea({
  placeholder = '',
  value,
  onChange,
  className = '',
  disabled = false,
  rows = 4,
  name = '',
  required = false,
  onBlur = null,
  autoFocus = false
}) {
  // Check if cyan border classes are in className
  const hasCyanBorder = className.includes('border-cyan');
  const baseBorderClass = hasCyanBorder ? '' : 'border-gray-300';
  const focusBorderClass = hasCyanBorder ? '' : 'focus:border-cyan';

  return (
    <textarea
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      rows={rows}
      required={required}
      autoFocus={autoFocus}
      className={`px-4 py-2.5 border ${baseBorderClass} rounded-md shadow-neumorphic-inset focus:outline-none focus:ring-2 focus:ring-cyan-600/20 ${focusBorderClass} disabled:bg-gray-100 disabled:cursor-not-allowed transition-all text-sm resize-vertical ${className}`}
    />
  );
}
