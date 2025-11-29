import Card from '../common/Card';

export default function SummaryCard({ title, value, icon: Icon, trend, iconColor = 'text-cyan', onClick }) {
  const isClickable = !!onClick;

  return (
    <Card
      variant="glass"
      className={`
        transition-all duration-200
        ${isClickable ? 'cursor-pointer hover:shadow-soft-lg hover:scale-[1.02] hover:border-cyan-600/50 active:scale-[0.98]' : ''}
        ${isClickable ? 'group' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        {Icon && (
          <div className={`
            transition-all duration-200
            ${isClickable ? 'group-hover:scale-110 group-hover:text-cyan-600' : ''}
          `}>
            <Icon size={24} className={iconColor} strokeWidth={2} />
          </div>
        )}
        {trend && (
          <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-500/50">
            {trend}
          </span>
        )}
      </div>
      <div className={`
        text-4xl font-bold text-gray-900 mb-1.5 tracking-tight tabular-nums
        transition-colors duration-200
        ${isClickable ? 'group-hover:text-cyan-600' : ''}
      `}>
        {value}
      </div>
      <div className="text-sm text-gray-600 font-medium">{title}</div>
    </Card>
  );
}
