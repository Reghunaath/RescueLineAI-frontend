import { useCallData } from "./useCallData";

function formatTimestamp(timestamp) {
  if (!timestamp) return "";

  // If already formatted as HH:MM:SS, return as-is
  if (typeof timestamp === "string" && /^\d{2}:\d{2}:\d{2}$/.test(timestamp)) {
    return timestamp;
  }

  // Otherwise parse as ISO string and format
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  } catch {
    return String(timestamp);
  }
}

const PRIORITY_COLORS = {
  P0: { bg: "bg-priority-p0/20", text: "text-priority-p0", border: "border-priority-p0", solid: "bg-priority-p0" },
  P1: { bg: "bg-priority-p1/20", text: "text-priority-p1", border: "border-priority-p1", solid: "bg-priority-p1" },
  P2: { bg: "bg-priority-p2/20", text: "text-priority-p2", border: "border-priority-p2", solid: "bg-priority-p2" },
  P3: { bg: "bg-priority-p3/20", text: "text-priority-p3", border: "border-priority-p3", solid: "bg-priority-p3" },
};

const COLUMNS = [
  {
    key: "waitlist",
    label: "Waitlist",
    dotColor: "bg-priority-p2",
    dotPulse: true,
    headerTextColor: "text-gray-400",
    badgeStyle: "bg-gray-800 text-gray-400",
    wrapperClass: "bg-gray-900/30 rounded-xl p-2 border border-dashed border-gray-800",
  },
  {
    key: "human_agent",
    label: "Human Agent",
    dotColor: "bg-priority-p0",
    dotPulse: true,
    headerTextColor: "text-white",
    badgeStyle: "bg-gray-800 text-gray-400",
    wrapperClass: "bg-gray-900/30 rounded-xl p-2 border border-dashed border-gray-800",
  },
];

function CallCard({ call, isAiAgent, isCompleted, isHumanAgent, onAssignToAgent }) {
  const colors = PRIORITY_COLORS[call.priority] || PRIORITY_COLORS.P3;
  const isWaitlist = !isAiAgent && !isCompleted && !isHumanAgent;

  if (isCompleted) {
    return (
      <div className="card-enter bg-card-dark rounded-lg p-4 border-l-4 border-gray-600 grayscale opacity-80">
        <div className="flex justify-between items-center mb-2">
          <span className="bg-gray-700 text-gray-400 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide">
            {call.priority}
          </span>
          <div className="flex items-center space-x-1">
            <span className="material-icons text-green-500 text-xs">check_circle</span>
            <span className="text-xs text-gray-500 font-mono">{formatTimestamp(call.timestamp)}</span>
          </div>
        </div>
        <h3 className="text-gray-300 font-medium text-lg leading-tight mb-2 line-through decoration-gray-500">
          {call.emergency_type}
        </h3>
        <div className="mb-3">
          <div className="text-gray-500 font-bold text-sm mb-1 line-through">{call.caller_number}</div>
          <div className="flex items-center text-gray-600 text-xs space-x-1">
            <span className="material-icons text-[14px]">location_on</span>
            <span>{call.location}</span>
          </div>
        </div>
        <div className="bg-black/40 rounded-lg p-3 mt-3">
          <div className="text-xs text-gray-600 font-mono leading-relaxed line-clamp-2">
            "{call.summary}"
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`card-enter bg-card-dark rounded-lg p-4 border-l-4 ${colors.border} ${
        isAiAgent ? "ai-pulse" : ""
      } relative overflow-hidden group hover:bg-[#32324a] transition-colors`}
    >
      <div className="flex justify-between items-center mb-2">
        <span
          className={`${colors.bg} ${colors.text} text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide`}
        >
          {call.priority}
        </span>
        <span className="text-xs text-gray-500 font-mono">{formatTimestamp(call.timestamp)}</span>
      </div>
      <h3 className="text-white font-semibold text-lg leading-tight mb-2">
        {call.emergency_type}
      </h3>
      <div className="mb-3">
        <div className="text-white font-bold text-sm mb-1">{call.caller_number}</div>
        <div className="flex items-center text-gray-400 text-xs space-x-1">
          <span className="material-icons text-[14px] text-gray-500">location_on</span>
          <span>{call.location}</span>
        </div>
      </div>
      <div className="bg-black/40 rounded-lg p-3 mt-3">
        <div className="text-xs text-gray-400 font-mono leading-relaxed line-clamp-2">
          "{call.summary}"
        </div>
      </div>
      {isWaitlist && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            console.log('Assign button clicked for call:', call.id);
            onAssignToAgent(call.id);
          }}
          className="mt-3 w-full bg-primary hover:bg-blue-600 text-white text-xs font-semibold py-2 px-3 rounded transition-colors cursor-pointer relative z-10"
        >
          Assign to Agent
        </button>
      )}
    </div>
  );
}

