import { useState } from "react";
import { Check, Warning, RouteNodes, Building, Broadcast } from "./icons";
import { AshokaChakra } from "./AshokaChakra";
import { useAuth } from "../lib/useAuth";

export type Role = "field" | "district" | "control";

// Role identities used to gate + validate sign-in. Demo credentials are
// pre-filled per role so the happy path is one tap; typing another role's ID
// triggers the mismatch error described in the flow.
const ROLE_AUTH: Record<
  Role,
  { label: string; desc: string; Icon: typeof RouteNodes; id: string; pw: string; placeholder: string }
> = {
  field: {
    label: "Field Officer",
    desc: "Ground reporting, route planning, incident logging.",
    Icon: RouteNodes,
    id: "NER-FO-4471",
    pw: "demo1234",
    placeholder: "field.officer@gov.in or employee ID",
  },
  district: {
    label: "District Officer",
    desc: "District-level connectivity oversight and reporting review.",
    Icon: Building,
    id: "NER-DO-2210",
    pw: "demo1234",
    placeholder: "district.officer@gov.in or employee ID",
  },
  control: {
    label: "Control Room",
    desc: "Region-wide monitoring, fleet tracking, alert broadcast.",
    Icon: Broadcast,
    id: "NER-CR-0007",
    pw: "demo1234",
    placeholder: "controlroom@gov.in or employee ID",
  },
};

// Infer which role a typed credential belongs to (for role-mismatch validation).
function roleFromCredential(cred: string): Role | null {
  const c = cred.trim().toLowerCase();
  if (!c) return null;
  if (c.includes("ner-fo") || c.startsWith("field")) return "field";
  if (c.includes("ner-do") || c.startsWith("district")) return "district";
  if (c.includes("ner-cr") || c.startsWith("controlroom") || c.startsWith("control")) return "control";
  return null; // unknown → treated as belonging to the selected role (lenient demo)
}

// District / region options — NER states plus key districts.
const DISTRICTS = [
  "Kamrup Metro, Assam",
  "Barpeta, Assam",
  "Dibrugarh, Assam",
  "Cachar (Silchar), Assam",
  "Dimapur, Nagaland",
  "Kohima, Nagaland",
  "Imphal West, Manipur",
  "Aizawl, Mizoram",
  "East Khasi Hills (Shillong), Meghalaya",
  "Tawang, Arunachal Pradesh",
  "East Sikkim (Gangtok), Sikkim",
  "West Tripura (Agartala), Tripura",
  "NER Regional Command (all states)",
];

const LANGS = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "bn", label: "বাংলা" },
  { code: "as", label: "অসমীয়া" },
  { code: "brx", label: "बड़ो" },
  { code: "kha", label: "Khasi" },
];

// Pale tricolor tints — low saturation, "official document" register.
// Splash screen owns the full-saturation version; this stays subtle.
const BG =
  "linear-gradient(180deg," +
  "#F9ECD6 0%," +
  "#F7EDE0 14%," +
  "#F5F0E9 32%," +
  "#F4F1EB 54%," +
  "#EDF4F0 72%," +
  "#E8F2EC 88%," +
  "#E3EFE9 100%)";

// Frosted glass card — the one screen surface in this app that uses blur + shadow.
const GLASS: React.CSSProperties = {
  background: "rgba(255,255,255,0.83)",
  backdropFilter: "blur(22px)",
  WebkitBackdropFilter: "blur(22px)",
  boxShadow:
    "0 8px 40px rgba(14,42,71,0.10), 0 2px 12px rgba(14,42,71,0.06)",
  border: "1px solid rgba(255,255,255,0.68)",
};

