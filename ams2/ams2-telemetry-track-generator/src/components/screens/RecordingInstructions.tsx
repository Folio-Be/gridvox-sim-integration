import { useState } from "react";
import StepTabs from "../ui/StepTabs";
import ChecklistItem from "../ui/ChecklistItem";
import Callout from "../ui/Callout";
import Button from "../ui/Button";

interface RecordingInstructionsProps {
  onBack: () => void;
  onStartRecording: () => void;
}

const RECORDING_STEPS = [
  {
    title: "Run 1: Outside Border",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBxBp-x3N4lsYbElL89d30lbcSUJZWqqOuTJ73E5kY32Bq6P4XjO-nKB1rQFUgpRqFEDKsrPDhXyn900uTwBq5Zhsr0Xjr1cvAY1i5B8TpnLFUiwYBvxcuTlegcZnKAD04ZB7OS2wBCjrQmqDYeECiUx-TpOfFGESz7yOxZrL2Lm1FlvbOYcdGD-tzUiueC0GHrCYHUWEtQptq2kZ0HQuxdIbxFtVcjjM9VwCf0oXDDPZfXZcmhFl16uxmhDIALLbaRx_-gznDPXqs",
    checklist: [
      "Drive the outermost edge of the track.",
      "Maintain a slow and steady speed.",
      "Complete one full lap from start to finish.",
    ],
    tips: "To ensure an accurate recording, try to avoid making contact with any walls or barriers.",
  },
  {
    title: "Run 2: Inside Border",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBxBp-x3N4lsYbElL89d30lbcSUJZWqqOuTJ73E5kY32Bq6P4XjO-nKB1rQFUgpRqFEDKsrPDhXyn900uTwBq5Zhsr0Xjr1cvAY1i5B8TpnLFUiwYBvxcuTlegcZnKAD04ZB7OS2wBCjrQmqDYeECiUx-TpOfFGESz7yOxZrL2Lm1FlvbOYcdGD-tzUiueC0GHrCYHUWEtQptq2kZ0HQuxdIbxFtVcjjM9VwCf0oXDDPZfXZcmhFl16uxmhDIALLbaRx_-gznDPXqs",
    checklist: [
      "Drive the innermost edge of the track.",
      "Maintain a slow and steady speed.",
      "Complete one full lap from start to finish.",
    ],
    tips: "Try to follow the inside curbs as closely as possible without hitting them.",
  },
  {
    title: "Run 3: Racing Line",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBxBp-x3N4lsYbElL89d30lbcSUJZWqqOuTJ73E5kY32Bq6P4XjO-nKB1rQFUgpRqFEDKsrPDhXyn900uTwBq5Zhsr0Xjr1cvAY1i5B8TpnLFUiwYBvxcuTlegcZnKAD04ZB7OS2wBCjrQmqDYeECiUx-TpOfFGESz7yOxZrL2Lm1FlvbOYcdGD-tzUiueC0GHrCYHUWEtQptq2kZ0HQuxdIbxFtVcjjM9VwCf0oXDDPZfXZcmhFl16uxmhDIALLbaRx_-gznDPXqs",
    checklist: [
      "Drive your ideal racing line at race pace.",
      "Use the full track width and apexes.",
      "Complete one full flying lap.",
    ],
    tips: "This run captures your preferred racing line. Drive naturally and use your normal braking points and turn-in points.",
  },
];

export default function RecordingInstructions({ onBack, onStartRecording }: RecordingInstructionsProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const stepData = RECORDING_STEPS[currentStep - 1];

  return (
    <div className="relative flex h-screen min-h-[800px] w-full flex-col items-center justify-center p-4">
      <div className="layout-container flex h-full max-h-[800px] w-full max-w-[1200px] flex-col overflow-hidden rounded-xl border border-[#444444] bg-[#1E1E1E]">
        <div className="flex-1 p-4 sm:p-8 md:p-12 flex flex-col">
          {/* Tabs */}
          <StepTabs currentStep={currentStep} totalSteps={3} onStepChange={setCurrentStep} />

          <div className="flex flex-1 flex-col items-center justify-center py-6">
            <div className="w-full flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
              {/* Left Column: Diagram */}
              <div className="flex-shrink-0 w-full max-w-sm lg:w-[400px]">
                <div className="w-full aspect-square bg-[#121212] rounded-xl flex items-center justify-center border border-[#444444]">
                  <img
                    alt={`Diagram showing ${stepData.title}`}
                    className="w-full h-full object-cover rounded-xl"
                    src={stepData.image}
                  />
                </div>
              </div>

              {/* Right Column: Content */}
              <div className="flex flex-col w-full">
                {/* PageHeading */}
                <div className="flex flex-wrap justify-between gap-3 mb-4">
                  <h1 className="text-white text-4xl font-bold leading-tight tracking-[-0.033em]">
                    {stepData.title}
                  </h1>
                </div>

                {/* Checklists */}
                <div className="space-y-3 mb-6">
                  {stepData.checklist.map((item, index) => (
                    <ChecklistItem key={index} text={item} />
                  ))}
                </div>

                {/* Callout */}
                <Callout icon="lightbulb" title="Tips" description={stepData.tips} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer: Info and Buttons */}
        <div className="flex items-center justify-between gap-6 border-t border-[#444444] bg-[#121212]/50 px-8 py-4">
          <p className="text-sm text-[#9E9E9E] font-normal">Estimated time: 2-3 minutes</p>
          <div className="flex items-center gap-4">
            <button
              className="px-6 py-2 rounded-lg text-sm font-bold text-text-light bg-transparent border border-[#444444] hover:bg-[#444444] transition-colors"
              onClick={onBack}
            >
              Back to Setup
            </button>
            <Button variant="primary" onClick={onStartRecording}>
              Start Recording
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
