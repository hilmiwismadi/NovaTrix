import { useNavigate } from 'react-router-dom';
import { Upload, MessageSquarePlus, FileCheck, Download } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Upload Document',
      icon: Upload,
      onClick: () => navigate('/documents'),
      variant: 'primary'
    },
    {
      label: 'Add Interview',
      icon: MessageSquarePlus,
      onClick: () => navigate('/interviews'),
      variant: 'primary'
    },
    {
      label: 'View SOA',
      icon: FileCheck,
      onClick: () => navigate('/soa'),
      variant: 'secondary'
    },
    {
      label: 'Export Report',
      icon: Download,
      onClick: () => alert('Export functionality - Coming soon'),
      variant: 'secondary'
    }
  ];

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2.5">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant}
            onClick={action.onClick}
            size="sm"
            className="flex items-center justify-center gap-2 text-xs"
          >
            <action.icon size={16} strokeWidth={2} />
            <span>{action.label}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
}
