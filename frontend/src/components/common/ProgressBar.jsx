export default function ProgressBar({ value, max = 100, showLabel = true, className = '' }) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-neumorphic-inset">
          <div
            className="h-full bg-gradient-to-r from-cyan to-cyan-dark transition-all duration-300 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <span className="text-sm font-semibold text-gray-900 min-w-[3rem] text-right tabular-nums">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    </div>
  );
}
