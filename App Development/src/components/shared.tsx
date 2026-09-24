import { Check, Clock, Warning, XIcon } from "./icons";

export type RiskLevel = "clear" | "caution" | "critical";
export type SyncStatus = "pending" | "synced" | "rejected";

export function RiskBadge({ level }: { level: RiskLevel }) {
  const cfg = {
    clear: { bg: "bg-[#e8f5ee]", border: "border-clear/30", text: "text-clear", Icon: Check, label: "Clear" },
    caution: { bg: "bg-saffron/10", border: "border-saffron/30", text: "text-[#7a4310]", Icon: Warning, label: "Caution" },
    critical: { bg: "bg-critical/5", border: "border-critical/30", text: "text-critical", Icon: Warning, label: "High risk" },
  }[level];
  const { bg, border, text, Icon, label } = cfg;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 font-public text-[13px] font-semibold ${bg} ${border} ${text}`}
    >
      <Icon size={13} strokeWidth={2.2} />
      {label}
    </span>
  );
}

export function SyncChip({ status }: { status: SyncStatus }) {
  if (status === "pending")
    return (
      <span className="inline-flex items-center gap-1 rounded border border-saffron/30 bg-saffron/10 px-2 py-0.5 font-public text-[13px] font-semibold text-[#7a4310]">
        <Clock size={13} strokeWidth={2} /> Pending sync
      </span>
    );
  if (status === "synced")
    return (
      <span className="inline-flex items-center gap-1 rounded border border-clear/30 bg-[#e8f5ee] px-2 py-0.5 font-public text-[13px] font-semibold text-clear">
        <Check size={13} strokeWidth={2.2} /> Synced
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded border border-critical/30 bg-critical/5 px-2 py-0.5 font-public text-[13px] font-semibold text-critical">
      <XIcon size={13} strokeWidth={2} /> Rejected
    </span>
  );
}
