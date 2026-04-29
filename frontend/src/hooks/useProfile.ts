import { useState, useEffect, useCallback } from "react";

export type UserProfile = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  organization?: string;
  role?: string;
  timezone?: string;
  avatar_url?: string;
  created_at?: string;
};

const API_BASE = "http://localhost:8000";

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/auth/me`);
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setProfile(data);
      localStorage.setItem("grs_user_profile", JSON.stringify(data));
      setError("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
      const cached = localStorage.getItem("grs_user_profile");
      if (cached) {
        try {
          setProfile(JSON.parse(cached));
        } catch {}
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = localStorage.getItem("grs_user_profile");
    if (cached) {
      try {
        setProfile(JSON.parse(cached));
        setLoading(false);
      } catch {}
    }
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = (newData: Partial<UserProfile>) => {
    setProfile(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...newData };
      localStorage.setItem("grs_user_profile", JSON.stringify(updated));
      return updated;
    });
  };

  const clearProfile = () => {
    setProfile(null);
    localStorage.removeItem("grs_user_profile");
  };

  return { profile, loading, error, fetchProfile, updateProfile, clearProfile, API_BASE };
}
