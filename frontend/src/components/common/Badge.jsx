export default function Badge({ children, variant = 'default', size = 'md' }) {
  const baseClasses = 'inline-block font-semibold border';

  const variants = {
    compliant: 'bg-green-50 text-green-800 border-green-500/50',
    partial: 'bg-orange-50 text-orange-800 border-orange-500/50',
    'non-compliant': 'bg-red-50 text-red-800 border-red-500/50',
    high: 'bg-red-50 text-red-800 border-red-500/50',
    medium: 'bg-orange-50 text-orange-800 border-orange-500/50',
    low: 'bg-gray-100 text-gray-700 border-gray-400/50',
    default: 'bg-gray-100 text-gray-700 border-gray-300/50',
    raw: 'bg-gray-100 text-gray-700 border-gray-300/50',
    analyzed: 'bg-blue-50 text-blue-800 border-blue-500/50',
    verified: 'bg-green-50 text-green-800 border-green-500/50',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs rounded-sm',
    md: 'px-3 py-1 text-xs rounded-md',
    lg: 'px-4 py-1.5 text-sm rounded-md',
  };

  return (
    <span className={`${baseClasses} ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
}
