interface TitleBarProps {
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}

export default function TitleBar({ onMinimize, onMaximize, onClose }: TitleBarProps) {
  return (
    <div className="flex-shrink-0" style={{ WebkitAppRegion: "drag" } as React.CSSProperties}>
      <div className="flex justify-between gap-2 px-4 py-2">
        <div className="flex gap-1" style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
          <button
            className="p-2 text-text-muted hover:text-text-light transition-colors"
            onClick={onMinimize}
          >
            <span className="material-symbols-outlined text-base">remove</span>
          </button>
          <button
            className="p-2 text-text-muted hover:text-text-light transition-colors"
            onClick={onMaximize}
          >
            <span className="material-symbols-outlined text-base">crop_square</span>
          </button>
          <button
            className="p-2 text-text-muted hover:bg-red-600 hover:text-white transition-colors rounded-sm"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