export default function LoginScreen({
  onAuthed,
  onBack,
  initialMode = "signin",
  initialLang = "en",
  entering = false,
}: {
  onAuthed: (role: Role) => void;
  onBack?: (e: React.MouseEvent) => void;
  initialMode?: "signin" | "create";
  initialLang?: string;
  entering?: boolean;
}) {
  const [mode, setMode] = useState<"signin" | "create">(initialMode);
  const [lang, setLang] = useState(initialLang);
  // Freeze the entering state at mount so the scale-in plays exactly once,
  // timed to land as the tricolor wipe completes.
  const [enterAnim] = useState(entering);

  return (
    <div className="relative flex h-full flex-col overflow-hidden font-public">
      {/* Tricolor gradient background */}
      <div className="absolute inset-0" style={{ background: BG }} />

      {/* Ashoka Chakra watermark — accurate traditional wheel, faint behind the card */}
      <div
        className="pointer-events-none absolute left-1/2 -translate-x-1/2"
        style={{ top: "26%", zIndex: 1, opacity: 0.057 }}
      >
        <AshokaChakra size={300} color="#0E2A47" />
      </div>

      {/* All content */}
      <div className="relative flex h-full flex-col" style={{ zIndex: 2 }}>
        {/* Status bar */}
        <div className="flex shrink-0 items-center justify-between px-5 pt-3.5">
          <span className="font-public text-[15px] font-bold text-navy">09:41</span>
          <div className="flex items-center gap-1.5 text-navy/70">
            <StatusBar />
          </div>
        </div>

        {/* Persistent top row: back button + language */}
        <div className="flex shrink-0 items-center justify-between px-5 pt-2 pb-1">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 font-public text-[14px] font-semibold text-navy/70 active:text-navy"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Go back
          </button>

          {/* Language selector */}
          <div className="flex items-center gap-2">
            <span className="font-noto text-[12px] text-navy/50">Language</span>
            <div className="relative">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                aria-label="Select language"
                className="appearance-none rounded-md border border-navy/15 bg-white/60 py-1 pl-2.5 pr-7 font-public text-[13px] font-semibold text-navy outline-none backdrop-blur-sm focus:border-navy/40"
              >
                {LANGS.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-navy/50"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div
          className={`min-h-0 flex-1 overflow-y-auto ${enterAnim ? "ner-form-in" : ""}`}
          style={{ transformOrigin: "center 30%" }}
        >
          {mode === "signin" ? (
            <SignInView onLogIn={onAuthed} onCreateAccount={() => setMode("create")} />
          ) : (
            <CreateAccountView onAuthed={onAuthed} onSignIn={() => setMode("signin")} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sign In view ──────────────────────────────────────────────────────────────

function SignInView({
  onLogIn,
  onCreateAccount,
}: {
  onLogIn: (r: Role) => void;
  onCreateAccount: () => void;
}) {
  const { signIn, loading: authLoading, error: authError, clearError } = useAuth();
  const [role, setRole] = useState<Role | null>(null);
  const [officerId, setOfficerId] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const error = localError ?? authError;

  // Picking a role pre-fills that role's demo credentials.
  const pickRole = (r: Role) => {
    setRole(r);
    setOfficerId(ROLE_AUTH[r].id);
    setPassword(ROLE_AUTH[r].pw);
    setLocalError(null);
    clearError();
  };

  const credsFilled = officerId.trim() !== "" && password.trim() !== "";
  const canSubmit = role !== null && credsFilled && !submitting && !authLoading;

  const submit = async () => {
    if (!role) return;
    // Client-side role/credential mismatch check (demo guard only).
    const owner = roleFromCredential(officerId);
    if (owner && owner !== role) {
      setLocalError(
        `These credentials aren't registered for ${ROLE_AUTH[role].label}. Check your role selection and try again.`,
      );
      return;
    }
    setLocalError(null);
    setSubmitting(true);
    try {
      // signIn resolves email from officer ID internally and calls
      // supabase.auth.signInWithPassword. The useAuth hook's onAuthStateChange
      // listener fires, loads the profile + DB role, and calls onLogIn.
      await signIn(officerId, password);
      // After signIn the role is loaded in useAuth — but LoginScreen doesn't
      // have direct access to it. App.tsx listens via onAuthed so we pass
      // the UI-selected role as a hint; the DB role is the authoritative one.
      onLogIn(role);
    } catch {
      // errors are surfaced through authError from useAuth
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center px-5 pb-6 pt-5">
      {/* Ashoka Chakra emblem */}
      <AshokaChakra size={60} />

      {/* Screen label + heading */}
      <p className="mt-3 font-public text-[10.5px] font-bold uppercase tracking-[0.1em] text-navy/50">
        Secure sign-in
      </p>
      <h1 className="mt-1.5 text-center font-public text-[24px] font-bold leading-tight text-navy">
        Access your workspace
      </h1>

      {/* Glass card */}
      <div className="mt-5 w-full rounded-2xl px-5 py-5" style={GLASS}>
        {/* ── Step 1 — role selection (hard gate) ── */}
        <div className="mb-1.5 flex items-baseline justify-between">
          <FieldLabel>Who&apos;s logging in?</FieldLabel>
          <span className="font-noto text-[11px] text-navy/45">Step 1 of 2</span>
        </div>
        <p className="mb-2.5 font-noto text-[12.5px] leading-snug text-navy/55">
          Select your role to continue.
        </p>
        <div className="flex flex-col gap-2">
          {(Object.keys(ROLE_AUTH) as Role[]).map((r) => {
            const meta = ROLE_AUTH[r];
            const on = role === r;
            const Icon = meta.Icon;
            return (
              <button
                key={r}
                onClick={() => pickRole(r)}
                className={`flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left transition-colors ${
                  on ? "border-navy/40 bg-navy/5" : "border-navy/12 bg-white/50 active:bg-white/80"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border ${
                    on ? "border-navy/30 bg-navy text-white" : "border-navy/15 bg-white/70 text-navy/70"
                  }`}
                >
                  <Icon size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-public text-[14px] font-bold text-navy">{meta.label}</span>
                  <span className="block font-noto text-[12px] leading-snug text-navy/55">{meta.desc}</span>
                </span>
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    on ? "border-navy bg-navy text-white" : "border-navy/25"
                  }`}
                >
                  {on && <Check size={12} strokeWidth={2.5} />}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Step 2 — credentials (enabled once a role is chosen) ── */}
        <div className="mt-5 border-t border-navy/10 pt-4">
          <div className="mb-2.5 flex items-baseline justify-between">
            <FieldLabel>Credentials</FieldLabel>
            <span className="font-noto text-[11px] text-navy/45">Step 2 of 2</span>
          </div>

          <div className={role ? "" : "pointer-events-none opacity-45"} aria-disabled={!role}>
            <GlassField
              label="Officer ID or email"
              value={officerId}
              onChange={(v) => {
                setOfficerId(v);
                setLocalError(null);
                clearError();
              }}
              placeholder={role ? ROLE_AUTH[role].placeholder : "Select a role first"}
              type="email"
            />

            <div className="mb-1.5 flex items-baseline justify-between">
              <FieldLabel>Password</FieldLabel>
              <button className="font-public text-[13px] font-semibold text-navy/60 active:text-navy">
                Forgot password?
              </button>
            </div>
            <GlassPasswordField
              value={password}
              onChange={(v) => {
                setPassword(v);
                setLocalError(null);
                clearError();
              }}
              show={showPw}
              onToggle={() => setShowPw((s) => !s)}
              error={error ?? undefined}
            />
          </div>
        </div>

        {/* Primary CTA */}
        <button
          onClick={submit}
          disabled={!canSubmit}
          className={`mt-2 w-full rounded-lg py-3.5 font-public text-[16px] font-bold text-white transition-colors ${
            canSubmit ? "bg-navy active:bg-[#1b3f63]" : "cursor-not-allowed bg-navy/30"
          }`}
        >
          {submitting || authLoading
            ? "Signing in…"
            : `Log in${role ? ` as ${ROLE_AUTH[role].label}` : ""}`}
        </button>

        {/* Helper */}
        <p className="mt-3 text-center font-noto text-[12.5px] leading-snug text-navy/50">
          Access is provisioned by your district administrator.
        </p>

        {/* Demo note */}
        <div className="mt-3.5 flex items-start gap-2 rounded-lg border border-[#1e6b45]/25 bg-[#1e6b45]/[0.07] px-3 py-2.5">
          <Check size={15} className="mt-0.5 shrink-0 text-[#1e6b45]" />
          <p className="font-noto text-[12px] leading-snug text-navy/70">
            {role
              ? `Demo credentials pre-filled for ${ROLE_AUTH[role].label} — tap Log in to continue.`
              : "Pick a role above to pre-fill demo credentials and unlock sign-in."}
          </p>
        </div>
      </div>

      {/* Create account link */}
      <button
        onClick={onCreateAccount}
        className="mt-4 font-public text-[14px] font-semibold text-navy/65 active:text-navy"
      >
        Don&apos;t have access?{" "}
        <span className="underline underline-offset-2">Create an account</span>
      </button>

      {/* Footer */}
      <LegalFooter />
    </div>
  );
}

// ── Create Account view ───────────────────────────────────────────────────────

function CreateAccountView({
  onAuthed,
  onSignIn,
}: {
  onAuthed: (r: Role) => void;
  onSignIn: () => void;
}) {
  const { signUp, loading: authLoading, error: authError, clearError } = useAuth();
  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState("");
  const [credential, setCredential] = useState("");
  const [district, setDistrict] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const valid =
    name.trim() !== "" &&
    credential.trim() !== "" &&
    district !== "" &&
    newPw.length >= 8 &&
    confirmPw === newPw &&
    role !== null &&
    !submitting &&
    !authLoading;

  const handleCreate = async () => {
    if (!role || !valid) return;
    setSubmitting(true);
    clearError();
    try {
      await signUp(credential, newPw, name, district);
      // Account created; awaits admin approval — don't auto-navigate.
      setSubmitted(true);
    } catch {
      // error surfaced via authError
    } finally {
      setSubmitting(false);
    }
  };

  // Show confirmation screen after successful signup
  if (submitted) {
    return (
      <div className="flex flex-col items-center px-5 pb-6 pt-10">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-clear/10 border border-clear/30">
          <Check size={28} strokeWidth={2} className="text-clear" />
        </div>
        <h1 className="mt-4 text-center font-public text-[22px] font-bold text-navy">
          Account request submitted
        </h1>
        <p className="mt-3 text-center font-noto text-[14px] leading-relaxed text-navy/60">
          Your account is pending administrator approval. You'll receive an
          email at your registered address once access is granted.
        </p>
        <button
          onClick={onSignIn}
          className="mt-8 w-full rounded-lg bg-navy py-3.5 font-public text-[16px] font-bold text-white active:bg-[#1b3f63]"
        >
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-5 pb-6 pt-5">
      {/* Ashoka Chakra emblem */}
      <AshokaChakra size={60} />

      <p className="mt-3 font-public text-[10.5px] font-bold uppercase tracking-[0.1em] text-navy/50">
        Create account
      </p>
      <h1 className="mt-1.5 text-center font-public text-[24px] font-bold leading-tight text-navy">
        Set up your access
      </h1>

      {/* Glass card */}
      <div className="mt-5 w-full rounded-2xl px-5 py-5" style={GLASS}>
        <GlassField
          label="Full name"
          value={name}
          onChange={setName}
          placeholder="As per official records"
        />
        <GlassField
          label="Official email / employee ID"
          value={credential}
          onChange={setCredential}
          placeholder="officer@gov.in or employee ID"
        />
        <GlassSelect
          label="District / region"
          value={district}
          onChange={setDistrict}
          placeholder="Select your district or region"
          options={DISTRICTS}
        />

        {/* Password */}
        <div className="mb-1.5">
          <FieldLabel>Password</FieldLabel>
        </div>
        <GlassPasswordField
          value={newPw}
          onChange={setNewPw}
          show={showPw}
          onToggle={() => setShowPw((s) => !s)}
          placeholder="Minimum 8 characters"
        />

        {/* Confirm password */}
        <div className="mb-1.5">
          <FieldLabel>Confirm password</FieldLabel>
        </div>
        <GlassPasswordField
          value={confirmPw}
          onChange={setConfirmPw}
          show={showConfirmPw}
          onToggle={() => setShowConfirmPw((s) => !s)}
          placeholder="Re-enter password"
          error={
            confirmPw !== "" && confirmPw !== newPw
              ? "Passwords do not match"
              : undefined
          }
        />

        {/* Role picker */}
        <div className="mb-4">
          <FieldLabel>Select your role</FieldLabel>
          <div className="mt-1.5 flex flex-col gap-2">
            {(Object.keys(ROLE_AUTH) as Role[]).map((r) => {
              const info = ROLE_AUTH[r];
              const on = role === r;
              const RoleIcon = info.Icon;
              return (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  aria-pressed={on}
                  className={`flex min-h-[44px] items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left transition-colors ${
                    on
                      ? "border-navy/40 bg-navy/5"
                      : "border-navy/12 bg-white/50 active:bg-white/80"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      on ? "border-navy bg-navy text-white" : "border-navy/25"
                    }`}
                  >
                    {on && <Check size={12} strokeWidth={2.5} />}
                  </span>
                  <RoleIcon
                    size={20}
                    className={on ? "shrink-0 text-navy" : "shrink-0 text-navy/45"}
                  />
                  <span className="min-w-0">
                    <span className="block font-public text-[14px] font-bold text-navy">
                      {info.label}
                    </span>
                    <span className="block font-noto text-[12px] leading-snug text-navy/55">
                      {info.desc}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={!valid}
          className={`mt-1 w-full rounded-lg py-3.5 font-public text-[16px] font-bold text-white transition-colors ${
            valid ? "bg-navy active:bg-[#1b3f63]" : "cursor-not-allowed bg-navy/30"
          }`}
        >
          {submitting || authLoading ? "Creating account…" : "Create Account"}
        </button>

        {authError && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-critical/25 bg-critical/[0.07] px-3 py-2.5">
            <Warning size={15} className="mt-0.5 shrink-0 text-critical" />
            <p className="font-noto text-[12px] leading-snug text-critical">{authError}</p>
          </div>
        )}

        <p className="mt-3 text-center font-noto text-[12px] leading-snug text-navy/50">
          New accounts require administrator approval before first login. You
          will be notified by email once access is granted.
        </p>
      </div>

      <button
        onClick={onSignIn}
        className="mt-4 font-public text-[14px] font-semibold text-navy/65 active:text-navy"
      >
        Already have access?{" "}
        <span className="underline underline-offset-2">Sign in</span>
      </button>

      <LegalFooter />
    </div>
  );
}

// ── Shared form atoms ─────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-public text-[10.5px] font-bold uppercase tracking-[0.09em] text-navy/55">
      {children}
    </span>
  );
}

function GlassField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  optional,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  optional?: boolean;
}) {
  return (
    <div className="mb-4">
      <div className="mb-1.5 flex items-baseline gap-2">
        <FieldLabel>{label}</FieldLabel>
        {optional && (
          <span className="font-noto text-[11px] text-navy/40">Optional</span>
        )}
      </div>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-navy/15 bg-white px-3.5 py-3 font-noto text-[15px] text-navy outline-none placeholder:text-navy/30 focus:border-navy/50 focus:ring-1 focus:ring-navy/20"
      />
    </div>
  );
}

function GlassSelect({
  label,
  value,
  onChange,
  placeholder,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
}) {
  return (
    <div className="mb-4">
      <div className="mb-1.5">
        <FieldLabel>{label}</FieldLabel>
      </div>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none rounded-lg border border-navy/15 bg-white px-3.5 py-3 pr-9 font-noto text-[15px] outline-none focus:border-navy/50 focus:ring-1 focus:ring-navy/20 ${
            value === "" ? "text-navy/30" : "text-navy"
          }`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o} value={o} className="text-navy">
              {o}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-navy/40">
          ▾
        </span>
      </div>
    </div>
  );
}

function GlassPasswordField({
  value,
  onChange,
  show,
  onToggle,
  error,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  error?: string;
  placeholder?: string;
}) {
  return (
    <div className="mb-4">
      <div
        className={`flex items-center rounded-lg border bg-white pr-1 focus-within:ring-1 ${
          error
            ? "border-[#b3261e] focus-within:ring-[#b3261e]/20"
            : "border-navy/15 focus-within:border-navy/50 focus-within:ring-navy/20"
        }`}
      >
        <input
          type={show ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg bg-transparent px-3.5 py-3 font-noto text-[15px] text-navy outline-none placeholder:text-navy/30"
        />
        <button
          type="button"
          onClick={onToggle}
          className="shrink-0 px-2.5 py-1 font-public text-[12px] font-semibold text-navy/55 active:text-navy"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
      {error && (
        <span className="mt-1.5 flex items-center gap-1.5 font-noto text-[12px] text-[#b3261e]">
          <Warning size={13} /> {error}
        </span>
      )}
    </div>
  );
}

// ── Identity lockup ───────────────────────────────────────────────────────────

function LoginEmblem() {
  const N = 24;
  const S = 48;
  const CX = S / 2;
  const CY = S / 2;
  const R = S * 0.455;
  const R2 = S * 0.305;
  const R3 = S * 0.16;
  const C = "#B87333";

  return (
    <div className="flex flex-col items-center">
      <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
        <circle cx={CX} cy={CY} r={R} stroke={C} strokeWidth="2" fill="none" />
        {Array.from({ length: N }, (_, i) => {
          const a = (i * 2 * Math.PI) / N - Math.PI / 2;
          const isMain = i % 3 === 0;
          return (
            <line
              key={i}
              x1={CX + R3 * Math.cos(a)}
              y1={CY + R3 * Math.sin(a)}
              x2={CX + (isMain ? R - 1 : R2) * Math.cos(a)}
              y2={CY + (isMain ? R - 1 : R2) * Math.sin(a)}
              stroke={C}
              strokeWidth={isMain ? 1.4 : 0.75}
              opacity={isMain ? 1 : 0.6}
            />
          );
        })}
        <circle cx={CX} cy={CY} r={R2} stroke={C} strokeWidth="0.7" fill="none" opacity="0.4" />
        <circle cx={CX} cy={CY} r={R3} stroke={C} strokeWidth="1.5" fill="none" />
        <circle cx={CX} cy={CY} r={S * 0.065} fill={C} />
        <circle cx={CX} cy={CY} r={S * 0.033} fill="#D4A055" />
      </svg>
      <p className="mt-2 font-public text-[17px] font-bold leading-tight text-navy">
        NER Logistics Platform
      </p>
      <p className="mt-0.5 font-noto text-[12px] text-navy/50">
        MDoNER · SIH26002
      </p>
    </div>
  );
}

// ── Ashoka Chakra watermark ───────────────────────────────────────────────────

// ── Legal footer ──────────────────────────────────────────────────────────────

function LegalFooter() {
  return (
    <p className="mt-5 max-w-[300px] text-center font-noto text-[11px] leading-relaxed text-navy/40">
      For official use only. Activity on this system is monitored and logged.
      Unauthorized access is an offence under applicable law.
    </p>
  );
}

// ── Status bar glyphs ─────────────────────────────────────────────────────────

function StatusBar() {
  return (
    <>
      <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
        <rect x="0" y="8" width="3" height="4" rx="0.5" />
        <rect x="5" y="5" width="3" height="7" rx="0.5" />
        <rect x="10" y="2.5" width="3" height="9.5" rx="0.5" />
        <rect x="15" y="0" width="3" height="12" rx="0.5" />
      </svg>
      <svg width="17" height="12" viewBox="0 0 17 12" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M1 4.2C3.4 2 5.8 1 8.5 1S13.6 2 16 4.2" strokeLinecap="round" />
        <path d="M3.6 7C5.1 5.7 6.7 5 8.5 5s3.4.7 4.9 2" strokeLinecap="round" />
        <path d="M6.2 9.7c.7-.6 1.5-.9 2.3-.9s1.6.3 2.3.9" strokeLinecap="round" />
        <circle cx="8.5" cy="11.4" r="0.6" fill="currentColor" stroke="none" />
      </svg>
      <svg width="26" height="13" viewBox="0 0 26 13" fill="none">
        <rect x="0.5" y="0.5" width="22" height="12" rx="3" stroke="currentColor" opacity="0.5" />
        <rect x="2" y="2" width="18" height="9" rx="1.5" fill="currentColor" />
        <rect x="24" y="4" width="2" height="5" rx="1" fill="currentColor" opacity="0.5" />
      </svg>
    </>
  );
}
