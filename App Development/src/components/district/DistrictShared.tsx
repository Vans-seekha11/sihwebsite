// Shared primitives for the District Officer / Control Room track.
// Reuses the platform tokens only — no new colors, fonts, or radii.
import { Check, Warning, ChevronRight } from "../icons";

// ── DEMO DATA tag — required on every screen's data ──
export function DemoTag({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded border border-hairline bg-white px-1.5 py-0.5 font-public text-[10px] font-bold uppercase tracking-[0.08em] text-ink/70 ${className}`}
    >
      Demo data
    </span>
  );
}

// ── Incident priority — badge + label always, never color alone ──
export type Priority = "critical" | "high" | "medium" | "low";
const PRIORITY = {
  critical: { bg: "bg-critical/5", border: "border-critical/40", text: "text-critical", label: "Critical" },
  high: { bg: "bg-saffron/10", border: "border-saffron/40", text: "text-[#7a4310]", label: "High" },
  medium: { bg: "bg-navy/5", border: "border-navy/25", text: "text-navy", label: "Medium" },
  low: { bg: "bg-[#eef1ec]", border: "border-hairline", text: "text-ink", label: "Low" },
} as const;

export function PriorityBadge({ level }: { level: Priority }) {
  const c = PRIORITY[level];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 font-public text-[12px] font-bold ${c.bg} ${c.border} ${c.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${c.text.replace("text-", "bg-")}`} />
      {c.label}
    </span>
  );
}

// ── Accessibility score band — number + band label always ──
// 0–25 Good · 26–50 Moderate · 51–75 Restricted · 76–100 Critical (higher = worse)
export function accessBand(score: number) {
  if (score <= 25) return { label: "Good", text: "text-clear", bar: "bg-clear" };
  if (score <= 50) return { label: "Moderate", text: "text-saffron", bar: "bg-saffron" };
  if (score <= 75) return { label: "Restricted", text: "text-[#7a4310]", bar: "bg-saffron" };
  return { label: "Critical", text: "text-critical", bar: "bg-critical" };
}

export function AccessScore({ score, compact }: { score: number; compact?: boolean }) {
  const b = accessBand(score);
  if (compact) {
    return (
      <span className={`font-public text-[13px] font-bold ${b.text}`}>
        {score} · {b.label}
      </span>
    );
  }
  return (
    <div>
      <div className="flex items-baseline gap-1.5">
        <span className={`font-public text-[15px] font-bold ${b.text}`}>{score}</span>
        <span className="font-noto text-[12px] text-ink">/100</span>
        <span className={`font-public text-[12px] font-bold ${b.text}`}>{b.label}</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
        <div className={`h-full rounded-full ${b.bar}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

// ── Flat hairline card ──
export function Card({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const base = `rounded-md border border-hairline bg-white ${className}`;
  if (onClick) {
    return (
      <button onClick={onClick} className={`${base} w-full text-left transition-colors active:bg-black/[0.02]`}>
        {children}
      </button>
    );
  }
  return <div className={base}>{children}</div>;
}

// ── KPI tile ──
export function KpiTile({
  label,
  value,
  hint,
  tone = "navy",
  onClick,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "navy" | "critical" | "saffron" | "clear";
  onClick?: () => void;
}) {
  const toneText = {
    navy: "text-navy",
    critical: "text-critical",
    saffron: "text-saffron",
    clear: "text-clear",
  }[tone];
  return (
    <Card onClick={onClick} className="p-3.5">
      <div className="flex items-start justify-between">
        <p className="font-noto text-[12px] leading-tight text-ink">{label}</p>
        {onClick && <ChevronRight size={15} className="shrink-0 text-ink/50" />}
      </div>
      <p className={`mt-1.5 font-public text-[26px] font-bold leading-none ${toneText}`}>{value}</p>
      {hint && <p className="mt-1.5 font-noto text-[12px] text-ink/70">{hint}</p>}
    </Card>
  );
}

// ── Section heading ──
export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-2.5 mt-5 flex items-center justify-between first:mt-0">
      <h2 className="font-public text-[15px] font-bold text-navy">{children}</h2>
      {action}
    </div>
  );
}

// ── AI output card — every AI output labeled estimate/prediction/recommendation ──
export function AiCard({
  kind,
  confidence,
  title,
  children,
}: {
  kind: string;
  confidence?: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-hairline bg-navy/[0.04] px-3.5 py-2">
        <span className="inline-flex items-center gap-1.5 font-public text-[11px] font-bold uppercase tracking-[0.06em] text-navy">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-navy text-[9px] font-bold text-white">
            AI
          </span>
          {kind}
        </span>
        {confidence != null && (
          <span className="font-public text-[12px] font-semibold text-ink">{confidence}% confidence</span>
        )}
      </div>
      <div className="px-3.5 py-3">
        <p className="font-public text-[14px] font-bold text-navy">{title}</p>
        <div className="mt-1.5 font-noto text-[13px] leading-snug text-ink">{children}</div>
        <p className="mt-2.5 font-noto text-[11px] italic text-ink/60">AI-generated estimate — verify before acting.</p>
      </div>
    </Card>
  );
}

// ── Status chip (icon + text) ──
export function StatusChip({
  tone,
  children,
}: {
  tone: "critical" | "saffron" | "clear" | "navy" | "muted";
  children: React.ReactNode;
}) {
  const c = {
    critical: "border-critical/30 bg-critical/5 text-critical",
    saffron: "border-saffron/30 bg-saffron/10 text-[#7a4310]",
    clear: "border-clear/30 bg-[#e8f5ee] text-clear",
    navy: "border-navy/25 bg-navy/5 text-navy",
    muted: "border-hairline bg-[#eef1ec] text-ink",
  }[tone];
  return (
    <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 font-public text-[12px] font-semibold ${c}`}>
      {children}
    </span>
  );
}

// ── Scroll-strip tabs ──
export function ScrollTabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: T; label: string; count?: number }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-0.5">
      {tabs.map((t) => {
        const on = active === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`shrink-0 rounded-full border px-3 py-1.5 font-public text-[13px] font-semibold transition-colors ${
              on ? "border-navy bg-navy text-white" : "border-hairline bg-white text-ink active:bg-black/[0.03]"
            }`}
          >
            {t.label}
            {t.count != null && (
              <span className={`ml-1.5 ${on ? "text-white/70" : "text-ink/50"}`}>{t.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Restrained alert banner (reuses field-track AlertBanner idiom) ──
export function AlertBanner({
  tone,
  title,
  text,
}: {
  tone: "critical" | "saffron" | "clear";
  title: string;
  text: string;
}) {
  const c = {
    critical: { border: "border-critical/40", bg: "bg-critical/5", icon: "text-critical", label: "text-critical" },
    saffron: { border: "border-saffron/40", bg: "bg-saffron/10", icon: "text-saffron", label: "text-[#7a4310]" },
    clear: { border: "border-clear/40", bg: "bg-[#e8f5ee]", icon: "text-clear", label: "text-clear" },
  }[tone];
  const Icon = tone === "clear" ? Check : Warning;
  return (
    <div className={`flex items-start gap-2.5 rounded-md border ${c.border} ${c.bg} px-3.5 py-3`}>
      <Icon size={18} className={`mt-0.5 shrink-0 ${c.icon}`} />
      <div>
        <p className={`font-public text-[14px] font-bold ${c.label}`}>{title}</p>
        <p className="mt-0.5 font-noto text-[13px] leading-snug text-navy">{text}</p>
      </div>
    </div>
  );
}
