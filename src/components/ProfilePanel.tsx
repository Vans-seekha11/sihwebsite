import { useEffect, useRef, useState } from 'react';
import { profileService, type ProfileMeta } from '@/lib/profileService';

const NAVY = '#17324D';
const TEAL = '#2F6F7E';
const GOLD = '#D7A73A';
const BORDER = 'rgba(120,140,160,0.30)';
const SURFACE_2 = 'rgba(233,238,241,0.85)';

// ─── tiny helpers ─────────────────────────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} aria-pressed={on}
      className="relative rounded-full transition-colors flex-shrink-0"
      style={{ width: 38, height: 22, background: on ? TEAL : 'rgba(120,140,160,0.4)' }}>
      <span className="absolute top-0.5 rounded-full bg-white shadow transition-all"
        style={{ width: 18, height: 18, left: on ? 18 : 2 }} />
    </button>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-medium mb-1" style={{ color: '#637480' }}>{children}</div>;
}

function Input({ value, onChange, type = 'text', placeholder = '' }: {
  value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <input type={type} value={value} placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all"
      style={{
        borderColor: BORDER, color: '#16222E', background: 'rgba(255,255,255,0.8)',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
      }}
      onFocus={e => (e.currentTarget.style.borderColor = TEAL)}
      onBlur={e => (e.currentTarget.style.borderColor = BORDER)}
    />
  );
}

function PasswordInput({ value, onChange, placeholder = '' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input type={show ? 'text' : 'password'} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-lg border px-3 py-2 pr-9 text-sm outline-none transition-all"
        style={{ borderColor: BORDER, color: '#16222E', background: 'rgba(255,255,255,0.8)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)' }}
        onFocus={e => (e.currentTarget.style.borderColor = TEAL)}
        onBlur={e => (e.currentTarget.style.borderColor = BORDER)}
      />
      <button type="button" onClick={() => setShow(s => !s)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs transition-colors"
        style={{ color: show ? TEAL : '#9AAAB5' }}>
        {show ? '◉' : '◎'}
      </button>
    </div>
  );
}

function PasswordStrength({ pwd }: { pwd: string }) {
  const score = !pwd ? 0
    : pwd.length < 6 ? 1
    : pwd.length < 10 ? 2
    : /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd) ? 4
    : 3;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#BE2424', '#D7A73A', '#2F6F7E', '#2D6B4F'];
  if (!pwd) return null;
  return (
    <div className="mt-1.5 flex items-center gap-2">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-1 flex-1 rounded-full transition-colors"
            style={{ background: i <= score ? colors[score] : 'rgba(120,140,160,0.2)' }} />
        ))}
      </div>
      <span className="text-xs font-medium" style={{ color: colors[score] }}>{labels[score]}</span>
    </div>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.6)', border: `1px solid ${BORDER}` }}>
      {children}
    </div>
  );
}

function SectionHeader({ icon, title, expanded, onToggle }: { icon: string; title: string; expanded: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-black/[0.03]"
      style={{ borderBottom: expanded ? `1px solid ${BORDER}` : 'none' }}>
      <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
        style={{ background: SURFACE_2, color: NAVY }}>{icon}</span>
      <span className="flex-1 text-sm font-semibold" style={{ color: NAVY }}>{title}</span>
      <span className="text-sm transition-transform" style={{ color: '#B0B8C0', transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>›</span>
    </button>
  );
}

function SuccessBanner({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
      style={{ background: 'rgba(45,107,79,0.10)', border: '1px solid rgba(45,107,79,0.25)', color: '#2D6B4F' }}>
      <span>✓</span> {msg}
    </div>
  );
}

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
      style={{ background: 'rgba(190,36,36,0.08)', border: '1px solid rgba(190,36,36,0.25)', color: '#BE2424' }}>
      <span>⚠</span> {msg}
    </div>
  );
}

// ─── edit-profile section ─────────────────────────────────────────────────────

