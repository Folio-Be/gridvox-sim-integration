import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
  height?: string;
}

export default function Modal({ isOpen, onClose, children, maxWidth = "600px", height }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

      {/* Modal Container */}
      <div
        className="relative flex flex-col w-full bg-[#2A2A2A] text-text-light rounded-xl shadow-2xl p-6"
        style={{ maxWidth, height }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
