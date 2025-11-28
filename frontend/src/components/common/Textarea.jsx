export default function Textarea({
  placeholder = '',
  value,
  onChange,
  className = '',
  disabled = false,
  rows = 4,
  name = '',
  required = false
}) {
  return (
    <textarea
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      rows={rows}
      required={required}
      className={`px-4 py-2.5 border border-gray-300 rounded-md shadow-neumorphic-inset focus:outline-none focus:ring-2 focus:ring-cyan/20 focus:border-cyan disabled:bg-gray-100 disabled:cursor-not-allowed transition-all text-sm resize-vertical ${className}`}
    />
  );
}
