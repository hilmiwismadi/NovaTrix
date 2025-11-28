import { FileText, MessageSquare, Shield, TrendingUp } from 'lucide-react';
import SummaryCard from '../components/dashboard/SummaryCard';
import ComplianceChart from '../components/dashboard/ComplianceChart';
import QuickActions from '../components/dashboard/QuickActions';
import ActivityTimeline from '../components/dashboard/ActivityTimeline';
import { documents } from '../data/mockDocuments';
import { interviews } from '../data/mockInterviews';
import { getComplianceStats, getAverageComplianceScore } from '../data/mockAnnexA';
import { getRecentActivities } from '../data/mockActivities';

export default function MainDashboard() {
  const stats = getComplianceStats();
  const avgScore = getAverageComplianceScore();
  const recentActivities = getRecentActivities(15);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-gray-500 mt-1.5 text-sm">Personal Audit Command Center</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Documents Uploaded"
          value={documents.length}
          icon={FileText}
          trend="+2 this week"
          iconColor="text-cyan"
        />
        <SummaryCard
          title="Interviews Added"
          value={interviews.length}
          icon={MessageSquare}
          trend="+1 this week"
          iconColor="text-cyan"
        />
        <SummaryCard
          title="Controls Analyzed"
          value={stats.total}
          icon={Shield}
          iconColor="text-cyan"
        />
        <SummaryCard
          title="Compliance Score"
          value={`${avgScore}%`}
          icon={TrendingUp}
          trend="+3% improvement"
          iconColor="text-green-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <ComplianceChart
            compliant={stats.compliant}
            partial={stats.partial}
            nonCompliant={stats.nonCompliant}
          />
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>

      {/* Recent Activity */}
      <ActivityTimeline activities={recentActivities} />
    </div>
  );
}
