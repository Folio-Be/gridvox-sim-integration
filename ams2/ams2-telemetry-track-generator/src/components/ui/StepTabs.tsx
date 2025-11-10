interface StepTabsProps {
  currentStep: number;
  totalSteps: number;
  onStepChange?: (step: number) => void;
}

export default function StepTabs({ currentStep, totalSteps, onStepChange }: StepTabsProps) {
  return (
    <div className="pb-3">
      <div className="flex border-b border-[#444444] justify-center gap-8">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <a
            key={step}
            className={`flex flex-col items-center justify-center border-b-[3px] pb-3 pt-2 px-4 transition-colors cursor-pointer ${
              step === currentStep
                ? "border-b-primary text-primary"
                : "border-b-transparent text-[#9E9E9E] hover:text-primary"
            }`}
            onClick={() => onStepChange?.(step)}
          >
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">
              {step}/{totalSteps}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
