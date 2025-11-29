export default function Button({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  className = '',
  size = 'md',
  type = 'button'
}) {
  const baseClasses = 'font-medium transition-all duration-200 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border active:scale-95 hover:scale-[1.02]';

  const variants = {
    primary: 'bg-cyan-600 text-white border-cyan-600 hover:bg-cyan-700 hover:border-cyan-700 shadow-soft hover:shadow-soft-lg',
    secondary: 'bg-white text-gray-600 border-gray-300 hover:border-cyan-600 hover:text-cyan-600 shadow-neumorphic hover:shadow-soft-lg',
    outline: 'bg-transparent text-cyan-600 border-cyan-600 hover:bg-cyan-600/10 hover:border-cyan-700',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',    // 8pt grid: 16px (4×4) horizontal, 8px vertical
    md: 'px-5 py-2.5 text-sm',  // 8pt grid: 20px, 10px
    lg: 'px-6 py-3 text-base',  // 8pt grid: 24px, 12px
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
