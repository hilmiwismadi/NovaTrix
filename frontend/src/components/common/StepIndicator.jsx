import { Check } from 'lucide-react';

export default function StepIndicator({ steps = [], currentStep = 1 }) {
  return (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto mb-8">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        const isUpcoming = stepNumber > currentStep;

        return (
          <div key={stepNumber} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all
                  ${isCompleted ? 'bg-cyan text-white' : ''}
                  ${isCurrent ? 'bg-cyan text-white ring-4 ring-cyan/20' : ''}
                  ${isUpcoming ? 'bg-gray-200 text-gray-500' : ''}
                `}
              >
                {isCompleted ? <Check size={20} /> : stepNumber}
              </div>
              <span
                className={`
                  mt-2 text-xs font-medium
                  ${isCurrent || isCompleted ? 'text-cyan' : 'text-gray-500'}
                `}
              >
                {step}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`
                  flex-1 h-0.5 mx-2 transition-all
                  ${stepNumber < currentStep ? 'bg-cyan' : 'bg-gray-200'}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
