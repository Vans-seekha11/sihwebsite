import { useState } from "react";
import { Camera, Check, ChevronLeft, ChevronRight, Clock, CloudUpload, MapPin, Pin, Warning } from "./icons";
import { RiskBadge, SyncChip, type SyncStatus } from "./shared";

// ── Types ──────────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4 | 5 | 6;

export type IncidentType =
  | "Road Blockage" | "Flood" | "Landslide" | "Accident"
  | "Infra Damage" | "Other";

type Severity = "low" | "moderate" | "high" | "critical";

// ── Incident type tiles ────────────────────────────────────────────────────────
const TYPES: { label: IncidentType; emoji: string; color: string }[] = [
  { label: "Road Blockage", emoji: "🚧", color: "border-saffron/50 bg-saffron/10 text-saffron" },
  { label: "Flood",         emoji: "🌊", color: "border-[#1e6b45]/40 bg-[#1e6b45]/10 text-[#1e6b45]" },
  { label: "Landslide",     emoji: "⛰️", color: "border-critical/40 bg-critical/5 text-critical" },
  { label: "Accident",      emoji: "🚗", color: "border-navy/30 bg-navy/5 text-navy" },
  { label: "Infra Damage",  emoji: "🏗️", color: "border-ink/20 bg-ink/5 text-ink" },
  { label: "Other",         emoji: "📋", color: "border-hairline bg-white text-ink" },
];

const SEV_CFG: Record<Severity, { label: string; cls: string; riskLevel: "clear" | "caution" | "critical" }> = {
  low:      { label: "Low",      cls: "border-clear/40 bg-clear/10 text-clear",       riskLevel: "clear" },
  moderate: { label: "Moderate", cls: "border-saffron/40 bg-saffron/10 text-saffron", riskLevel: "caution" },
  high:     { label: "High",     cls: "border-saffron/60 bg-saffron/15 text-saffron", riskLevel: "caution" },
  critical: { label: "Critical", cls: "border-critical/40 bg-critical/5 text-critical",riskLevel: "critical" },
};

const STEP_LABELS = ["Type", "Location", "Evidence", "Details", "Review", "Submit"];

