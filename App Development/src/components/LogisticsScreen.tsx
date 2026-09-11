import { useState } from "react";
import { ChevronLeft, Clock, MapPin, Package, Truck, Warning } from "./icons";
import { RiskBadge } from "./shared";
import type { RiskLevel } from "./shared";

interface Shipment {
  id: string;
  vehicle: string;
  type: string;
  origin: string;
  dest: string;
  location: string;
  route: string;
  status: string;
  risk: RiskLevel;
  eta: string;
  delay: string | null;
}

const shipments: Shipment[] = [
  {
    id: "LOG-4471",
    vehicle: "MG-01-TR-2241",
    type: "Medical supplies",
    origin: "Guwahati",
    dest: "Shillong Civil Hospital",
    location: "NH-6, Km 18",
    route: "NH-6",
    status: "In transit",
    risk: "caution",
    eta: "14:20",
    delay: null,
  },
  {
    id: "LOG-4438",
    vehicle: "MG-03-TR-1182",
    type: "Relief materials",
    origin: "Silchar",
    dest: "Nongpoh District Store",
    location: "NH-27, Km 44",
    route: "NH-27",
    status: "In transit",
    risk: "clear",
    eta: "15:45",
    delay: null,
  },
  {
    id: "LOG-4451",
    vehicle: "AS-07-TR-0091",
    type: "Construction material",
    origin: "Lumding",
    dest: "Umiam Bridge site",
    location: "SH-5 — REROUTING",
    route: "SH-5",
    status: "Delayed",
    risk: "critical",
    eta: "17:30",
    delay: "+2h 15m (route blocked)",
  },
  {
    id: "LOG-4402",
    vehicle: "MG-02-TR-3310",
    type: "Food rations",
    origin: "Guwahati",
    dest: "Ri Bhoi District HQ",
    location: "Lumshnong Bypass",
    route: "PMGSY-L",
    status: "On schedule",
    risk: "clear",
    eta: "13:10",
    delay: null,
  },
];

function statusStyle(status: string): string {
  if (status === "Delayed") return "bg-critical/5 border-critical/30 text-critical";
  if (status === "On schedule") return "bg-[#e8f5ee] border-clear/30 text-clear";
  return "bg-navy/5 border-navy/20 text-navy";
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-public text-[11px] font-semibold uppercase tracking-wide text-ink/60">
        {label}
      </span>
      <span className="font-noto text-[14px] text-navy">{value}</span>
    </div>
  );
}

function nearbyIncidentNote(shipment: Shipment): string | null {
  if (shipment.risk === "critical") {
    return "SH-5 Km 31–34 blocked — rerouting advised";
  }
  return null;
}

function latestUpdateNote(shipment: Shipment): { time: string; note: string } {
  if (shipment.delay) {
    return {
      time: "09:41 today",
      note: `Vehicle halted — ${shipment.delay}. Rerouting via Lumshnong Bypass in progress.`,
    };
  }
  if (shipment.status === "On schedule") {
    return {
      time: "09:40 today",
      note: "Vehicle on track. No incidents on current route segment.",
    };
  }
  return {
    time: "09:38 today",
    note: "Vehicle moving normally. Monitor route conditions.",
  };
}

