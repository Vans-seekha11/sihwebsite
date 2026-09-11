import type { Role } from '@/roles';

export interface ProfileMeta {
  label: string;
  profileName: string;
  profileInitials: string;
  officerId: string;
  department: string;
  region: string;
  phone: string;
  email: string;
  lastLogin: string;
  status: string;
  avatarUrl?: string;
}

const STORAGE_KEY = 'ner-profile';
const SESSION_KEY = 'ner-session-role';

// Default profiles for each role
const DEFAULT_PROFILES: Record<Role, ProfileMeta> = {
  control: {
    label: 'Control Officer',
    profileName: 'Anjali Rao',
    profileInitials: 'AR',
    officerId: 'NER-CO-0087',
    department: 'Regional Command & Coordination',
    region: 'North Eastern Region (8 States)',
    phone: '+91 98640 12087',
    email: 'anjali.rao@ner.gov.in',
    lastLogin: 'Today, 08:14 AM IST',
    status: 'Active',
  },
  district: {
    label: 'District Officer',
    profileName: 'Dinesh Joshi',
    profileInitials: 'DJ',
    officerId: 'NER-DO-0342',
    department: 'District Disaster & Logistics Management',
    region: 'Kamrup Metro, Assam',
    phone: '+91 94350 20342',
    email: 'dinesh.joshi@assam.gov.in',
    lastLogin: 'Today, 09:02 AM IST',
    status: 'Active',
  },
  field: {
    label: 'Field Officer',
    profileName: 'Ravi Kumar',
    profileInitials: 'RK',
    officerId: 'NER-FO-1024',
    department: 'Field Operations & Incident Response',
    region: 'Dimapur District, Nagaland',
    phone: '+91 88764 51024',
    email: 'ravi.kumar@nagaland.gov.in',
    lastLogin: 'Today, 10:05 AM IST',
    status: 'On Duty',
  },
};

class ProfileService {
  private listeners: Set<(profile: ProfileMeta) => void> = new Set();
  private currentProfile: ProfileMeta | null = null;

  // Get current profile with fallback to default
  getProfile(): ProfileMeta {
    if (this.currentProfile) {
      return this.currentProfile;
    }

    const role = this.getCurrentRole();
    if (!role) {
      console.warn('No current role found, returning default district profile');
      return DEFAULT_PROFILES.district;
    }

    try {
      const savedProfile = this.loadFromStorage();
      if (savedProfile) {
        // Ensure profile matches current role
        const profileRole = this.getRoleFromLabel(savedProfile.label);
        if (profileRole === role) {
          this.currentProfile = savedProfile;
          return savedProfile;
        }
      }

      // Return default profile for current role
      this.currentProfile = { ...DEFAULT_PROFILES[role] };
      return this.currentProfile;
    } catch (error) {
      console.error('Error getting profile:', error);
      // Return safe fallback
      return DEFAULT_PROFILES.district;
    }
  }

  // Update profile and notify all listeners
  async updateProfile(updates: Partial<ProfileMeta>): Promise<{ success: boolean; error?: string }> {
    try {
      const currentProfile = this.getProfile();
      
      // Validate required fields
      if (updates.profileName !== undefined && !updates.profileName.trim()) {
        return { success: false, error: 'Name is required' };
      }
      if (updates.email !== undefined && !updates.email.trim()) {
        return { success: false, error: 'Email is required' };
      }
      if (updates.email !== undefined && !this.isValidEmail(updates.email)) {
        return { success: false, error: 'Invalid email format' };
      }
      if (updates.phone !== undefined && !this.isValidPhone(updates.phone)) {
        return { success: false, error: 'Invalid phone number format' };
      }

      // Handle role change
      if (updates.label && updates.label !== currentProfile.label) {
        const newRole = this.getRoleFromLabel(updates.label);
        if (newRole) {
          this.setSessionRole(newRole);
          // Merge with default profile for new role
          const defaultProfile = DEFAULT_PROFILES[newRole];
          updates = {
            ...defaultProfile,
            ...updates,
            profileInitials: this.generateInitials(updates.profileName || defaultProfile.profileName),
          };
        }
      }

      // Generate initials if name changed
      if (updates.profileName && !updates.profileInitials) {
        updates.profileInitials = this.generateInitials(updates.profileName);
      }

      // Update profile
      const updatedProfile = { ...currentProfile, ...updates };
      this.currentProfile = updatedProfile;
      this.saveToStorage(updatedProfile);
      
      // Notify all listeners
      this.notifyListeners(updatedProfile);
      
      return { success: true };
    } catch (error) {
      console.error('Profile update failed:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  }

  // Subscribe to profile changes
  subscribe(listener: (profile: ProfileMeta) => void): () => void {
    try {
      this.listeners.add(listener);
      // Immediately call with current profile (if already loaded)
      if (this.currentProfile) {
        listener(this.currentProfile);
      } else {
        // Try to get profile, but don't fail subscription if it errors
        try {
          const currentProfile = this.getProfile();
          if (currentProfile) {
            listener(currentProfile);
          }
        } catch (error) {
          console.error('Error getting initial profile for subscription:', error);
        }
      }
      // Return unsubscribe function
      return () => this.listeners.delete(listener);
    } catch (error) {
      console.error('Error in profile subscription:', error);
      return () => {}; // Return no-op function
    }
  }

  // Get current session role
  getCurrentRole(): Role | null {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(SESSION_KEY) as Role | null;
    } catch {
      return null;
    }
  }

  // Set session role
  setSessionRole(role: Role): void {
    if (typeof window === 'undefined') return;
    try {
      if (!role || !['field', 'district', 'control'].includes(role)) {
        console.error('Invalid role provided to setSessionRole:', role);
        return;
      }
      window.localStorage.setItem(SESSION_KEY, role);
      // Reset current profile to force reload with new role
      this.currentProfile = null;
      this.notifyListeners(this.getProfile());
    } catch (error) {
      console.error('Failed to set session role:', error);
    }
  }

  // Clear session
  clearSession(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(SESSION_KEY);
      window.localStorage.removeItem(STORAGE_KEY);
      this.currentProfile = null;
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  // Private methods
  private loadFromStorage(): ProfileMeta | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = window.localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private saveToStorage(profile: ProfileMeta): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  }

  private notifyListeners(profile: ProfileMeta): void {
    this.listeners.forEach(listener => {
      try {
        listener(profile);
      } catch (error) {
        console.error('Profile listener error:', error);
      }
    });
  }

  private getRoleFromLabel(label: string): Role | null {
    const normalized = label.toLowerCase();
    if (normalized.includes('field')) return 'field';
    if (normalized.includes('control')) return 'control';
    if (normalized.includes('district')) return 'district';
    return null;
  }

  private generateInitials(name: string): string {
    return name
      .trim()
      .split(/\s+/)
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    // Allow various phone formats
    const phoneRegex = /^[\d\s\+\-\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }
}

// Export singleton instance
export const profileService = new ProfileService();
