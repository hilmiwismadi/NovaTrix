import Card from '../common/Card';

export default function SummaryCard({ title, value, icon: Icon, trend, iconColor = 'text-cyan' }) {
  return (
    <Card variant="glass" className="hover:shadow-soft-lg transition-all">
      <div className="flex justify-between items-start mb-4">
        {Icon && <Icon size={24} className={iconColor} strokeWidth={2} />}
        {trend && <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-500/50">{trend}</span>}
      </div>
      <div className="text-4xl font-bold text-gray-900 mb-1.5 tracking-tight tabular-nums">{value}</div>
      <div className="text-sm text-gray-600 font-medium">{title}</div>
    </Card>
  );
}