function ShipmentDetailView({
  shipment,
  onBack,
}: {
  shipment: Shipment;
  onBack: () => void;
}) {
  const incidentNote = nearbyIncidentNote(shipment);
  const update = latestUpdateNote(shipment);

  return (
    <div className="flex h-full flex-col">
      {/* Back row */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 px-4 py-3 text-navy transition-all duration-150 active:opacity-60"
      >
        <ChevronLeft size={18} strokeWidth={2} />
        <span className="font-public text-[14px] font-semibold">Logistics</span>
      </button>

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {/* Heading */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="font-public text-[18px] font-bold text-navy">{shipment.id}</h2>
            <p className="font-public text-[13px] text-ink">{shipment.vehicle}</p>
          </div>
          <span
            className={`mt-1 inline-flex items-center rounded border px-2 py-0.5 font-public text-[13px] font-semibold ${statusStyle(shipment.status)}`}
          >
            {shipment.status}
          </span>
        </div>
        <p className="mt-1 font-noto text-[15px] font-semibold text-navy">{shipment.type}</p>

        {/* Delay banner */}
        {shipment.delay && (
          <div className="mt-4 flex items-start gap-2 rounded-md border border-saffron/40 bg-saffron/10 px-3 py-3">
            <Warning size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-[#7a4310]" />
            <div>
              <p className="font-public text-[13px] font-semibold text-[#7a4310]">Delay: {shipment.delay}</p>
            </div>
          </div>
        )}

        {/* Detail grid */}
        <div className="mt-4 rounded-md border border-ink/20 bg-paper">
          <div className="grid grid-cols-2 gap-0">
            {[
              ["Current Location", shipment.location],
              ["Route", shipment.route],
              ["Origin", shipment.origin],
              ["Destination", shipment.dest],
              ["ETA", shipment.eta],
              ["Vehicle", shipment.vehicle],
            ].map(([label, value], i) => (
              <div
                key={label}
                className={`px-3 py-3 ${i % 2 === 0 ? "border-r border-ink/10" : ""} ${i < 4 ? "border-b border-ink/10" : ""}`}
              >
                <DetailField label={label} value={value} />
              </div>
            ))}
          </div>
        </div>

        {/* Risk badge row */}
        <div className="mt-3 flex items-center gap-2">
          <span className="font-public text-[13px] text-ink/60">Route risk:</span>
          <RiskBadge level={shipment.risk} />
        </div>

        {/* Nearby incident */}
        {incidentNote && (
          <div className="mt-4 flex items-start gap-2 rounded-md border border-critical/30 bg-critical/5 px-3 py-3">
            <Warning size={15} strokeWidth={2} className="mt-0.5 shrink-0 text-critical" />
            <p className="font-noto text-[14px] text-critical">{incidentNote}</p>
          </div>
        )}

        {/* Latest update */}
        <div className="mt-4 rounded-md border border-ink/20 bg-paper px-3 py-3">
          <p className="font-public text-[11px] font-semibold uppercase tracking-wide text-ink/60">
            Latest Update
          </p>
          <p className="mt-1 font-public text-[12px] text-ink/60">{update.time}</p>
          <p className="mt-1 font-noto text-[14px] text-navy">{update.note}</p>
        </div>
      </div>
    </div>
  );
}

function ShipmentCard({
  shipment,
  onSelect,
}: {
  shipment: Shipment;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="w-full rounded-md border border-ink/20 bg-paper px-3 py-3 text-left transition-all duration-150 active:opacity-70"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="font-public text-[14px] font-bold text-navy">{shipment.id}</span>
          <span className="ml-2 font-public text-[12px] text-ink">{shipment.vehicle}</span>
        </div>
        <span
          className={`inline-flex items-center rounded border px-2 py-0.5 font-public text-[12px] font-semibold ${statusStyle(shipment.status)}`}
        >
          {shipment.status}
        </span>
      </div>

      {/* Type */}
      <div className="mt-1.5 flex items-center gap-1.5">
        <Package size={14} strokeWidth={1.75} className="shrink-0 text-ink" />
        <p className="font-noto text-[14px] font-semibold text-navy">{shipment.type}</p>
      </div>

      {/* Route */}
      <p className="mt-1 font-noto text-[13px] text-ink">
        {shipment.origin} → {shipment.dest}
      </p>

      {/* Location + meta */}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="flex items-center gap-1 font-public text-[12px] text-ink">
          <MapPin size={12} strokeWidth={1.75} />
          {shipment.location}
        </span>
        <span className="flex items-center gap-1 font-public text-[12px] text-ink">
          <Clock size={12} strokeWidth={1.75} />
          ETA {shipment.eta}
        </span>
      </div>

      {/* Badges */}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <RiskBadge level={shipment.risk} />
        {shipment.delay && (
          <span className="flex items-center gap-1 font-public text-[12px] font-semibold text-saffron">
            <Warning size={12} strokeWidth={2} />
            {shipment.delay}
          </span>
        )}
      </div>
    </button>
  );
}

export default function LogisticsScreen() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = shipments.find((s) => s.id === selectedId) ?? null;

  if (selected) {
    return (
      <div className="flex h-full flex-col bg-paper">
        <ShipmentDetailView shipment={selected} onBack={() => setSelectedId(null)} />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-paper">
      {/* Sub-header */}
      <div className="border-b border-ink/10 px-4 py-2">
        <p className="font-public text-[13px] text-ink/60">
          4 active shipments · Ri Bhoi district
        </p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="flex flex-col gap-3">
          {shipments.map((s) => (
            <ShipmentCard key={s.id} shipment={s} onSelect={() => setSelectedId(s.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}
