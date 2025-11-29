export default function Card({
  children,
  className = '',
  onClick,
  hoverable = false,
  variant = 'flat'
}) {
  // Auto-enable hover effects if onClick is provided
  const isInteractive = hoverable || onClick;
  const hoverClasses = isInteractive
    ? 'hover:shadow-soft-lg hover:border-cyan-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer'
    : '';

  const variants = {
    flat: 'bg-white border border-gray-200 shadow-soft',
    glass: 'bg-white/75 backdrop-blur-glass border border-cyan-600/10 shadow-glass',
    'glass-strong': 'bg-white/85 backdrop-blur-glass border border-gray-300/50 shadow-glass',
  };

  return (
    <div
      className={`rounded-lg p-6 ${variants[variant]} ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
