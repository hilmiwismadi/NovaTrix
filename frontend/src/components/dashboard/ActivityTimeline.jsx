import { FileText, MessageSquare, Shield, Activity, CheckCircle } from 'lucide-react';
import Card from '../common/Card';

const getIcon = (type) => {
  const icons = {
    document: FileText,
    interview: MessageSquare,
    control: Shield,
    analysis: Activity,
    soa: CheckCircle,
    gap: Activity,
    system: Activity
  };
  return icons[type] || Activity;
};

const getIconColor = (action) => {
  // Moderate cyan approach - use cyan with varying opacity for brand consistency
  const colors = {
    uploaded: 'text-cyan-600',
    analyzed: 'text-cyan-600',
    added: 'text-cyan-600/80',
    completed: 'text-cyan-600/70',
    verified: 'text-cyan-600',
    generated: 'text-cyan-600/80',
    updated: 'text-cyan-600/70'
  };
  return colors[action] || 'text-cyan-600/60';
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function ActivityTimeline({ activities }) {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
      <div className="space-y-5 max-h-96 overflow-y-auto pr-2">
        {activities.map((activity) => {
          const Icon = getIcon(activity.type);
          const iconColor = getIconColor(activity.action);

          return (
            <div key={activity.id} className="flex gap-3.5 pb-5 border-b border-gray-100 last:border-0 last:pb-0">
              <div className={`flex-shrink-0 ${iconColor} mt-0.5`}>
                <Icon size={18} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 font-medium leading-relaxed">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{activity.detail}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-400">{formatTime(activity.timestamp)}</span>
                  <span className="text-xs text-gray-300">•</span>
                  <span className="text-xs text-gray-400">{activity.user}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
