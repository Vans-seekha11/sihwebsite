import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Camera,
  Check,
  ChevronDown,
  EditIcon,
  Eye,
  EyeOff,
  Globe,
  Key,
  Lock,
  LogOut,
  Monitor,
  Moon,
  RefreshCw,
  Shield,
  Smartphone,
  Sun,
  User,
  XIcon,
} from "./icons";
import { supabase } from "../lib/supabase";
import type { Profile as DbProfile } from "../lib/database.types";

// ── Types ──────────────────────────────────────────────────────────
export type ProfileRole = "field" | "district" | "control";
export type ThemeMode = "light" | "dark" | "system";

interface ProfileData {
  name: string;
  officerId: string;
  role: string;
  department: string;
  region: string;
  phone: string;
  email: string;
  lastLogin: string;
  accountStatus: "active" | "inactive";
  roleAccent: string;
  roleInitials: string;
}

const ROLE_DATA: Record<ProfileRole, ProfileData> = {
  field: {
    name: "A. Sangma",
    officerId: "NER-FO-4471",
    role: "Field Officer",
    department: "NER Logistics Division",
    region: "Ri Bhoi District, Meghalaya",
    phone: "+91 94365 00471",
    email: "a.sangma@ner.gov.in",
    lastLogin: "Today, 09:38 IST",
    accountStatus: "active",
    roleAccent: "#d9a441",
    roleInitials: "FO",
  },
  district: {
    name: "R. Borah",
    officerId: "NER-DO-2281",
    role: "District Officer",
    department: "Kamrup Metro District Administration",
    region: "Kamrup Metro, Assam",
    phone: "+91 98641 02281",
    email: "r.borah@kamrup.gov.in",
    lastLogin: "Today, 09:41 IST",
    accountStatus: "active",
    roleAccent: "#d9a441",
    roleInitials: "DO",
  },
  control: {
    name: "S. Khongsdier",
    officerId: "NER-CO-0012",
    role: "Control Room Operator",
    department: "NER Regional Command Center",
    region: "North Eastern Region (8 States)",
    phone: "+91 98000 10012",
    email: "s.khongsdier@ner.gov.in",
    lastLogin: "Today, 09:41 IST",
    accountStatus: "active",
    roleAccent: "#d9a441",
    roleInitials: "CO",
  },
};

// ── Helpers ────────────────────────────────────────────────────────
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={on}
      className={`relative inline-flex h-[22px] w-[40px] shrink-0 items-center rounded-full border-0 transition-colors duration-200 ${
        on ? "bg-navy" : "bg-ink/20"
      }`}
    >
      <span
        className={`absolute top-[3px] h-[16px] w-[16px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
          on ? "translate-x-[21px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <p className="mb-2 mt-5 px-1 font-public text-[11px] font-semibold uppercase tracking-wider text-ink/50">
      {label}
    </p>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 py-3">
      <span className="shrink-0 font-noto text-[13px] text-ink">{label}</span>
      <span className="text-right font-public text-[13px] font-semibold text-navy">{value}</span>
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const score = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "bg-critical", "bg-saffron", "bg-yellow-400", "bg-clear"];
  if (!password) return null;
  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="flex flex-1 gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i <= score ? colors[score] : "bg-ink/15"
            }`}
          />
        ))}
      </div>
      <span className="font-noto text-[11px] text-ink/60">{labels[score]}</span>
    </div>
  );
}

