import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Shield, Bot, Activity, Loader2 } from 'lucide-react';
import SummaryCard from '../components/dashboard/SummaryCard';
import QuickActions from '../components/dashboard/QuickActions';
import ActivityTimeline from '../components/dashboard/ActivityTimeline';
import useDashboardStore from '../stores/dashboardStore';

export default function MainDashboard() {
  const navigate = useNavigate();
  const {
    documentStats,
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
  const hasData = documentStats || controlStats || activities.length > 0;
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SummaryCard
          title="Documents Uploaded"
          value={documentStats?.total || 0}
          icon={FileText}
          trend={documentStats?.thisWeek ? `+${documentStats.thisWeek} this week` : undefined}
          iconColor="text-cyan"
          onClick={() => navigate('/documents')}
        />
        <SummaryCard
          title="Controls Analyzed"
          value={controlStats?.analyzedControls || 0}
          icon={Shield}
          iconColor="text-cyan"
          trend={`${controlStats?.total || 0} total`}
          onClick={() => navigate('/controls-new')}
        />
        <SummaryCard
          title="System Activity"
          value={activities.length}
          icon={Activity}
          iconColor="text-cyan"
          trend="Latest events"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RAG + Control Analysis Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Bot size={18} className="text-cyan-600" />
              <h3 className="text-lg font-semibold text-gray-900">RAG & Analysis Overview</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-500 uppercase">Analyzed Controls</p>
                <p className="text-2xl font-bold text-gray-900">{controlStats?.analyzedControls || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-500 uppercase">Pending Analysis</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.max((controlStats?.total || 0) - (controlStats?.analyzedControls || 0), 0)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-500 uppercase">RAG Runs Logged</p>
                <p className="text-2xl font-bold text-gray-900">{activities.filter((a) => a.type === 'document').length}</p>
              </div>
            </div>
          </div>
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
