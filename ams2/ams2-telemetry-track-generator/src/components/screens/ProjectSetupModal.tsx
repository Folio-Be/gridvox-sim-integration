import { useState } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import RadioOption from "../ui/RadioOption";
import Button from "../ui/Button";

interface ProjectSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: (data: ProjectData) => void;
}

export interface ProjectData {
  trackName: string;
  variation: string;
  location: string;
  notes: string;
  recordingMethod: "manual" | "load-files";
  outputDirectory: string;
}

export default function ProjectSetupModal({ isOpen, onClose, onNext }: ProjectSetupModalProps) {
  const [formData, setFormData] = useState<ProjectData>({
    trackName: "",
    variation: "",
    location: "",
    notes: "",
    recordingMethod: "manual",
    outputDirectory: "C:\\Users\\User\\Documents\\TrackModels\\",
  });

  const handleBrowse = async () => {
    // TODO: Implement file dialog using Tauri
    console.log("Browse for directory");
  };

  const handleNext = () => {
    onNext(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="600px" height="580px">
      {/* PageHeading */}
      <div className="flex flex-wrap justify-between gap-3 pb-4">
        <p className="text-white text-2xl font-bold leading-tight">Create New Track Model</p>
      </div>

      {/* Form Content */}
      <div className="flex flex-col space-y-4">
        {/* Track Details */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Track Name"
            placeholder="e.g., Silverstone"
            value={formData.trackName}
            onChange={(e) => setFormData({ ...formData, trackName: e.target.value })}
          />
          <Input
            label="Variation"
            placeholder="e.g., Grand Prix Circuit"
            value={formData.variation}
            onChange={(e) => setFormData({ ...formData, variation: e.target.value })}
          />
        </div>

        <Input
          label="Location"
          placeholder="e.g., United Kingdom"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        />

        <Textarea
          label="Notes"
          placeholder="e.g., Dry conditions, GT3 setup"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />

        {/* SectionHeader */}
        <h3 className="text-white text-base font-bold leading-tight tracking-[-0.015em] pt-2">
          Recording Method
        </h3>

        {/* Radio Buttons */}
        <div className="space-y-2">
          <RadioOption
            name="recording-method"
            label="Manual 3-Run Recording"
            value="manual"
            checked={formData.recordingMethod === "manual"}
            onChange={(e) => setFormData({ ...formData, recordingMethod: e.target.value as "manual" | "load-files" })}
          />
          <RadioOption
            name="recording-method"
            label="Load Existing Telemetry Files"
            value="load-files"
            checked={formData.recordingMethod === "load-files"}
            onChange={(e) => setFormData({ ...formData, recordingMethod: e.target.value as "manual" | "load-files" })}
          />
        </div>

        {/* Output Directory */}
        <label className="flex flex-col pt-2">
          <p className="text-text-light text-sm font-medium pb-1.5">Output Directory</p>
          <div className="flex items-center gap-2">
            <input
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-400 border-none bg-[#222222] h-12 p-3 text-sm font-normal"
              readOnly
              value={formData.outputDirectory}
            />
            <Button variant="secondary" onClick={handleBrowse}>
              Browse...
            </Button>
          </div>
        </label>
      </div>

      {/* Footer Actions */}
      <div className="flex-grow"></div>
      <div className="flex justify-end items-center gap-3 pt-6 border-t border-t-gray-700/50">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleNext}>
          Next: Recording
        </Button>
      </div>
    </Modal>
  );
}
