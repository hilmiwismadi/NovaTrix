import Card from '../common/Card';

export default function ComplianceChart({ compliant, partial, nonCompliant }) {
  const total = compliant + partial + nonCompliant;
  const compliantPercent = total > 0 ? (compliant / total) * 100 : 0;
  const partialPercent = total > 0 ? (partial / total) * 100 : 0;
  const nonCompliantPercent = total > 0 ? (nonCompliant / total) * 100 : 0;

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Compliance Status</h3>

      <div className="space-y-5">
        {/* Compliant */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-800">Compliant</span>
            <span className="text-sm font-semibold text-gray-900 tabular-nums">{compliant}</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-neumorphic-inset">
            <div
              className="h-full bg-gradient-to-r from-cyan to-cyan-dark transition-all duration-300"
              style={{ width: `${compliantPercent}%` }}
            />
          </div>
        </div>

        {/* Partial */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-800">Partially Compliant</span>
            <span className="text-sm font-semibold text-gray-900 tabular-nums">{partial}</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-neumorphic-inset">
            <div
              className="h-full bg-gradient-to-r from-cyan/70 to-cyan-dark/70 transition-all duration-300"
              style={{ width: `${partialPercent}%` }}
            />
          </div>
        </div>

        {/* Non-compliant */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-800">Non-Compliant</span>
            <span className="text-sm font-semibold text-gray-900 tabular-nums">{nonCompliant}</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-neumorphic-inset">
            <div
              className="h-full bg-gradient-to-r from-cyan/40 to-cyan-dark/40 transition-all duration-300"
              style={{ width: `${nonCompliantPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-gray-200/80">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-800">Total Controls</span>
          <span className="text-lg font-bold text-gray-900 tracking-tight tabular-nums">{total}</span>
        </div>
      </div>
    </Card>
  );
}
