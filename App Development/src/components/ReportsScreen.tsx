import { useState } from "react";
import { FileText, Check, RouteNodes, Truck, Doc } from "./icons";

type ActionKey = "view" | "download" | "generate";

interface ReportSection {
  id: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  title: string;
  count: string;
  primaryAction: ActionKey;
  secondaryAction: ActionKey;
}

const SECTIONS: ReportSection[] = [
  {
    id: "incidents",
    icon: FileText,
    title: "Incident Reports",
    count: "12 total · 3 pending sync",
    primaryAction: "view",
    secondaryAction: "download",
  },
  {
    id: "completed-tasks",
    icon: Check,
    title: "Completed Tasks",
    count: "8 completed · 2 this week",
    primaryAction: "view",
    secondaryAction: "generate",
  },
  {
    id: "route-inspections",
    icon: RouteNodes,
    title: "Route Inspections",
    count: "5 inspections · last: yesterday",
    primaryAction: "view",
    secondaryAction: "generate",
  },
  {
    id: "logistics",
    icon: Truck,
    title: "Logistics Observations",
    count: "4 reports · all synced",
    primaryAction: "view",
    secondaryAction: "download",
  },
  {
    id: "daily",
    icon: Doc,
    title: "Daily Activity Reports",
    count: "7 days · today pending",
    primaryAction: "view",
    secondaryAction: "generate",
  },
];

type FeedbackState = "idle" | "loading" | "done";

function ActionButton({
  action,
  variant,
  onTap,
  feedback,
}: {
  action: ActionKey;
  variant: "primary" | "secondary";
  onTap: () => void;
  feedback: FeedbackState;
}) {
  const label =
    feedback === "loading"
      ? action === "download"
        ? "Downloading…"
        : "Generating…"
      : feedback === "done"
      ? "Done"
      : action === "view"
      ? "View"
      : action === "download"
      ? "Download"
      : "Generate";

  const cls =
    variant === "primary"
      ? "border-navy text-navy"
      : "border-ink/30 text-ink";

  return (
    <button
      onClick={onTap}
      disabled={feedback === "loading"}
      className={`rounded border px-3 py-1.5 font-public text-[13px] transition-all duration-150 active:opacity-70 disabled:opacity-60 ${cls}`}
    >
      {label}
    </button>
  );
}

export default function ReportsScreen() {
  // feedback state per section × action
  const [feedbacks, setFeedbacks] = useState<Record<string, FeedbackState>>({});

  const getFeedback = (id: string, action: ActionKey): FeedbackState =>
    feedbacks[`${id}-${action}`] ?? "idle";

  const handleTap = (id: string, action: ActionKey) => {
    const key = `${id}-${action}`;
    setFeedbacks((prev) => ({ ...prev, [key]: "loading" }));
    setTimeout(() => {
      setFeedbacks((prev) => ({ ...prev, [key]: "done" }));
      setTimeout(() => {
        setFeedbacks((prev) => ({ ...prev, [key]: "idle" }));
      }, 1200);
    }, 1500);
  };

  return (
    <div className="flex h-full flex-col bg-paper">
      {/* Heading */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="font-public text-[22px] font-bold text-navy">Reports</h1>
        <p className="font-noto text-[13px] text-ink">Field reports · Ri Bhoi district</p>
      </div>

      {/* Section list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col gap-3">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const primaryFb = getFeedback(section.id, section.primaryAction);
            const secondaryFb = getFeedback(section.id, section.secondaryAction);

            return (
              <div
                key={section.id}
                className="flex items-center gap-3 rounded-md border border-hairline bg-white p-4 transition-all duration-150"
              >
                {/* Icon circle */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy/10">
                  <Icon size={20} strokeWidth={1.75} className="text-navy" />
                </div>

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <p className="font-public text-[15px] font-semibold text-navy">{section.title}</p>
                  <p className="font-noto text-[13px] text-ink">{section.count}</p>
                </div>

                {/* Buttons */}
                <div className="flex shrink-0 items-center gap-2">
                  <ActionButton
                    action={section.primaryAction}
                    variant="primary"
                    feedback={primaryFb}
                    onTap={() => handleTap(section.id, section.primaryAction)}
                  />
                  <ActionButton
                    action={section.secondaryAction}
                    variant="secondary"
                    feedback={secondaryFb}
                    onTap={() => handleTap(section.id, section.secondaryAction)}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Info note */}
        <p className="mt-5 px-1 font-noto text-[12px] leading-relaxed text-ink/50">
          Reports auto-generate daily at 23:59. Offline reports sync when connection is restored.
        </p>
      </div>
    </div>
  );
}