// Accordion row for the Settings tab — paper card, hairline border, chevron
// rotates on open; content expands in place using the existing slideDown motion.
function SettingRow({
  Icon,
  label,
  open,
  onToggle,
  children,
}: {
  Icon: (p: { size?: number; strokeWidth?: number; className?: string }) => React.ReactElement;
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-hairline bg-white">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors duration-200 active:bg-navy/5"
      >
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 ${
            open ? "bg-navy text-white" : "bg-paper text-navy/70"
          }`}
        >
          <Icon size={17} strokeWidth={1.75} />
        </div>
        <span className="flex-1 font-public text-[14px] font-semibold text-navy">{label}</span>
        <ChevronDown
          size={18}
          strokeWidth={2}
          className={`shrink-0 text-ink/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          className="border-t border-hairline px-4 py-4"
          style={{ animation: "slideDown 240ms cubic-bezier(0.16,1,0.3,1)" }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ── Tab definitions ────────────────────────────────────────────────
type Tab = "profile" | "settings";

const TABS: { id: Tab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "settings", label: "Settings" },
];

// Expandable Settings sections (accordion).
type SettingKey = "edit" | "notifications" | "theme" | "language" | "security";

const LANGUAGES: { code: string; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "as", label: "Assamese", native: "অসমীয়া" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "nsm", label: "Naga", native: "Tenyidie" },
  { code: "lus", label: "Mizo", native: "Mizo Tawng" },
];

// ── Main component ─────────────────────────────────────────────────
export default function ProfileScreen({
  profileRole = "field",
  onClose,
  onSignOut,
}: {
  profileRole?: ProfileRole;
  onClose: () => void;
  onSignOut?: () => void;
}) {
  const data = ROLE_DATA[profileRole];
  const [dbProfile, setDbProfile] = useState<DbProfile | null>(null);
  const [tab, setTab] = useState<Tab>("profile");
  // Which Settings accordion section is open (only one at a time).
  const [openSection, setOpenSection] = useState<SettingKey | null>(null);
  const toggleSection = (key: SettingKey) =>
    setOpenSection((prev) => (prev === key ? null : key));

  // Edit profile state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(data.name);
  const [editPhone, setEditPhone] = useState(data.phone);
  const [editEmail, setEditEmail] = useState(data.email);
  const [editDept, setEditDept] = useState(data.department);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [avatarUploaded, setAvatarUploaded] = useState(false);

  // Security state
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdSaveState, setPwdSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [twoFA, setTwoFA] = useState(true);
  const [logoutSessionsState, setLogoutSessionsState] = useState<"idle" | "done">("idle");

  // Notifications state
  const [notifs, setNotifs] = useState({
    critical: true,
    incidentUpdates: true,
    taskUpdates: true,
    aiAlerts: false,
    emailNotifs: true,
    smsNotifs: false,
    dailyDigest: false,
  });
  const [notifSaveState, setNotifSaveState] = useState<"idle" | "saving" | "saved">("idle");

  // Theme + language state
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [language, setLanguage] = useState("en");
  const [langSaveState, setLangSaveState] = useState<"idle" | "saving" | "saved">("idle");

  // Logout confirmation
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const sheetRef = useRef<HTMLDivElement>(null);

  // Apply theme class to root element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  const toggleNotif = (key: keyof typeof notifs) =>
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSaveProfile = () => {
    setSaveState("saving");
    setTimeout(() => {
      setSaveState("saved");
      setEditing(false);
      setTimeout(() => setSaveState("idle"), 2500);
    }, 900);
  };

  const handleChangePassword = () => {
    if (!currentPwd) { setPwdError("Enter your current password."); return; }
    if (newPwd.length < 8) { setPwdError("New password must be at least 8 characters."); return; }
    if (newPwd !== confirmPwd) { setPwdError("Passwords do not match."); return; }
    setPwdError("");
    setPwdSaveState("saving");
    setTimeout(() => {
      setPwdSaveState("saved");
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
      setTimeout(() => setPwdSaveState("idle"), 2500);
    }, 900);
  };

  const handleLogoutOtherSessions = () => {
    setLogoutSessionsState("done");
    setTimeout(() => setLogoutSessionsState("idle"), 2500);
  };

  const handleSaveNotifs = () => {
    setNotifSaveState("saving");
    setTimeout(() => {
      setNotifSaveState("saved");
      setTimeout(() => setNotifSaveState("idle"), 2500);
    }, 700);
  };

  const handleApplyLanguage = () => {
    setLangSaveState("saving");
    setTimeout(() => {
      setLangSaveState("saved");
      setTimeout(() => setLangSaveState("idle"), 2500);
    }, 700);
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-end bg-black/50"
      style={{ animation: "quietFade 160ms ease-out" }}
      onClick={onClose}
    >
      {/* Sheet */}
      <div
        ref={sheetRef}
        className="w-full rounded-t-2xl bg-paper overflow-hidden flex flex-col"
        style={{ maxHeight: "95%", paddingBottom: "env(safe-area-inset-bottom, 16px)", animation: "slideUp 240ms cubic-bezier(0.32,0,0.67,0) forwards" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="shrink-0 flex justify-center pt-3 pb-1">
          <div className="h-1 w-9 rounded-full bg-[#c4c8cd]" />
        </div>

        {/* Profile header — navy bg */}
        <div className="shrink-0 bg-navy px-4 pt-4 pb-5 flex items-center gap-4">
          <div className="relative shrink-0">
            <div
              className="flex h-[60px] w-[60px] items-center justify-center rounded-full border-2 border-white/20"
              style={{ background: avatarUploaded ? data.roleAccent : "rgba(255,255,255,0.1)" }}
            >
              {avatarUploaded ? (
                <span className="font-public text-[22px] font-extrabold text-navy">
                  {data.roleInitials}
                </span>
              ) : (
                <User size={28} strokeWidth={1.5} className="text-white" />
              )}
            </div>
            {tab === "profile" && (
              <button
                onClick={() => setAvatarUploaded((v) => !v)}
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md active:scale-95 transition-transform"
                title="Change photo"
              >
                <Camera size={12} strokeWidth={2} className="text-navy" />
              </button>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-public text-[18px] font-bold text-white leading-tight truncate">
              {editing ? editName : data.name}
            </p>
            <p className="font-noto text-[12px] text-white/70 mt-0.5">{data.officerId}</p>
            <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5"
              style={{ background: `${data.roleAccent}25`, border: `1px solid ${data.roleAccent}50` }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: data.roleAccent }} />
              <span className="font-public text-[11px] font-semibold" style={{ color: data.roleAccent }}>
                {data.role}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20 transition-colors"
          >
            <XIcon size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Account status pill */}
        <div className="shrink-0 flex items-center justify-between px-4 py-2 border-b border-hairline bg-white">
          <span className="font-noto text-[12px] text-ink">Account Status</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-clear" />
            <span className="font-public text-[12px] font-semibold text-clear">Active · Verified</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="shrink-0 flex border-b border-hairline bg-white">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 font-public text-[12px] font-semibold transition-colors duration-150 ${
                tab === t.id
                  ? "border-b-2 border-navy text-navy"
                  : "text-ink/60 active:text-navy"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Success toast */}
        {(saveState === "saved" || pwdSaveState === "saved" || logoutSessionsState === "done") && (
          <div
            className="shrink-0 mx-4 mt-3 flex items-center gap-2 rounded-md bg-clear/10 border border-clear/30 px-3 py-2.5"
            style={{ animation: "quietFade 200ms ease-out" }}
          >
            <span className="h-2 w-2 rounded-full bg-clear" />
            <span className="font-public text-[13px] font-semibold text-clear">
              {saveState === "saved"
                ? "Profile updated successfully."
                : pwdSaveState === "saved"
                ? "Password changed successfully."
                : "Other sessions logged out."}
            </span>
          </div>
        )}

        {/* Scrollable tab content */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="px-4 pb-8">

            {/* ── PROFILE TAB (read-only info + Edit Profile) ──── */}
            {tab === "profile" && (
              <>
                <SectionHeader label="Officer Information" />
                <div className="rounded-md border border-hairline bg-white divide-y divide-hairline">
                  <InfoRow label="Full Name" value={data.name} />
                  <InfoRow label="Officer ID" value={data.officerId} />
                  <InfoRow label="Role" value={data.role} />
                  <InfoRow label="Department" value={data.department} />
                  <InfoRow label="District / Region" value={data.region} />
                </div>

                <SectionHeader label="Contact Details" />
                <div className="rounded-md border border-hairline bg-white divide-y divide-hairline">
                  <InfoRow label="Phone" value={data.phone} />
                  <InfoRow label="Email" value={data.email} />
                </div>

                <SectionHeader label="Session" />
                <div className="rounded-md border border-hairline bg-white divide-y divide-hairline">
                  <InfoRow label="Last Login" value={data.lastLogin} />
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="font-noto text-[13px] text-ink">Connectivity</span>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-clear" />
                      <span className="font-public text-[13px] font-semibold text-navy">4G Online</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => { setTab("settings"); setOpenSection("edit"); setEditing(true); }}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-navy py-3 font-public text-[14px] font-bold text-white transition-opacity active:opacity-75"
                >
                  <EditIcon size={15} strokeWidth={2} />
                  Edit Profile
                </button>
              </>
            )}

            {/* ── SETTINGS TAB (accordion) ─────────────────────── */}
            {tab === "settings" && (
              <div className="mt-4 flex flex-col gap-2.5">

                {/* 1 · Edit Profile */}
                <SettingRow Icon={EditIcon} label="Edit Profile" open={openSection === "edit"} onToggle={() => toggleSection("edit")}>
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border-2 border-navy/15"
                      style={{ background: avatarUploaded ? data.roleAccent : "rgba(14,42,71,0.06)" }}
                    >
                      {avatarUploaded ? (
                        <span className="font-public text-[18px] font-extrabold text-navy">{data.roleInitials}</span>
                      ) : (
                        <User size={24} strokeWidth={1.5} className="text-navy/50" />
                      )}
                    </div>
                    <button
                      onClick={() => setAvatarUploaded((v) => !v)}
                      className="flex items-center gap-1.5 font-public text-[13px] font-semibold text-navy active:opacity-70"
                    >
                      <Camera size={13} strokeWidth={2} /> Change photo
                    </button>
                  </div>
                  {(
                    [
                      { label: "Full Name", val: editName, set: setEditName, type: "text" },
                      { label: "Phone", val: editPhone, set: setEditPhone, type: "tel" },
                      { label: "Email", val: editEmail, set: setEditEmail, type: "email" },
                      { label: "Department", val: editDept, set: setEditDept, type: "text" },
                    ] as const
                  ).map(({ label, val, set, type }) => (
                    <div key={label} className="mb-3">
                      <label className="mb-1.5 block font-noto text-[12px] text-ink/60">{label}</label>
                      <input
                        type={type}
                        value={val}
                        onChange={(e) => set(e.target.value)}
                        className="w-full rounded border border-navy/20 bg-paper px-3 py-2 font-noto text-[14px] text-navy outline-none transition-colors focus:border-navy"
                      />
                    </div>
                  ))}
                  <div className="mt-1 flex gap-3">
                    <button
                      onClick={() => { setEditName(data.name); setEditPhone(data.phone); setEditEmail(data.email); setEditDept(data.department); setOpenSection(null); }}
                      className="flex-1 rounded-md border border-navy/30 py-2.5 font-public text-[14px] font-semibold text-navy transition-opacity active:opacity-70"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saveState === "saving"}
                      className="flex-1 flex items-center justify-center gap-2 rounded-md bg-navy py-2.5 font-public text-[14px] font-bold text-white transition-opacity active:opacity-75 disabled:opacity-60"
                    >
                      {saveState === "saving" ? (
                        <><RefreshCw size={14} strokeWidth={2} className="animate-spin" /> Saving…</>
                      ) : "Save Changes"}
                    </button>
                  </div>
                  {saveState === "saved" && (
                    <p className="mt-2.5 font-public text-[13px] font-semibold text-clear">✓ Profile updated</p>
                  )}
                </SettingRow>

                {/* 2 · Notifications */}
                <SettingRow Icon={Bell} label="Notifications" open={openSection === "notifications"} onToggle={() => toggleSection("notifications")}>
                  <div className="-mt-1 divide-y divide-hairline">
                    {(
                      [
                        { key: "critical" as const, label: "Critical Alerts", desc: "Push for P1/P2 incidents" },
                        { key: "incidentUpdates" as const, label: "Incident Updates", desc: "Status changes and escalations" },
                        { key: "taskUpdates" as const, label: "Task Updates", desc: "Assigned and completed tasks" },
                        { key: "aiAlerts" as const, label: "AI Alerts", desc: "Predictive risk and anomaly flags" },
                        { key: "emailNotifs" as const, label: "Email Notifications", desc: "To registered gov email" },
                        { key: "smsNotifs" as const, label: "SMS Notifications", desc: "To registered mobile number" },
                        { key: "dailyDigest" as const, label: "Daily Digest", desc: "Summary at 8:00 AM IST" },
                      ]
                    ).map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between gap-3 py-3">
                        <div className="min-w-0">
                          <p className="font-noto text-[14px] text-navy">{label}</p>
                          <p className="mt-0.5 font-noto text-[11px] leading-snug text-ink/50">{desc}</p>
                        </div>
                        <Toggle on={notifs[key]} onToggle={() => toggleNotif(key)} />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleSaveNotifs}
                    disabled={notifSaveState === "saving"}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-navy py-2.5 font-public text-[14px] font-bold text-white transition-opacity active:opacity-75 disabled:opacity-60"
                  >
                    {notifSaveState === "saving" ? (
                      <><RefreshCw size={14} strokeWidth={2} className="animate-spin" /> Saving…</>
                    ) : "Save Preferences"}
                  </button>
                  {notifSaveState === "saved" && (
                    <p className="mt-2.5 font-public text-[13px] font-semibold text-clear">✓ Preferences saved</p>
                  )}
                </SettingRow>

                {/* 3 · Theme & Appearance */}
                <SettingRow Icon={Sun} label="Theme & Appearance" open={openSection === "theme"} onToggle={() => toggleSection("theme")}>
                  <div className="grid grid-cols-3 gap-2.5">
                    {(
                      [
                        { id: "light" as ThemeMode, label: "Light", desc: "Default platform theme", Icon: Sun },
                        { id: "dark" as ThemeMode, label: "Dark", desc: "Reduced eye strain at night", Icon: Moon },
                        { id: "system" as ThemeMode, label: "System", desc: "Follows OS preference", Icon: Monitor },
                      ]
                    ).map(({ id, label, desc, Icon }) => {
                      const on = theme === id;
                      return (
                        <button
                          key={id}
                          onClick={() => setTheme(id)}
                          className={`flex flex-col items-center gap-1.5 rounded-md border px-2 py-3 text-center transition-colors duration-150 ${
                            on ? "border-saffron bg-saffron/8" : "border-hairline bg-white active:bg-navy/5"
                          }`}
                        >
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${on ? "bg-saffron text-white" : "bg-paper text-ink/60"}`}>
                            <Icon size={16} strokeWidth={1.75} />
                          </div>
                          <span className={`font-public text-[13px] font-semibold ${on ? "text-saffron" : "text-navy"}`}>{label}</span>
                          <span className="font-noto text-[10px] leading-tight text-ink/50">{desc}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-3 font-noto text-[11px] text-ink/45">Applies instantly.</p>
                </SettingRow>

                {/* 4 · Language */}
                <SettingRow Icon={Globe} label="Language" open={openSection === "language"} onToggle={() => toggleSection("language")}>
                  <div className="-mt-1 divide-y divide-hairline">
                    {LANGUAGES.map((l) => {
                      const on = language === l.code;
                      return (
                        <button
                          key={l.code}
                          onClick={() => setLanguage(l.code)}
                          className="flex w-full items-center justify-between gap-3 py-3 text-left transition-colors active:opacity-70"
                        >
                          <span className="min-w-0">
                            <span className="block font-public text-[14px] font-semibold text-navy">{l.native}</span>
                            <span className="block font-noto text-[11px] text-ink/50">{l.label}</span>
                          </span>
                          {on && <Check size={17} strokeWidth={2.5} className="shrink-0 text-clear" />}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={handleApplyLanguage}
                    disabled={langSaveState === "saving"}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-navy py-2.5 font-public text-[14px] font-bold text-white transition-opacity active:opacity-75 disabled:opacity-60"
                  >
                    {langSaveState === "saving" ? (
                      <><RefreshCw size={14} strokeWidth={2} className="animate-spin" /> Applying…</>
                    ) : "Apply Language"}
                  </button>
                  {langSaveState === "saved" && (
                    <p className="mt-2.5 font-public text-[13px] font-semibold text-clear">✓ Language applied</p>
                  )}
                </SettingRow>

                {/* 5 · Security & Password */}
                <SettingRow Icon={Shield} label="Security & Password" open={openSection === "security"} onToggle={() => toggleSection("security")}>
                  {/* 2FA */}
                  <div className="flex items-center justify-between gap-3 rounded-md border border-hairline bg-paper px-3.5 py-3">
                    <div className="min-w-0">
                      <p className="font-noto text-[14px] text-navy">Two-Factor Authentication</p>
                      <p className="mt-0.5 font-noto text-[11px] text-ink/50">OTP via registered mobile</p>
                    </div>
                    <Toggle on={twoFA} onToggle={() => setTwoFA((v) => !v)} />
                  </div>

                  {/* Change password */}
                  <p className="mb-2 mt-4 font-public text-[11px] font-semibold uppercase tracking-wider text-ink/50">Change Password</p>
                  <div className="space-y-3">
                    {(
                      [
                        { label: "Current Password", val: currentPwd, set: setCurrentPwd, show: showCurrent, setShow: setShowCurrent, placeholder: "Enter current password" },
                        { label: "New Password", val: newPwd, set: setNewPwd, show: showNew, setShow: setShowNew, placeholder: "Min. 8 characters" },
                        { label: "Confirm New Password", val: confirmPwd, set: setConfirmPwd, show: showConfirm, setShow: setShowConfirm, placeholder: "Re-enter new password" },
                      ] as const
                    ).map(({ label, val, set, show, setShow, placeholder }) => (
                      <div key={label}>
                        <label className="mb-1.5 block font-noto text-[12px] text-ink/60">{label}</label>
                        <div className="flex items-center gap-2 rounded border border-navy/20 bg-paper px-3 py-2 transition-colors focus-within:border-navy">
                          <Lock size={13} strokeWidth={2} className="shrink-0 text-ink/40" />
                          <input
                            type={show ? "text" : "password"}
                            value={val}
                            onChange={(e) => set(e.target.value)}
                            className="flex-1 bg-transparent font-noto text-[14px] text-navy outline-none placeholder:text-ink/30"
                            placeholder={placeholder}
                          />
                          <button onClick={() => setShow((v: boolean) => !v)} className="text-ink/40 transition-colors active:text-navy">
                            {show ? <EyeOff size={14} strokeWidth={2} /> : <Eye size={14} strokeWidth={2} />}
                          </button>
                        </div>
                        {label === "New Password" && <PasswordStrength password={val} />}
                      </div>
                    ))}
                    {pwdError && <p className="font-noto text-[12px] text-critical">{pwdError}</p>}
                  </div>
                  <button
                    onClick={handleChangePassword}
                    disabled={pwdSaveState === "saving"}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-navy py-2.5 font-public text-[14px] font-bold text-white transition-opacity active:opacity-75 disabled:opacity-60"
                  >
                    {pwdSaveState === "saving" ? (
                      <><RefreshCw size={14} strokeWidth={2} className="animate-spin" /> Updating…</>
                    ) : (
                      <><Key size={14} strokeWidth={2} /> Update Password</>
                    )}
                  </button>

                  {/* Active sessions */}
                  <div className="mb-2 mt-4 flex items-center justify-between">
                    <span className="font-public text-[11px] font-semibold uppercase tracking-wider text-ink/50">Active Sessions</span>
                    <button
                      onClick={handleLogoutOtherSessions}
                      disabled={logoutSessionsState === "done"}
                      className="font-public text-[12px] font-semibold text-critical transition-opacity active:opacity-60 disabled:opacity-50"
                    >
                      {logoutSessionsState === "done" ? "Others logged out" : "Logout others"}
                    </button>
                  </div>
                  <div className="divide-y divide-hairline rounded-md border border-hairline bg-white">
                    {[
                      { device: "This device · Android", icon: <Smartphone size={15} strokeWidth={1.75} className="text-navy" />, info: "Dimapur · Active now", current: true },
                      { device: "Chrome · Windows PC", icon: <Monitor size={15} strokeWidth={1.75} className="text-ink/50" />, info: "Guwahati · 2h ago", current: false },
                      { device: "Safari · iPhone", icon: <Smartphone size={15} strokeWidth={1.75} className="text-ink/50" />, info: "Shillong · Yesterday", current: false },
                    ].map(({ device, icon, info, current }) => (
                      <div key={device} className="flex items-center gap-3 px-3.5 py-3">
                        <div className="shrink-0">{icon}</div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-public text-[13px] font-semibold text-navy">{device}</p>
                          <p className="font-noto text-[11px] text-ink/50">{info}</p>
                        </div>
                        {current && (
                          <span className="rounded-full border border-clear/30 bg-clear/10 px-2 py-0.5 font-public text-[10px] font-bold text-clear">
                            Current
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </SettingRow>
              </div>
            )}

            {/* ── LOGOUT (always visible at bottom) ──────────── */}
            <SectionHeader label="Account" />
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-critical py-3 font-public text-[14px] font-bold text-white transition-opacity active:opacity-80"
            >
              <LogOut size={15} strokeWidth={2} />
              Log Out
            </button>

            <p className="mt-4 text-center font-noto text-[11px] text-ink/35">
              NER Logistics Platform · SIH26002 · v1.0.0
            </p>
          </div>
        </div>
      </div>

      {/* ── Logout confirmation dialog ──────────────────────────── */}
      {showLogoutConfirm && (
        <div
          className="absolute inset-0 z-60 flex items-center justify-center bg-black/60 px-6"
          style={{ animation: "quietFade 150ms ease-out" }}
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="w-full max-w-[320px] rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-critical/10 mb-4">
              <LogOut size={22} strokeWidth={1.75} className="text-critical" />
            </div>
            <h3 className="font-public text-[18px] font-bold text-navy leading-tight">
              Log out of platform?
            </h3>
            <p className="mt-2 font-noto text-[13px] leading-relaxed text-ink/70">
              Any active trips or unsaved reports will be preserved locally. You can sign back in at any time.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-lg border border-navy/20 py-2.5 font-public text-[14px] font-semibold text-navy transition-colors active:bg-navy/5"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onSignOut?.();
                }}
                className="flex-1 rounded-lg bg-critical py-2.5 font-public text-[14px] font-bold text-white transition-opacity active:opacity-80"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
