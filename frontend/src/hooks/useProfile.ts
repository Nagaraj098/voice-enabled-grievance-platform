// import { useState, useEffect, useCallback } from "react";

// export type UserProfile = {
//   id?: string;
//   name?: string;
//   email?: string;
//   phone?: string;
//   organization?: string;
//   role?: string;
//   timezone?: string;
//   avatar_url?: string;
//   created_at?: string;
// };

// const API_BASE = "http://localhost:8000";

// export function useProfile() {
//   const [profile, setProfile] = useState<UserProfile | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const fetchProfile = useCallback(async () => {
//     try {
//       setLoading(true);
//       const res = await fetch(`${API_BASE}/api/auth/me`);
//       if (!res.ok) throw new Error("Failed to fetch profile");
//       const data = await res.json();
//       setProfile(data);
//       localStorage.setItem("grs_user_profile", JSON.stringify(data));
//       setError("");
//     } catch (err: unknown) {
//       setError(err instanceof Error ? err.message : "Failed to load profile");
//       const cached = localStorage.getItem("grs_user_profile");
//       if (cached) {
//         try {
//           setProfile(JSON.parse(cached));
//         } catch {}
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     const cached = localStorage.getItem("grs_user_profile");
//     if (cached) {
//       try {
//         setProfile(JSON.parse(cached));
//         setLoading(false);
//       } catch {}
//     }
//     fetchProfile();
//   }, [fetchProfile]);

//   const updateProfile = (newData: Partial<UserProfile>) => {
//     setProfile(prev => {
//       if (!prev) return null;
//       const updated = { ...prev, ...newData };
//       localStorage.setItem("grs_user_profile", JSON.stringify(updated));
//       return updated;
//     });
//   };

//   const clearProfile = () => {
//     setProfile(null);
//     localStorage.removeItem("grs_user_profile");
//   };

//   return { profile, loading, error, fetchProfile, updateProfile, clearProfile, API_BASE };
// }

"use client";

import { useState, useEffect, useCallback } from "react";

export type UserProfile = {
  id?:           string;
  name?:         string;
  email?:        string;
  phone?:        string;
  organization?: string;
  role?:         string;
  timezone?:     string;
  avatar_url?:   string;
  created_at?:   string;
};

const API_BASE          = "http://localhost:8000";
const PROFILE_CACHE_KEY = "grs_user_profile";

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [saving,  setSaving]  = useState(false);

  // ── Fetch profile from backend ──────────────────────────────
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);

      // ✅ Fixed: matches backend GET /api/user/profile
      const res = await fetch(`${API_BASE}/api/user/profile`);
      if (!res.ok) throw new Error(`Failed to fetch profile: ${res.status}`);

      const data = await res.json();
      setProfile(data);
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(data));
      setError("");

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load profile";
      setError(msg);
      console.warn("⚠️ Profile fetch failed — using cache:", msg);

      // Fall back to cached profile
      const cached = localStorage.getItem(PROFILE_CACHE_KEY);
      if (cached) {
        try { setProfile(JSON.parse(cached)); } catch {}
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Save profile changes to backend ────────────────────────
  const saveProfile = useCallback(async (updates: Partial<UserProfile>) => {
    try {
      setSaving(true);

      // ✅ Fixed: matches backend PATCH /api/user/profile
      const res = await fetch(`${API_BASE}/api/user/profile`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(updates),
      });

      if (!res.ok) throw new Error(`Failed to save profile: ${res.status}`);

      const data = await res.json();

      // Update local state with response from backend
      const updated = data.profile || { ...profile, ...updates };
      setProfile(updated);
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(updated));
      setError("");
      console.log("✅ Profile saved:", updated.name);
      return { ok: true };

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save profile";
      setError(msg);
      console.error("❌ Profile save error:", msg);
      return { ok: false, error: msg };
    } finally {
      setSaving(false);
    }
  }, [profile]);

  // ── Upload avatar ───────────────────────────────────────────
  const uploadAvatar = useCallback(async (file: File) => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("file", file);

      // ✅ matches backend POST /api/user/avatar
      const res = await fetch(`${API_BASE}/api/user/avatar`, {
        method: "POST",
        body:   formData,
      });

      if (!res.ok) throw new Error(`Avatar upload failed: ${res.status}`);

      const data = await res.json();
      if (data.avatar_url) {
        await saveProfile({ avatar_url: data.avatar_url });
      }
      return { ok: true, avatar_url: data.avatar_url };

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Avatar upload failed";
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setSaving(false);
    }
  }, [saveProfile]);

  // ── Delete account ──────────────────────────────────────────
  const deleteAccount = useCallback(async () => {
    try {
      // ✅ matches backend DELETE /api/user/account
      const res = await fetch(`${API_BASE}/api/user/account`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);

      clearProfile();
      return { ok: true };

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      setError(msg);
      return { ok: false, error: msg };
    }
  }, []);

  // ── Local state helpers ─────────────────────────────────────
  const updateProfile = useCallback((newData: Partial<UserProfile>) => {
    setProfile(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...newData };
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearProfile = useCallback(() => {
    setProfile(null);
    localStorage.removeItem(PROFILE_CACHE_KEY);
  }, []);

  // ── Load on mount — cache first, then fetch ─────────────────
  useEffect(() => {
    const cached = localStorage.getItem(PROFILE_CACHE_KEY);
    if (cached) {
      try {
        setProfile(JSON.parse(cached));
        setLoading(false);
      } catch {}
    }
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    saving,
    error,
    fetchProfile,
    saveProfile,
    updateProfile,
    uploadAvatar,
    deleteAccount,
    clearProfile,
    API_BASE,
  };
}