function KanbanColumn({ column, cards, onAssignToAgent }) {
  const isAiAgent = column.key === "ai_agent";
  const isCompleted = column.key === "completed";
  const isHumanAgent = column.key === "human_agent";

  const content = (
    <>
      <div className={`flex items-center justify-between mb-4 ${column.wrapperClass ? "px-2 pt-2" : "px-1"}`}>
        <div className="flex items-center space-x-2">
          {column.icon ? (
            <span className="material-icons text-gray-500 text-sm">{column.icon}</span>
          ) : (
            <span className={`w-2 h-2 rounded-full ${column.dotColor} ${column.dotPulse ? "animate-pulse" : ""}`} />
          )}
          <h2 className={`text-sm font-semibold uppercase tracking-wider ${column.headerTextColor}`}>
            {column.label}
          </h2>
        </div>
        <span className={`${column.badgeStyle} text-xs px-2 py-0.5 rounded-full font-mono`}>
          {cards.length}
        </span>
      </div>
      <div className={`kanban-col flex-1 overflow-y-auto grid grid-cols-2 gap-3 auto-rows-max ${column.wrapperClass ? "px-1" : "pr-2"}`}>
        {cards.map((call) => (
          <CallCard
            key={call.id}
            call={call}
            isAiAgent={isAiAgent}
            isCompleted={isCompleted}
            isHumanAgent={isHumanAgent}
            onAssignToAgent={onAssignToAgent}
          />
        ))}
      </div>
    </>
  );

  return (
    <div
      className={`flex flex-col h-full ${isCompleted ? "opacity-60 hover:opacity-100 transition-opacity duration-300" : ""} ${
        column.wrapperClass || ""
      }`}
    >
      {content}
    </div>
  );
}

function Header({ stats }) {
  return (
    <header className="h-16 flex-none bg-[#151b2b] border-b border-gray-800 px-6 flex items-center justify-between z-10 relative">
      <div className="flex items-center space-x-4">
        <div className="flex items-center justify-center w-10 h-10 rounded bg-primary/20 text-primary">
          <span className="material-icons">health_and_safety</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">
          RescueLine <span className="text-primary font-normal">AI</span>
        </h1>
      </div>
      <div className="flex items-center space-x-3">
      </div>
    </header>
  );
}

function StatPill({ label, value, color = "text-white" }) {
  return (
    <div className="flex items-center space-x-2 bg-gray-800/60 px-3 py-1.5 rounded-full">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={`text-sm font-bold font-mono ${color}`}>{value}</span>
    </div>
  );
}

function DisconnectedBanner() {
  return (
    <div className="bg-priority-p0/90 text-white text-center text-sm py-2 px-4 font-medium">
      Disconnected — reconnecting...
    </div>
  );
}

export default function App() {
  const { callsByStatus, stats, connected, assignToAgent } = useCallData();

  return (
    <div className="bg-background-dark text-gray-100 min-h-screen flex flex-col">
      {!connected && <DisconnectedBanner />}
      <Header stats={stats} />
      <main className="flex-1 overflow-x-auto bg-surface-dark p-6">
        <div className="min-w-[1200px] grid grid-cols-2 gap-6">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.key}
              column={col}
              cards={callsByStatus[col.key]}
              onAssignToAgent={assignToAgent}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