function EditProfileSection({ meta, onSave }: { meta: ProfileMeta; onSave: (updates: Partial<ProfileMeta>) => void }) {
  const [form, setForm] = useState({
    name: meta.profileName, phone: meta.phone, email: meta.email, department: meta.department, region: meta.region, label: meta.label, avatarUrl: meta.avatarUrl ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [avatarSeed, setAvatarSeed] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(meta.avatarUrl ?? '');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setAvatarUrl(url);
    setAvatarSeed(s => s + 1);
  };

  const save = async () => {
    setError(''); setSuccess(false);
    
    // Validation
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!form.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!form.email.includes('@') || !form.email.includes('.')) {
      setError('Invalid email format');
      return;
    }
    if (form.label !== 'Control Officer' && !form.region.trim()) {
      setError('District/Region is required');
      return;
    }
    if (form.phone && !/^[\d\s\+\-\(\)]{10,}$/.test(form.phone.replace(/\s/g, ''))) {
      setError('Invalid phone number format');
      return;
    }

    setSaving(true);
    const result = await profileService.updateProfile({
      profileName: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      department: form.department.trim(),
      region: form.region.trim(),
      label: form.label,
      avatarUrl,
    });
    
    setSaving(false);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
      // Call the original onSave for backward compatibility
      onSave({
        profileName: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        department: form.department.trim(),
        region: form.region.trim(),
        label: form.label,
        avatarUrl,
      });
    } else {
      setError(result.error || 'Failed to update profile');
    }
  };

  const reset = () => {
    setForm({ name: meta.profileName, phone: meta.phone, email: meta.email, department: meta.department, region: meta.region, label: meta.label, avatarUrl: meta.avatarUrl ?? '' });
    setAvatarUrl(meta.avatarUrl ?? '');
    setError('');
  };

  return (
    <div className="p-4 space-y-4">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 flex-shrink-0">
          {avatarUrl
            ? <img key={avatarSeed} src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover" style={{ boxShadow: `0 0 0 3px ${GOLD}` }} />
            : <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
                style={{ background: `linear-gradient(135deg, ${NAVY}, ${TEAL})`, color: 'white', boxShadow: `0 0 0 3px ${GOLD}` }}>
                {meta.avatarUrl ? <img src={meta.avatarUrl} alt="Profile" className="h-full w-full rounded-full object-cover" /> : meta.profileInitials}
              </div>
          }
          <button onClick={() => fileRef.current?.click()}
            className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-transform hover:scale-110"
            style={{ background: GOLD, color: '#17212B', boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }}>
            ✎
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
        <div>
          <div className="text-sm font-semibold" style={{ color: NAVY }}>{form.name}</div>
          <div className="text-xs" style={{ color: '#8A9098' }}>{meta.officerId} · {meta.label}</div>
          <button onClick={() => fileRef.current?.click()}
            className="text-xs mt-1 underline transition-colors"
            style={{ color: TEAL }}>
            Change photo
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-3">
        <div>
          <Label>Full Name</Label>
          <Input value={form.name} onChange={v => setForm(s => ({ ...s, name: v }))} placeholder="Full name" />
        </div>
        <div>
          <Label>Phone</Label>
          <Input value={form.phone} onChange={v => setForm(s => ({ ...s, phone: v }))} placeholder="+91 …" />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={form.email} onChange={v => setForm(s => ({ ...s, email: v }))} type="email" placeholder="name@gov.in" />
        </div>
        <div>
          <Label>Department</Label>
          <Input value={form.department} onChange={v => setForm(s => ({ ...s, department: v }))} />
        </div>
        <div>
          <Label>Role / Position</Label>
          <select value={form.label} onChange={e => setForm(s => ({ ...s, label: e.target.value }))}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ borderColor: BORDER, color: '#16222E', background: 'rgba(255,255,255,0.8)' }}>
            <option>Field Officer</option>
            <option>District Officer</option>
            <option>Control Officer</option>
          </select>
        </div>
        {form.label !== 'Control Officer' && <div>
          <Label>District / Region</Label>
          <Input value={form.region} onChange={v => setForm(s => ({ ...s, region: v }))} />
        </div>}
      </div>

      {success && <SuccessBanner msg="Profile updated successfully." />}
      {error && <ErrorBanner msg={error} />}

      <div className="flex gap-2 pt-1">
        <button onClick={save} disabled={saving}
          className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: NAVY, color: 'white' }}>
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving…
            </span>
          ) : 'Save Changes'}
        </button>
        <button onClick={reset}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          style={{ background: SURFACE_2, color: '#5A6670' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── security section ─────────────────────────────────────────────────────────

const SESSIONS = [
  { device: 'Chrome · Windows 11', location: 'Guwahati, AS', time: 'Active now', current: true },
  { device: 'Mobile · Android 14', location: 'Dimapur, NL', time: '2h ago', current: false },
  { device: 'Firefox · macOS', location: 'Kohima, NL', time: '1d ago', current: false },
];

function SecuritySection() {
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [twoFA, setTwoFA] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [sessions, setSessions] = useState(SESSIONS);

  const changePwd = async () => {
    setError(''); setSuccess('');
    if (!cur) { setError('Enter your current password.'); return; }
    if (next.length < 8) { setError('New password must be at least 8 characters.'); return; }
    if (next !== confirm) { setError('Passwords do not match.'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    setSuccess('Password changed successfully.');
    setCur(''); setNext(''); setConfirm('');
    setTimeout(() => setSuccess(''), 3500);
  };

  const logoutOther = async () => {
    await new Promise(r => setTimeout(r, 600));
    setSessions(s => s.filter(x => x.current));
    setSuccess('Other sessions terminated.');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="p-4 space-y-5">
      {/* 2FA */}
      <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: SURFACE_2 }}>
        <div>
          <div className="text-sm font-semibold" style={{ color: NAVY }}>Two-Factor Authentication</div>
          <div className="text-xs" style={{ color: '#8A9098' }}>OTP via registered mobile</div>
        </div>
        <Toggle on={twoFA} onChange={setTwoFA} />
      </div>

      {/* Change Password */}
      <div className="space-y-3">
        <div className="text-sm font-semibold" style={{ color: NAVY }}>Change Password</div>
        <div>
          <Label>Current Password</Label>
          <PasswordInput value={cur} onChange={setCur} placeholder="Current password" />
        </div>
        <div>
          <Label>New Password</Label>
          <PasswordInput value={next} onChange={setNext} placeholder="Min. 8 characters" />
          <PasswordStrength pwd={next} />
        </div>
        <div>
          <Label>Confirm New Password</Label>
          <PasswordInput value={confirm} onChange={setConfirm} placeholder="Repeat new password" />
        </div>
        {error && <ErrorBanner msg={error} />}
        {success && <SuccessBanner msg={success} />}
        <button onClick={changePwd} disabled={saving}
          className="w-full py-2 rounded-lg text-sm font-semibold transition-all hover:-translate-y-0.5 disabled:opacity-60"
          style={{ background: TEAL, color: 'white' }}>
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Updating…
            </span>
          ) : 'Update Password'}
        </button>
      </div>

      {/* Active Sessions */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold" style={{ color: NAVY }}>Active Sessions</div>
          {sessions.length > 1 && (
            <button onClick={logoutOther}
              className="text-xs px-2.5 py-1 rounded transition-colors"
              style={{ background: 'rgba(190,36,36,0.08)', color: '#BE2424', border: '1px solid rgba(190,36,36,0.25)' }}>
              Logout others
            </button>
          )}
        </div>
        <div className="space-y-1.5">
          {sessions.map((s, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
              style={{ background: s.current ? 'rgba(47,111,126,0.08)' : SURFACE_2, border: s.current ? `1px solid rgba(47,111,126,0.25)` : `1px solid ${BORDER}` }}>
              <span className="text-sm flex-shrink-0" style={{ color: s.current ? TEAL : '#8A9098' }}>
                {s.device.includes('Mobile') ? '📱' : '💻'}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate" style={{ color: '#16222E' }}>{s.device}</div>
                <div className="text-xs" style={{ color: '#8A9098' }}>{s.location} · {s.time}</div>
              </div>
              {s.current && <span className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(47,111,126,0.12)', color: TEAL }}>Current</span>}
            </div>
          ))}
          {sessions.length === 1 && (
            <div className="text-xs text-center py-1" style={{ color: '#8A9098' }}>No other active sessions.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── notifications section ────────────────────────────────────────────────────

function NotificationsSection() {
  const [n, setN] = useState({
    criticalAlerts: true, incidentUpdates: true, taskUpdates: true,
    aiAlerts: true, emailNotif: false, smsNotif: false, dailyDigest: true,
  });
  const [saved, setSaved] = useState(false);

  const savePrefs = async () => {
    await new Promise(r => setTimeout(r, 600));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const rows: { key: keyof typeof n; icon: string; label: string; sub: string }[] = [
    { key: 'criticalAlerts', icon: '◬', label: 'Critical Alerts', sub: 'Push for P1/P2 incidents' },
    { key: 'incidentUpdates', icon: '◆', label: 'Incident Updates', sub: 'Status changes and escalations' },
    { key: 'taskUpdates', icon: '☑', label: 'Task Updates', sub: 'Assigned and completed tasks' },
    { key: 'aiAlerts', icon: '✦', label: 'AI Alerts', sub: 'Predictive risk and anomaly flags' },
    { key: 'emailNotif', icon: '✉', label: 'Email Notifications', sub: 'To registered gov email' },
    { key: 'smsNotif', icon: '☎', label: 'SMS Notifications', sub: 'To registered mobile number' },
    { key: 'dailyDigest', icon: '⊡', label: 'Daily Digest', sub: 'Summary at 8:00 AM IST' },
  ];

  return (
    <div className="p-4 space-y-3">
      <div className="space-y-1">
        {rows.map(r => (
          <div key={r.key} className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-black/[0.03]">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0"
              style={{ background: SURFACE_2, color: NAVY }}>{r.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium" style={{ color: '#16222E' }}>{r.label}</div>
              <div className="text-xs" style={{ color: '#8A9098' }}>{r.sub}</div>
            </div>
            <Toggle on={n[r.key]} onChange={v => setN(s => ({ ...s, [r.key]: v }))} />
          </div>
        ))}
      </div>
      {saved && <SuccessBanner msg="Notification preferences saved." />}
      <button onClick={savePrefs}
        className="w-full py-2 rounded-lg text-sm font-semibold transition-all hover:-translate-y-0.5"
        style={{ background: NAVY, color: 'white' }}>
        Save Preferences
      </button>
    </div>
  );
}

// ─── appearance section ───────────────────────────────────────────────────────

function AppearanceSection() {
  const [theme, setTheme] = useState<'Light' | 'Dark' | 'System'>('Light');
  const [applied, setApplied] = useState(false);

  const apply = (t: typeof theme) => {
    setTheme(t);
    setApplied(true);
    setTimeout(() => setApplied(false), 2000);
  };

  const options: { key: typeof theme; icon: string; desc: string }[] = [
    { key: 'Light', icon: '☀', desc: 'Default platform theme' },
    { key: 'Dark', icon: '◑', desc: 'Reduced eye strain at night' },
    { key: 'System', icon: '⊙', desc: 'Follows OS preference' },
  ];

  return (
    <div className="p-4 space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {options.map(o => {
          const active = theme === o.key;
          return (
            <button key={o.key} onClick={() => apply(o.key)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all"
              style={{ borderColor: active ? GOLD : 'rgba(120,140,160,0.2)', background: active ? 'rgba(215,167,58,0.07)' : 'rgba(255,255,255,0.5)' }}>
              <span className="text-xl">{o.icon}</span>
              <div className="text-xs font-semibold" style={{ color: active ? NAVY : '#5A6670' }}>{o.key}</div>
              <div className="text-xs text-center leading-tight" style={{ color: '#8A9098', fontSize: 10 }}>{o.desc}</div>
            </button>
          );
        })}
      </div>
      {applied && <SuccessBanner msg={`${theme} theme applied.`} />}
    </div>
  );
}

// ─── language section ─────────────────────────────────────────────────────────

function LanguageSection() {
  const [lang, setLang] = useState('English');
  const [saved, setSaved] = useState(false);
  const langs = ['English', 'हिन्दी', 'অসমীয়া', 'বাংলা', 'Naga (Tenyidie)', 'Mizo (Mizo Ṭawng)'];

  const save = async () => {
    await new Promise(r => setTimeout(r, 500));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-4 space-y-3">
      <div className="space-y-1.5">
        {langs.map(l => (
          <button key={l} onClick={() => setLang(l)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all text-sm text-left"
            style={{
              borderColor: lang === l ? TEAL : BORDER,
              background: lang === l ? 'rgba(47,111,126,0.07)' : 'rgba(255,255,255,0.5)',
              color: lang === l ? NAVY : '#5A6670',
            }}>
            {l}
            {lang === l && <span style={{ color: TEAL }}>✓</span>}
          </button>
        ))}
      </div>
      {saved && <SuccessBanner msg={`Language set to ${lang}.`} />}
      <button onClick={save}
        className="w-full py-2 rounded-lg text-sm font-semibold transition-all hover:-translate-y-0.5"
        style={{ background: NAVY, color: 'white' }}>
        Apply Language
      </button>
    </div>
  );
}

// ─── logout dialog ────────────────────────────────────────────────────────────

function LogoutDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0" style={{ background: 'rgba(16,30,44,0.55)' }} onClick={onCancel} />
      <div className="relative rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4"
        style={{ background: 'rgba(247,249,251,0.98)', border: `1px solid ${BORDER}`, backdropFilter: 'blur(14px)' }}>
        <div className="flex items-center gap-3 mb-4">
          <span className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: 'rgba(190,36,36,0.10)' }}>→</span>
          <div>
            <div className="text-base font-semibold" style={{ color: NAVY }}>Confirm Logout</div>
            <div className="text-xs" style={{ color: '#8A9098' }}>Your session will be terminated</div>
          </div>
        </div>
        <p className="text-sm mb-5" style={{ color: '#4A5560' }}>
          Are you sure you want to log out of the NER Platform? Any unsaved changes will be lost.
        </p>
        <div className="flex gap-2">
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all hover:-translate-y-0.5"
            style={{ background: '#BE2424', color: 'white' }}>
            Logout
          </button>
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            style={{ background: SURFACE_2, color: '#5A6670' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── profile info rows ────────────────────────────────────────────────────────

function Row({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 px-4 py-2.5 rounded-lg transition-colors hover:bg-black/[0.03]">
      <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
        style={{ background: SURFACE_2, color: TEAL }}>{icon}</span>
      <div className="min-w-0">
        <div className="text-xs" style={{ color: '#8A9098' }}>{label}</div>
        <div className="text-sm font-medium break-words" style={{ color: '#16222E' }}>{value}</div>
      </div>
    </div>
  );
}

// ─── main panel ──────────────────────────────────────────────────────────────

export default function ProfilePanel({ open, onClose, meta, onSave }: { open: boolean; onClose: () => void; meta: ProfileMeta; onSave: (updates: Partial<ProfileMeta>) => void }) {
  const [tab, setTab] = useState<'profile' | 'settings'>('profile');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Reset expanded section when switching tabs or closing
  useEffect(() => { if (!open) setExpanded(null); }, [open]);

  const toggle = (key: string) => setExpanded(e => (e === key ? null : key));

  const handleLogout = async () => {
    setLoggingOut(true);
    await new Promise(r => setTimeout(r, 800));
    setLoggingOut(false);
    setLogoutDialog(false);
    onClose();
    profileService.clearSession();
  };

  if (!open && !loggingOut) return null;
  const statusActive = /active|duty|online/i.test(meta.status);

  const SETTINGS_SECTIONS = [
    { key: 'edit', icon: '✎', title: 'Edit Profile', content: <EditProfileSection meta={meta} onSave={onSave} /> },
    { key: 'notif', icon: '◬', title: 'Notifications', content: <NotificationsSection /> },
    { key: 'appearance', icon: '◐', title: 'Theme & Appearance', content: <AppearanceSection /> },
    { key: 'language', icon: '⚑', title: 'Language', content: <LanguageSection /> },
    { key: 'security', icon: '⛨', title: 'Security & Password', content: <SecuritySection /> },
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <div className="absolute inset-0 transition-opacity" style={{ background: 'rgba(16,30,44,0.42)' }} onClick={onClose} />

        {/* Panel */}
        <div className="ui-panel relative h-full w-full max-w-md flex flex-col shadow-2xl"
          style={{ background: 'rgba(247,249,251,0.98)', backdropFilter: 'blur(14px)', borderLeft: `1px solid ${BORDER}` }}>

          {/* Header banner */}
          <div className="relative px-5 pt-5 pb-6 flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #1E4A63 60%, ${TEAL} 130%)` }}>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest" style={{ color: 'rgba(215,231,242,0.75)', fontSize: 10 }}>Account</span>
              <button onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ color: 'white', background: 'rgba(255,255,255,0.12)' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.24)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)')}>✕</button>
            </div>
            <div className="flex items-center gap-4 mt-3">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.14)', color: 'white', boxShadow: `0 0 0 3px ${GOLD}` }}>
                {meta.profileInitials}
              </div>
              <div className="min-w-0">
                <div className="text-lg font-semibold text-white leading-tight">{meta.profileName}</div>
                <div className="text-xs" style={{ color: 'rgba(215,231,242,0.85)' }}>{meta.label} · {meta.officerId}</div>
                <span className="inline-flex items-center gap-1.5 mt-1.5 text-xs px-2 py-0.5 rounded-full"
                  style={{ background: statusActive ? 'rgba(93,187,138,0.22)' : 'rgba(215,167,58,0.22)', color: statusActive ? '#C9F0D8' : '#F4E2B0' }}>
                  <span className="ui-pulse-dot w-1.5 h-1.5 rounded-full inline-block"
                    style={{ background: statusActive ? '#5DBB8A' : GOLD }} />
                  {meta.status}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-4 pt-3 border-b flex-shrink-0" style={{ borderColor: BORDER }}>
            {(['profile', 'settings'] as const).map(t => {
              const active = tab === t;
              return (
                <button key={t} onClick={() => setTab(t)}
                  className="px-4 py-2 text-sm font-medium capitalize transition-all"
                  style={{ color: active ? NAVY : '#8A9098', borderBottom: `2px solid ${active ? GOLD : 'transparent'}`, marginBottom: -1 }}>
                  {t}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {tab === 'profile' ? (
              <div className="p-4 ui-stagger space-y-1">
                <Row icon="◎" label="Full Name" value={meta.profileName} />
                <Row icon="⌗" label="Officer ID" value={meta.officerId} />
                <Row icon="⛨" label="Role" value={meta.label} />
                <Row icon="🏛" label="Department" value={meta.department} />
                <Row icon="⌖" label="Assigned District / Region" value={meta.region} />
                <Row icon="☎" label="Contact" value={meta.phone} />
                <Row icon="✉" label="Email" value={meta.email} />
                <Row icon="◷" label="Last Login" value={meta.lastLogin} />
                <div className="flex items-start gap-3 px-4 py-2.5 rounded-lg transition-colors hover:bg-black/[0.03]">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: SURFACE_2, color: TEAL }}>⊕</span>
                  <div className="min-w-0">
                    <div className="text-xs" style={{ color: '#8A9098' }}>Account Status</div>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium"
                      style={{ color: statusActive ? '#2D6B4F' : '#D7A73A' }}>
                      <span className="w-1.5 h-1.5 rounded-full inline-block"
                        style={{ background: statusActive ? '#5DBB8A' : GOLD }} />
                      {meta.status}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-2 ui-stagger">
                {SETTINGS_SECTIONS.map(s => (
                  <SectionCard key={s.key}>
                    <SectionHeader icon={s.icon} title={s.title} expanded={expanded === s.key} onToggle={() => toggle(s.key)} />
                    {expanded === s.key && (
                      <div className="transition-all">
                        {s.content}
                      </div>
                    )}
                  </SectionCard>
                ))}
              </div>
            )}
          </div>

          {/* Footer — Logout */}
          <div className="p-4 border-t flex-shrink-0" style={{ borderColor: BORDER }}>
            <button onClick={() => setLogoutDialog(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all hover:-translate-y-0.5"
              style={{ background: 'rgba(190,36,36,0.08)', color: '#BE2424', border: '1px solid rgba(190,36,36,0.35)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(190,36,36,0.15)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(190,36,36,0.08)')}>
              <span>→</span> Logout
            </button>
          </div>
        </div>
      </div>

      {logoutDialog && (
        <LogoutDialog onCancel={() => setLogoutDialog(false)} onConfirm={handleLogout} />
      )}
    </>
  );
}