// ── Component ──────────────────────────────────────────────────────────────────
export default function ReportScreen({ initialType }: { initialType?: IncidentType } = {}) {
  const [step, setStep] = useState<Step>(initialType ? 2 : 1);
  const [incidentType, setIncidentType] = useState<IncidentType | null>(initialType ?? null);
  const [severity, setSeverity] = useState<Severity>("moderate");
  const [description, setDescription] = useState("");
  const [photoAdded, setPhotoAdded] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "done">("idle");
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("pending");
  const [incidentId] = useState("INC-2295");

  const next = () => setStep((s) => Math.min(6, s + 1) as Step);
  const back = () => setStep((s) => Math.max(1, s - 1) as Step);

  const handleSubmit = () => {
    setSubmitState("loading");
    setTimeout(() => {
      setSubmitState("done");
      setSyncStatus("synced");
    }, 2000);
  };

  const resetForm = () => {
    setStep(1);
    setIncidentType(null);
    setSeverity("moderate");
    setDescription("");
    setPhotoAdded(false);
    setSubmitState("idle");
    setSyncStatus("pending");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-paper">
      {/* Stepper */}
      {step < 6 && (
        <div className="shrink-0 border-b border-hairline bg-white px-4 py-3">
          <div className="flex items-center justify-between">
            {STEP_LABELS.map((label, i) => {
              const n = (i + 1) as Step;
              const done = n < step;
              const active = n === step;
              return (
                <div key={label} className="flex flex-col items-center">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full font-public text-[11px] font-bold transition-all duration-150 ${
                      done
                        ? "bg-clear text-white"
                        : active
                        ? "bg-navy text-white"
                        : "bg-ink/10 text-ink/50"
                    }`}
                  >
                    {done ? <Check size={12} /> : n}
                  </div>
                  <span
                    className={`mt-0.5 font-public text-[9px] font-semibold uppercase tracking-wide ${
                      active ? "text-navy" : done ? "text-clear" : "text-ink/40"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Progress bar */}
          <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full bg-navy transition-[width] duration-300 ease-out"
              style={{ width: `${((step - 1) / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Step content */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {step === 1 && <Step1 selected={incidentType} onSelect={(t) => { setIncidentType(t); next(); }} />}
        {step === 2 && <Step2 onNext={next} />}
        {step === 3 && <Step3 photoAdded={photoAdded} onTogglePhoto={() => setPhotoAdded((v) => !v)} onNext={next} />}
        {step === 4 && <Step4 severity={severity} onSeverity={setSeverity} description={description} onDescription={setDescription} onNext={next} />}
        {step === 5 && (
          <Step5
            incidentType={incidentType}
            severity={severity}
            description={description}
            photoAdded={photoAdded}
            syncStatus={syncStatus}
            onEdit={back}
            onSubmit={handleSubmit}
            submitState={submitState}
          />
        )}
        {step === 6 && (
          <Step6
            incidentId={incidentId}
            incidentType={incidentType}
            syncStatus={syncStatus}
            onNewReport={resetForm}
          />
        )}
      </div>

      {/* Back nav (steps 2–5) */}
      {step >= 2 && step <= 5 && (
        <div className="shrink-0 border-t border-hairline bg-white px-4 py-3">
          <button
            onClick={back}
            className="flex items-center gap-1.5 font-public text-[14px] font-semibold text-navy/70 active:text-navy"
          >
            <ChevronLeft size={18} /> Back to {STEP_LABELS[step - 2]}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Step 1 — Type ──────────────────────────────────────────────────────────────
function Step1({ selected, onSelect }: { selected: IncidentType | null; onSelect: (t: IncidentType) => void }) {
  return (
    <div className="px-4 pt-4 pb-6">
      <h2 className="font-public text-[18px] font-bold text-navy">What happened?</h2>
      <p className="mt-0.5 font-noto text-[14px] text-ink/60">Select the incident type</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {TYPES.map((t) => (
          <button
            key={t.label}
            onClick={() => onSelect(t.label)}
            className={`flex flex-col items-center gap-2.5 rounded-md border py-5 font-public text-[14px] font-semibold active:scale-95 transition-transform duration-100 ${t.color} ${selected === t.label ? "ring-2 ring-navy ring-offset-1" : ""}`}
          >
            <span className="text-[32px] leading-none">{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Step 2 — Location ──────────────────────────────────────────────────────────
function Step2({ onNext }: { onNext: () => void }) {
  return (
    <div className="px-4 pt-4 pb-6">
      <h2 className="font-public text-[18px] font-bold text-navy">Location</h2>
      <p className="mt-0.5 font-noto text-[14px] text-ink/60">GPS auto-detected · verify or adjust</p>

      {/* GPS strip */}
      <div className="mt-4 flex items-center gap-3 rounded-md border border-clear/40 bg-clear/5 px-3.5 py-3">
        <MapPin size={18} className="shrink-0 text-clear" />
        <div>
          <p className="font-public text-[13px] font-bold text-clear">GPS locked</p>
          <p className="font-noto text-[12px] text-navy">25.5713° N, 91.8827° E · ±4m</p>
        </div>
      </div>

      {/* Map preview placeholder */}
      <div className="mt-3 flex h-[140px] items-center justify-center overflow-hidden rounded-md border border-hairline bg-[#d8e4d4]">
        <div className="flex flex-col items-center gap-1 text-ink/40">
          <Pin size={28} />
          <span className="font-noto text-[12px]">NH-6, near Km 26 junction</span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <LabeledInput label="Location name" defaultValue="NH-6, Km 26 junction" />
        <LabeledInput label="Route / road" defaultValue="National Highway 6" />
        <LabeledInput label="Nearest landmark" placeholder="Bridge, junction, km marker…" />
      </div>

      <NextButton onClick={onNext}>Continue to Evidence <ChevronRight size={16} /></NextButton>
    </div>
  );
}

// ── Step 3 — Evidence ──────────────────────────────────────────────────────────
function Step3({ photoAdded, onTogglePhoto, onNext }: { photoAdded: boolean; onTogglePhoto: () => void; onNext: () => void }) {
  return (
    <div className="px-4 pt-4 pb-6">
      <h2 className="font-public text-[18px] font-bold text-navy">Evidence</h2>
      <p className="mt-0.5 font-noto text-[14px] text-ink/60">Photo or video — GPS &amp; timestamp auto-attached</p>

      {/* Photo area */}
      <div
        onClick={onTogglePhoto}
        className={`mt-4 flex h-[160px] cursor-pointer flex-col items-center justify-center gap-2.5 rounded-md border-2 border-dashed transition-colors duration-150 ${
          photoAdded
            ? "border-clear/50 bg-clear/5"
            : "border-ink/20 bg-white active:border-navy/40"
        }`}
      >
        {photoAdded ? (
          <>
            <Check size={28} className="text-clear" />
            <p className="font-public text-[14px] font-semibold text-clear">1 photo added</p>
            <p className="font-noto text-[12px] text-ink/50">Tap to remove</p>
          </>
        ) : (
          <>
            <Camera size={28} className="text-ink/40" />
            <p className="font-public text-[14px] font-semibold text-navy">Add photo or video</p>
            <p className="font-noto text-[12px] text-ink/50">Tap to capture or upload</p>
          </>
        )}
      </div>

      {/* Upload option */}
      <button
        onClick={onTogglePhoto}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-hairline bg-white py-3 font-public text-[14px] font-semibold text-navy active:bg-navy/5"
      >
        <CloudUpload size={18} /> Upload from gallery
      </button>

      {/* Metadata note */}
      <div className="mt-3 flex items-start gap-2.5 rounded-md border border-hairline bg-white px-3.5 py-2.5">
        <Clock size={15} className="mt-0.5 shrink-0 text-ink/40" />
        <p className="font-noto text-[12px] leading-snug text-ink/60">
          Timestamp: 09:41:33 · GPS: 25.5713° N, 91.8827° E · Device: Field tablet
        </p>
      </div>

      <NextButton onClick={onNext}>Continue to Details <ChevronRight size={16} /></NextButton>
    </div>
  );
}

// ── Step 4 — Details ──────────────────────────────────────────────────────────
function Step4({
  severity, onSeverity,
  description, onDescription,
  onNext,
}: {
  severity: Severity; onSeverity: (s: Severity) => void;
  description: string; onDescription: (d: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="px-4 pt-4 pb-6">
      <h2 className="font-public text-[18px] font-bold text-navy">Incident details</h2>
      <p className="mt-0.5 font-noto text-[14px] text-ink/60">Describe what you observed</p>

      {/* Severity */}
      <div className="mt-4">
        <p className="mb-2 font-public text-[11px] font-bold uppercase tracking-wider text-ink/50">Severity</p>
        <div className="grid grid-cols-4 gap-2">
          {(["low", "moderate", "high", "critical"] as Severity[]).map((s) => {
            const cfg = SEV_CFG[s];
            return (
              <button
                key={s}
                onClick={() => onSeverity(s)}
                className={`rounded-md border py-2.5 font-public text-[12px] font-bold transition-all duration-150 ${cfg.cls} ${severity === s ? "ring-2 ring-navy ring-offset-1" : "opacity-70"}`}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Description */}
      <div className="mt-4">
        <p className="mb-1.5 font-public text-[11px] font-bold uppercase tracking-wider text-ink/50">Description</p>
        <textarea
          value={description}
          onChange={(e) => onDescription(e.target.value)}
          rows={4}
          placeholder="Describe what you see — road condition, extent of damage, vehicles affected…"
          className="w-full resize-none rounded-md border border-hairline bg-white px-3 py-2.5 font-noto text-[14px] text-navy outline-none focus:border-navy/40 placeholder:text-ink/30"
        />
      </div>

      {/* Quick fields */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <LabeledSelect label="Road condition" options={["Blocked", "Partially blocked", "Passable", "Damaged"]} />
        <LabeledSelect label="Accessibility" options={["No access", "Emergency only", "Single lane", "Full access"]} />
        <LabeledInput label="Vehicles affected" placeholder="0" type="number" />
        <LabeledInput label="Blockage duration" placeholder="e.g. 2–4 hours" />
      </div>

      {/* Immediate action */}
      <div className="mt-3">
        <p className="mb-1.5 font-public text-[11px] font-bold uppercase tracking-wider text-ink/50">Immediate action needed?</p>
        <div className="flex gap-2">
          {["Yes — urgent", "Monitor", "None"].map((v) => (
            <button key={v} className="flex-1 rounded-md border border-hairline bg-white py-2 font-public text-[12px] font-semibold text-navy active:bg-navy/5">{v}</button>
          ))}
        </div>
      </div>

      {/* AI Assessment */}
      <div className="mt-4 rounded-md border border-navy/20 bg-navy/[0.03] px-4 py-3.5">
        <div className="flex items-center justify-between">
          <p className="font-public text-[12px] font-bold uppercase tracking-wider text-navy/60">AI-generated estimate</p>
          <span className="rounded bg-navy/10 px-1.5 py-0.5 font-public text-[10px] font-semibold text-navy">78% confidence</span>
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-y-2">
          {[
            { label: "Risk level",        value: <RiskBadge level={SEV_CFG[severity].riskLevel} /> },
            { label: "Priority score",    value: <span className="font-public text-[15px] font-bold text-navy">{severity === "critical" ? "92" : severity === "high" ? "74" : "52"}/100</span> },
            { label: "Affected route",    value: "NH-6 Km 22–34" },
            { label: "Logistics impact",  value: severity === "critical" ? "3 convoys at risk" : "Low impact" },
          ].map((r) => (
            <div key={r.label}>
              <p className="font-noto text-[11px] text-ink/55">{r.label}</p>
              {typeof r.value === "string"
                ? <p className="font-public text-[13px] font-semibold text-navy">{r.value}</p>
                : r.value}
            </div>
          ))}
        </div>
      </div>

      <NextButton onClick={onNext}>Review report <ChevronRight size={16} /></NextButton>
    </div>
  );
}

// ── Step 5 — Review ───────────────────────────────────────────────────────────
function Step5({
  incidentType, severity, description, photoAdded, syncStatus,
  onEdit, onSubmit, submitState,
}: {
  incidentType: IncidentType | null;
  severity: Severity;
  description: string;
  photoAdded: boolean;
  syncStatus: SyncStatus;
  onEdit: () => void;
  onSubmit: () => void;
  submitState: "idle" | "loading" | "done";
}) {
  if (submitState === "done") return null; // Step6 takes over
  return (
    <div className="px-4 pt-4 pb-6">
      <h2 className="font-public text-[18px] font-bold text-navy">Review &amp; submit</h2>
      <p className="mt-0.5 font-noto text-[14px] text-ink/60">Confirm details before submitting</p>

      <div className="mt-4 overflow-hidden rounded-md border border-hairline bg-white">
        {[
          { label: "Incident type", value: incidentType ?? "—" },
          { label: "Severity",      value: SEV_CFG[severity].label },
          { label: "Location",      value: "NH-6, Km 26 junction" },
          { label: "GPS",           value: "25.5713° N, 91.8827° E" },
          { label: "Photo",         value: photoAdded ? "1 photo attached" : "No photo" },
          { label: "Description",   value: description || "No description" },
        ].map((row, i, arr) => (
          <div key={row.label} className={`flex items-start gap-3 px-4 py-3 ${i < arr.length - 1 ? "border-b border-hairline" : ""}`}>
            <span className="w-[110px] shrink-0 font-noto text-[13px] text-ink/55">{row.label}</span>
            <span className="font-noto text-[13px] text-navy">{row.value}</span>
          </div>
        ))}
      </div>

      {/* Offline note */}
      <div className="mt-3 flex items-center gap-2 rounded-md border border-hairline bg-white px-3.5 py-2.5">
        <SyncChip status={syncStatus} />
        <p className="font-noto text-[13px] text-ink/70">Saved locally · will sync when online</p>
      </div>

      <button
        onClick={onSubmit}
        disabled={submitState === "loading"}
        className={`mt-4 flex w-full items-center justify-center gap-2 rounded-md py-3.5 font-public text-[16px] font-bold text-white transition-all duration-150 ${
          submitState === "loading" ? "bg-navy/50" : "bg-navy active:bg-[#1b3f63]"
        }`}
      >
        {submitState === "loading" ? (
          <>
            <span style={{ animation: "spinSlow 0.9s linear infinite" }} className="block h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
            Submitting…
          </>
        ) : "Submit report"}
      </button>
      <button onClick={onEdit} className="mt-2.5 w-full py-2.5 font-public text-[14px] font-semibold text-navy/60 active:text-navy">
        Edit details
      </button>
    </div>
  );
}

// ── Step 6 — Success ──────────────────────────────────────────────────────────
function Step6({ incidentId, incidentType, syncStatus, onNewReport }: {
  incidentId: string;
  incidentType: IncidentType | null;
  syncStatus: SyncStatus;
  onNewReport: () => void;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-clear/40 bg-clear/10">
        <Check size={28} className="text-clear" />
      </div>
      <h2 className="mt-4 font-public text-[22px] font-bold text-navy">Reported ✓</h2>
      <p className="mt-1 font-noto text-[14px] text-ink/60">
        {incidentType ?? "Incident"} report submitted
      </p>

      <div className="mt-6 w-full rounded-md border border-hairline bg-white px-4 py-4 text-left">
        {[
          { label: "Incident ID",     value: incidentId },
          { label: "Status",          value: "Under review" },
          { label: "Notified",        value: "District officer + control room" },
          { label: "Sync status",     value: <SyncChip status={syncStatus} /> },
        ].map((r, i, arr) => (
          <div key={r.label} className={`flex items-center justify-between py-2.5 ${i < arr.length - 1 ? "border-b border-hairline" : ""}`}>
            <span className="font-noto text-[13px] text-ink/55">{r.label}</span>
            {typeof r.value === "string"
              ? <span className="font-public text-[14px] font-semibold text-navy">{r.value}</span>
              : r.value}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-2.5 rounded-md border border-clear/30 bg-clear/5 px-3.5 py-3 text-left">
        <Warning size={15} className="mt-0.5 shrink-0 text-clear" />
        <p className="font-noto text-[13px] leading-snug text-navy/80">
          District officer has been notified. Response ETA: 15–30 min. You will receive an update when the report is verified.
        </p>
      </div>

      <button
        onClick={onNewReport}
        className="mt-6 w-full rounded-md bg-navy py-3.5 font-public text-[16px] font-bold text-white active:bg-[#1b3f63]"
      >
        Report another incident
      </button>
    </div>
  );
}

// ── Reusable form helpers ─────────────────────────────────────────────────────

function LabeledInput({ label, placeholder, defaultValue, type }: { label: string; placeholder?: string; defaultValue?: string; type?: string }) {
  const [val, setVal] = useState(defaultValue ?? "");
  return (
    <div>
      <p className="mb-1 font-public text-[11px] font-bold uppercase tracking-wider text-ink/50">{label}</p>
      <input
        type={type ?? "text"}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-hairline bg-white px-3 py-2 font-noto text-[14px] text-navy outline-none focus:border-navy/40 placeholder:text-ink/30"
      />
    </div>
  );
}

function LabeledSelect({ label, options }: { label: string; options: string[] }) {
  return (
    <div>
      <p className="mb-1 font-public text-[11px] font-bold uppercase tracking-wider text-ink/50">{label}</p>
      <select className="w-full rounded-md border border-hairline bg-white px-3 py-2 font-noto text-[14px] text-navy outline-none focus:border-navy/40">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

function NextButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-navy py-3.5 font-public text-[16px] font-bold text-white active:bg-[#1b3f63]"
    >
      {children}
    </button>
  );
}
