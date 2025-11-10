import { useState, useEffect, useRef } from "react";

interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
  message: string;
}

interface DebugConsoleProps {
  entries?: LogEntry[];
}

// Global console instance
class ConsoleManager {
  private listeners: Set<(entries: LogEntry[]) => void> = new Set();
  private entries: LogEntry[] = [];

  log(message: string, level: "info" | "warn" | "error" | "success" = "info") {
    const entry: LogEntry = {
      timestamp: new Intl.DateTimeFormat("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        fractionalSecondDigits: 3,
      } as Intl.DateTimeFormatOptions & { fractionalSecondDigits?: number }).format(new Date()),
      level,
      message,
    };

    this.entries.push(entry);

    // Keep last 1000 entries
    if (this.entries.length > 1000) {
      this.entries = this.entries.slice(-1000);
    }

    this.notifyListeners();
  }

  info(message: string) {
    this.log(message, "info");
  }

  warn(message: string) {
    this.log(message, "warn");
  }

  error(message: string) {
    this.log(message, "error");
  }

  success(message: string) {
    this.log(message, "success");
  }

  clear() {
    this.entries = [];
    this.notifyListeners();
  }

  getEntries() {
    return [...this.entries];
  }

  subscribe(listener: (entries: LogEntry[]) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener([...this.entries]));
  }
}

// Singleton instance
export const debugConsole = new ConsoleManager();

// Make it globally available
if (typeof window !== "undefined") {
  (window as any).debugConsole = debugConsole;
}

export default function DebugConsole({ entries: propEntries }: DebugConsoleProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [entries, setEntries] = useState<LogEntry[]>(propEntries || debugConsole.getEntries());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Subscribe to console updates
    const unsubscribe = debugConsole.subscribe((newEntries) => {
      setEntries(newEntries);
    });

    return unsubscribe;
  }, []);

  // Auto-scroll to bottom when entries change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  const getColorClass = (level: LogEntry["level"]) => {
    switch (level) {
      case "error":
        return "text-red-400";
      case "warn":
        return "text-yellow-400";
      case "success":
        return "text-green-400";
      default:
        return "text-[#9ac1a0]";
    }
  };

  const getLevelIcon = (level: LogEntry["level"]) => {
    switch (level) {
      case "error":
        return "❌";
      case "warn":
        return "⚠️";
      case "success":
        return "✅";
      default:
        return "ℹ️";
    }
  };

  return (
    <div
      className={`h-full border-r border-green-border bg-[#0a110b] flex flex-col transition-all duration-300 ${isCollapsed ? "w-12" : "w-80"
        }`}
    >
      {/* Console Header */}
      <div className="px-4 py-3 border-b border-green-border flex items-center justify-between">
        {!isCollapsed && <h3 className="text-white text-sm font-bold">Debug Console</h3>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-white hover:text-primary transition-colors ml-auto"
          title={isCollapsed ? "Expand console" : "Collapse console"}
        >
          <span className="material-symbols-outlined text-base">
            {isCollapsed ? "chevron_right" : "chevron_left"}
          </span>
        </button>
      </div>

      {/* Console Content */}
      {!isCollapsed && (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 font-mono text-xs">
            {entries.length === 0 ? (
              <div className="text-[#6b7280] text-center py-4">No messages</div>
            ) : (
              entries.map((entry, index) => (
                <div key={index} className="py-1 border-b border-green-border/30">
                  <div className="flex items-start gap-2">
                    <span className="text-xs">{getLevelIcon(entry.level)}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-[#6b7280]">[{entry.timestamp}]</span>{" "}
                      <span className={getColorClass(entry.level)}>{entry.message}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Console Footer */}
          <div className="px-4 py-2 border-t border-green-border flex items-center justify-between">
            <span className="text-[#6b7280] text-xs">{entries.length} messages</span>
            <button
              onClick={() => debugConsole.clear()}
              className="text-[#6b7280] hover:text-red-400 text-xs transition-colors"
            >
              Clear
            </button>
          </div>
        </>
      )}
    </div>
  );
}
