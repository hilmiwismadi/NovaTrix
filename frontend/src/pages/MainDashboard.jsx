import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, MessageSquare, Shield, TrendingUp, Loader2 } from 'lucide-react';
import SummaryCard from '../components/dashboard/SummaryCard';
import ComplianceChart from '../components/dashboard/ComplianceChart';
import QuickActions from '../components/dashboard/QuickActions';
import ActivityTimeline from '../components/dashboard/ActivityTimeline';
import useDashboardStore from '../stores/dashboardStore';

export default function MainDashboard() {
  const navigate = useNavigate();
  const {
    documentStats,
    interviewStats,
    controlStats,
    activities,
    isLoading,
    errors,
    fetchAllDashboardData
  } = useDashboardStore();

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchAllDashboardData();
  }, [fetchAllDashboardData]);

  // Loading state
  if (isLoading.overall && !documentStats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="inline-block animate-spin text-cyan-600 mb-2" size={48} />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state (if all failed)
  const hasData = documentStats || interviewStats || controlStats || activities.length > 0;
  if (!hasData && (errors.documents || errors.interviews || errors.controls || errors.activities)) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-medium">Error loading dashboard</h3>
        <p className="text-red-600 text-sm mt-1">
          {errors.documents || errors.interviews || errors.controls || errors.activities}
        </p>
        <button
          onClick={() => fetchAllDashboardData()}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

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
          value={documentStats?.total || 0}
          icon={FileText}
          trend={documentStats?.thisWeek ? `+${documentStats.thisWeek} this week` : undefined}
          iconColor="text-cyan"
          onClick={() => navigate('/documents')}
        />
        <SummaryCard
          title="Interviews Added"
          value={interviewStats?.total || 0}
          icon={MessageSquare}
          trend={interviewStats?.thisWeek ? `+${interviewStats.thisWeek} this week` : undefined}
          iconColor="text-cyan"
          onClick={() => navigate('/interviews')}
        />
        <SummaryCard
          title="Controls Analyzed"
          value={controlStats?.total || 0}
          icon={Shield}
          iconColor="text-cyan"
          onClick={() => navigate('/controls')}
        />
        <SummaryCard
          title="Compliance Score"
          value={`${controlStats?.averageScore || 0}%`}
          icon={TrendingUp}
          trend="+3% improvement"
          iconColor="text-green-500"
          onClick={() => navigate('/gaps')}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <ComplianceChart
            compliant={controlStats?.compliant || 0}
            partial={controlStats?.partial || 0}
            nonCompliant={controlStats?.nonCompliant || 0}
          />
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>

      {/* Recent Activity */}
      <ActivityTimeline activities={activities} />
    </div>
  );
}
