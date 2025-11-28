export default function Input({
  type = 'text',
  placeholder = '',
  value,
  onChange,
  className = '',
  disabled = false
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`px-4 py-2.5 border border-gray-300 rounded-md shadow-neumorphic-inset focus:outline-none focus:ring-2 focus:ring-cyan/20 focus:border-cyan disabled:bg-gray-100 disabled:cursor-not-allowed transition-all text-sm ${className}`}
    />
  );
}
