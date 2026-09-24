/**
 * useAuth — central authentication hook.
 *
 * Manages:
 *  - Session restore on mount (reads localStorage via supabase SDK)
 *  - Auth state change listener (sign-in, sign-out, token refresh)
 *  - Sign-in with email/password (mapped from officer-ID login)
 *  - Sign-up (create account)
 *  - Sign-out
 *  - Profile + role loading after auth
 *
 * The demo officer IDs map to emails:
 *   NER-FO-4471  → a.sangma@ner.gov.in
 *   NER-DO-2210  → r.borah@kamrup.gov.in  (NER-DO-2281 in profiles, 2210 is login id)
 *   NER-CR-0007  → s.khongsdier@ner.gov.in
 */

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import type { Profile, UserRoleEnum } from "./database.types";
import type { Role } from "../components/LoginScreen";

// Map the demo officer IDs used in the UI to real Supabase emails.
// In production every user has a real email; this mapping only matters for demo mode.
const OFFICER_ID_TO_EMAIL: Record<string, string> = {
  "NER-FO-4471": "a.sangma@ner.gov.in",
  "NER-DO-2210": "r.borah@kamrup.gov.in",
  "NER-CR-0007": "s.khongsdier@ner.gov.in",
};

// Map Supabase DB role → React app Role type
function dbRoleToAppRole(r: UserRoleEnum): Role {
  if (r === "field_officer") return "field";
  if (r === "district_officer") return "district";
  return "control";
}

/**
 * Resolve an officer ID or email string to a Supabase auth email.
 * Officer IDs are looked up in the mapping table; bare emails pass through.
 */
function resolveEmail(officerIdOrEmail: string): string {
  const trimmed = officerIdOrEmail.trim();
  return OFFICER_ID_TO_EMAIL[trimmed] ?? trimmed;
}

export interface AuthState {
  /** True while the initial session check is in flight. */
  loading: boolean;
  user: User | null;
  profile: Profile | null;
  role: Role | null;
  district: string | null;
  /** Error message from the last auth operation, if any. */
  error: string | null;
}

export interface AuthActions {
  signIn: (officerIdOrEmail: string, password: string) => Promise<void>;
  signUp: (
    officerIdOrEmail: string,
    password: string,
    fullName: string,
    district: string,
    role: Role,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (input: {
    fullName: string;
    phone: string;
    email: string;
    department: string;
    region: string;
    avatarUrl: string | null;
    role: Role;
    district: string;
  }) => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): AuthState & AuthActions {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [district, setDistrict] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Load profile + role from DB after auth ──────────────────────────────
  async function loadProfileAndRole(uid: string) {
    const [profileRes, roleRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).single(),
      supabase.from("user_roles").select("role, district_id").eq("user_id", uid).eq("is_active", true).single(),
    ]);

    if (profileRes.data) setProfile(profileRes.data);
    if (roleRes.data) {
      setRole(dbRoleToAppRole(roleRes.data.role));
      if (roleRes.data.district_id) {
        const { data: location } = await supabase
          .from("locations")
          .select("name, district, state")
          .eq("id", roleRes.data.district_id)
          .single();
        setDistrict(location?.name ?? location?.district ?? location?.state ?? null);
      } else {
        setDistrict(null);
      }
    }
  }

  // ── Session restore on mount ────────────────────────────────────────────
  useEffect(() => {
    // getSession() reads from localStorage synchronously via the SDK.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadProfileAndRole(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for subsequent auth changes (sign-in, sign-out, token refresh).
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          await loadProfileAndRole(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setRole(null);
          setDistrict(null);
        }
      },
    );

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sign In ─────────────────────────────────────────────────────────────
  async function signIn(officerIdOrEmail: string, password: string) {
    setError(null);
    setLoading(true);
    try {
      const email = resolveEmail(officerIdOrEmail);
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      // onAuthStateChange will fire and load profile/role.
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign-in failed";
      setError(normaliseAuthError(msg));
    } finally {
      setLoading(false);
    }
  }

  // ── Sign Up ─────────────────────────────────────────────────────────────
  async function signUp(
    officerIdOrEmail: string,
    password: string,
    fullName: string,
    district: string,
    role: Role,
  ) {
    setError(null);
    setLoading(true);
    try {
      const email = resolveEmail(officerIdOrEmail);
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            district,
            requested_role: role === "field" ? "field_officer" : role === "district" ? "district_officer" : "control_room",
          },
        },
      });
      if (authError) throw authError;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign-up failed";
      setError(normaliseAuthError(msg));
      throw err;
    } finally {
      setLoading(false);
    }
  }

  // ── Sign Out ────────────────────────────────────────────────────────────
  async function signOut() {
    await supabase.auth.signOut();
    // onAuthStateChange clears state.
  }

  async function updateProfile(input: {
    fullName: string;
    phone: string;
    email: string;
    department: string;
    region: string;
    avatarUrl: string | null;
    role: Role;
    district: string;
  }) {
    if (!user) throw new Error("You must be signed in to update your profile.");
    setError(null);
    setLoading(true);
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: input.fullName.trim(),
          phone: input.phone.trim() || null,
          department: input.department.trim() || null,
          region: input.region.trim() || null,
          avatar_url: input.avatarUrl,
        })
        .eq("id", user.id);
      if (profileError) throw profileError;

      const { error: emailError } = await supabase.auth.updateUser({ email: input.email.trim() });
      if (emailError) throw emailError;

      let districtId: string | null = null;
      if (input.role !== "control" && input.district.trim()) {
        const { data: location, error: locationError } = await supabase
          .from("locations")
          .select("id")
          .or(`name.eq.${input.district.trim()},district.eq.${input.district.trim()},state.eq.${input.district.trim()}`)
          .limit(1)
          .single();
        if (locationError) throw locationError;
        districtId = location.id;
      }

      const { error: roleError } = await supabase
        .from("user_roles")
        .update({
          role: input.role === "field" ? "field_officer" : input.role === "district" ? "district_officer" : "control_room",
          district_id: districtId,
          is_active: true,
        })
        .eq("user_id", user.id);
      if (roleError) throw roleError;

      await loadProfileAndRole(user.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Profile update failed";
      setError(normaliseAuthError(msg));
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function refreshProfile() {
    if (user) await loadProfileAndRole(user.id);
  }

  return {
    loading,
    user,
    profile,
    role,
    district,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
    clearError: () => setError(null),
  };
}

// ── Human-readable error messages ──────────────────────────────────────────
function normaliseAuthError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login") || m.includes("invalid credentials"))
    return "Invalid credentials. Check your officer ID and password.";
  if (m.includes("email not confirmed"))
    return "Your email address hasn't been verified yet. Check your inbox.";
  if (m.includes("user not found"))
    return "No account found with those credentials.";
  if (m.includes("too many requests") || m.includes("rate limit"))
    return "Too many attempts. Please wait a moment and try again.";
  if (m.includes("network") || m.includes("fetch"))
    return "Network error. Check your connection and try again.";
  return msg;
}
