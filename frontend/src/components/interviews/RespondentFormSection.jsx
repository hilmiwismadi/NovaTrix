import { useEffect } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import useInterviewStore from '../../stores/interviewStore';

export default function RespondentFormSection({ formData, onChange, errors = {} }) {
  const { respondents, fetchRespondents } = useInterviewStore();

  useEffect(() => {
    fetchRespondents();
  }, [fetchRespondents]);

  const handleFieldChange = (field, value) => {
    onChange({ ...formData, [field]: value });
  };

  const handleNewRespondentChange = (field, value) => {
    onChange({
      ...formData,
      newRespondent: {
        ...formData.newRespondent,
        [field]: value
      }
    });
  };

  const handleRespondentSelect = (e) => {
    const selectedId = parseInt(e.target.value);
    onChange({
      ...formData,
      respondentId: selectedId || null
    });
  };

  const respondentOptions = respondents.map((r) => ({
    value: r.id,
    label: `${r.name} - ${r.role}${r.division ? ` (${r.division})` : ''}`
  }));

  return (
    <div className="space-y-6">
      {/* Respondent Type Toggle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Respondent Selection
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="respondentType"
              value="existing"
              checked={formData.respondentType === 'existing'}
              onChange={(e) => handleFieldChange('respondentType', e.target.value)}
              className="w-4 h-4 text-cyan focus:ring-cyan/20"
            />
            <span className="text-sm text-gray-700">Select Existing</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="respondentType"
              value="new"
              checked={formData.respondentType === 'new'}
              onChange={(e) => handleFieldChange('respondentType', e.target.value)}
              className="w-4 h-4 text-cyan focus:ring-cyan/20"
            />
            <span className="text-sm text-gray-700">Create New</span>
          </label>
        </div>
      </div>

      {/* Existing Respondent Selection */}
      {formData.respondentType === 'existing' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Respondent <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.respondentId || ''}
            onChange={handleRespondentSelect}
            options={respondentOptions}
            placeholder="Choose a respondent..."
            required
          />
          {errors.respondentId && (
            <p className="text-xs text-red-500 mt-1">{errors.respondentId}</p>
          )}
        </div>
      )}

      {/* New Respondent Form */}
      {formData.respondentType === 'new' && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900">New Respondent Information</h4>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Full name"
              value={formData.newRespondent.name}
              onChange={(e) => handleNewRespondentChange('name', e.target.value)}
              required
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role/Position <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g., Head of IT Security"
              value={formData.newRespondent.role}
              onChange={(e) => handleNewRespondentChange('role', e.target.value)}
              required
            />
            {errors.role && (
              <p className="text-xs text-red-500 mt-1">{errors.role}</p>
            )}
          </div>

          {/* Division */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Division/Department
            </label>
            <Input
              type="text"
              placeholder="e.g., Directorate of IT (DTI)"
              value={formData.newRespondent.division}
              onChange={(e) => handleNewRespondentChange('division', e.target.value)}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <Input
              type="email"
              placeholder="email@example.com"
              value={formData.newRespondent.email}
              onChange={(e) => handleNewRespondentChange('email', e.target.value)}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <Input
              type="tel"
              placeholder="08123456789"
              value={formData.newRespondent.phone}
              onChange={(e) => handleNewRespondentChange('phone', e.target.value)}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <Textarea
              placeholder="Additional notes about the respondent..."
              value={formData.newRespondent.notes}
              onChange={(e) => handleNewRespondentChange('notes', e.target.value)}
              rows={3}
            />
          </div>
        </div>
      )}

      {/* Interview Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Interview Date <span className="text-red-500">*</span>
        </label>
        <Input
          type="date"
          value={formData.interviewDate}
          onChange={(e) => handleFieldChange('interviewDate', e.target.value)}
          required
        />
        {errors.interviewDate && (
          <p className="text-xs text-red-500 mt-1">{errors.interviewDate}</p>
        )}
      </div>
    </div>
  );
}
