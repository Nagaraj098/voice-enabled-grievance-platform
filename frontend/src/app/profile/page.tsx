"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useTheme } from "@/components/layout/ThemeProvider";
import { useUser, useAuth } from "@clerk/nextjs";
import { useProfile } from "@/hooks/useProfile";
import { useRouter } from "next/navigation";

const Icons = {
  Moon: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  Sun: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  Monitor: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  Lock: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Shield: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Activity: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Refresh: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  Eye: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  EyeOff: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
};

export default function ProfilePage() {
  const { theme, setTheme } = useTheme();
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  
  const { profile, loading: profileLoading, error: profileError, updateProfile, clearProfile, API_BASE } = useProfile();

  // Local Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [org, setOrg] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  
  // Save States
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarToast, setAvatarToast] = useState("");

  // Security States
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", new: "", confirm: "" });
  const [pwErrors, setPwErrors] = useState<{ current?: string, new?: string, confirm?: string }>({});
  const [showPw, setShowPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwMainError, setPwMainError] = useState("");

  const [tfaEnabled, setTfaEnabled] = useState(false);
  const [tfaSecret, setTfaSecret] = useState("");

  // Preferences States
  const [emailNotif, setEmailNotif] = useState(true);
  const [callAlerts, setCallAlerts] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(false);

  // Danger Zone
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const email = profile?.email || user?.primaryEmailAddress?.emailAddress || "user@example.com";

  // Sync profile data to form when loaded
  useEffect(() => {
    if (profile) {
      setName(profile.name || user?.fullName || "");
      setPhone(profile.phone || "");
      setOrg(profile.organization || "");
      setRoleTitle(profile.role || "");
      setTimezone(profile.timezone || "America/New_York");
    }
  }, [profile, user]);

  // Load preferences from local storage
  useEffect(() => {
    const prefs = localStorage.getItem("grs_preferences");
    if (prefs) {
      try {
        const p = JSON.parse(prefs);
        if (p.emailNotifications !== undefined) setEmailNotif(p.emailNotifications);
        if (p.callAlerts !== undefined) setCallAlerts(p.callAlerts);
        if (p.weeklySummary !== undefined) setWeeklySummary(p.weeklySummary);
      } catch (e) {}
    }
  }, []);

  // Save preferences to local storage
  const savePrefs = (updates: Record<string, boolean>) => {
    const p = { emailNotifications: emailNotif, callAlerts, weeklySummary, ...updates };
    localStorage.setItem("grs_preferences", JSON.stringify(p));
  };

  const handleToggleEmail = () => { setEmailNotif(!emailNotif); savePrefs({ emailNotifications: !emailNotif }); };
  const handleToggleCall = () => { setCallAlerts(!callAlerts); savePrefs({ callAlerts: !callAlerts }); };
  const handleToggleWeekly = () => { setWeeklySummary(!weeklySummary); savePrefs({ weeklySummary: !weeklySummary }); };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/user/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, organization: org, role: roleTitle, timezone })
      });
      if (!res.ok) throw new Error("Failed to save profile");
      
      updateProfile({ name, phone, organization: org, role: roleTitle, timezone });
      setProfileMsg({ text: "Profile updated successfully ✓", type: "success" });
      setTimeout(() => setProfileMsg(null), 3000);
    } catch (err) {
      setProfileMsg({ text: "Failed to save changes. Try again.", type: "error" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Instant preview via object URL
    const tempUrl = URL.createObjectURL(file);
    updateProfile({ avatar_url: tempUrl });
    
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch(`${API_BASE}/api/user/avatar`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      if (data.avatar_url) {
        updateProfile({ avatar_url: data.avatar_url });
      }
      setAvatarToast("Avatar updated ✓");
      setTimeout(() => setAvatarToast(""), 3000);
    } catch (err) {
      console.error(err);
      // Let it fail silently on UI for now or show error
    }
  };

  const handleChangePassword = async () => {
    setPwErrors({});
    setPwMainError("");
    setPwSuccess("");
    const errs: Record<string, string> = {};
    if (pwForm.new.length < 8) errs.new = "Password must be at least 8 characters";
    if (pwForm.new !== pwForm.confirm) errs.confirm = "Passwords do not match";
    if (Object.keys(errs).length > 0) {
      setPwErrors(errs);
      return;
    }

    setSavingPw(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.new })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Current password incorrect");
      }
      setPwSuccess("Password changed ✓");
      setPwForm({ current: "", new: "", confirm: "" });
      setTimeout(() => {
        setShowPasswordForm(false);
        setPwSuccess("");
      }, 2000);
    } catch (err: unknown) {
      setPwMainError(err instanceof Error ? err.message : "Current password incorrect");
    } finally {
      setSavingPw(false);
    }
  };

  const handle2FAToggle = async () => {
    try {
      if (!tfaEnabled) {
        const res = await fetch(`${API_BASE}/api/auth/2fa/enable`, { method: "POST" });
        if (!res.ok) throw new Error("Failed to enable 2FA");
        const data = await res.json();
        setTfaSecret(data.secret || "Mock-Secret-Key-For-2FA");
        setTfaEnabled(true);
      } else {
        if (confirm("Are you sure you want to disable Two-Factor Authentication?")) {
          await fetch(`${API_BASE}/api/auth/2fa/disable`, { method: "POST" });
          setTfaEnabled(false);
          setTfaSecret("");
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;
    try {
      await fetch(`${API_BASE}/api/user/account`, { method: "DELETE" });
      clearProfile();
      await signOut();
      router.push("/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      <Sidebar activePage="settings" />
      <div className="flex-1 flex flex-col min-w-0 bg-background relative">
        <Topbar />
        
        {profileError && (
          <div className="bg-red-500/10 border-l-4 border-red-500 p-4 m-4 rounded-r-lg">
            <p className="text-red-500 text-sm font-medium">Failed to load profile. Please refresh.</p>
          </div>
        )}

        <main className="flex-1 overflow-y-auto bg-background rounded-tl-2xl border-l border-t border-border/60 mt-2 ml-2 p-8">
          <div className="max-w-4xl mx-auto pb-12">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-foreground">Profile</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage your account settings and preferences.</p>
            </div>

            {/* Skeleton Loading State */}
            {profileLoading ? (
              <div className="space-y-6">
                <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-6 animate-pulse">
                  <div className="w-20 h-20 bg-muted rounded-full shrink-0"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-muted rounded w-1/4"></div>
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-6 h-64 animate-pulse">
                  <div className="h-5 bg-muted rounded w-1/6 mb-6"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-10 bg-muted rounded w-full"></div>
                    <div className="h-10 bg-muted rounded w-full"></div>
                    <div className="h-10 bg-muted rounded w-full"></div>
                    <div className="h-10 bg-muted rounded w-full"></div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* SECTION 1: Profile Header Card */}
                <div className="bg-card border border-border rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6 mb-6">
                  <div className="relative">
                    <div className="bg-primary text-primary-foreground text-2xl font-bold rounded-full w-20 h-20 flex items-center justify-center overflow-hidden border-2 border-background shadow-md">
                      {profile?.avatar_url || user?.imageUrl ? (
                        <img src={profile?.avatar_url || user?.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        profile?.name?.charAt(0) || user?.firstName?.charAt(0) || "U"
                      )}
                    </div>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-xl font-semibold text-foreground">{profile?.name || user?.fullName || "User Name"}</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">{email}</p>
                    <div className="mt-2 flex items-center justify-center sm:justify-start gap-3">
                      <span className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full font-medium">{profile?.role || "Admin"}</span>
                      <button onClick={() => fileInputRef.current?.click()} className="text-sm text-primary hover:underline transition-all">Edit Avatar</button>
                      <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleAvatarUpload} />
                      {avatarToast && <span className="text-emerald-500 text-xs font-medium">{avatarToast}</span>}
                    </div>
                  </div>
                </div>

                {/* SECTION 2: Personal Information */}
                <div className="bg-card border border-border rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Full Name</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} className="bg-background border border-border rounded-lg px-3 py-2 text-foreground text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Email Address</label>
                      <input type="email" value={email} readOnly className="bg-muted border border-border rounded-lg px-3 py-2 text-muted-foreground text-sm w-full cursor-not-allowed focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Phone Number</label>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="bg-background border border-border rounded-lg px-3 py-2 text-foreground text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Organization</label>
                      <input type="text" value={org} onChange={e => setOrg(e.target.value)} className="bg-background border border-border rounded-lg px-3 py-2 text-foreground text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Role / Title</label>
                      <input type="text" value={roleTitle} onChange={e => setRoleTitle(e.target.value)} className="bg-background border border-border rounded-lg px-3 py-2 text-foreground text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Timezone</label>
                      <select value={timezone} onChange={e => setTimezone(e.target.value)} className="bg-background border border-border rounded-lg px-3 py-2 text-foreground text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none">
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="Europe/London">London (GMT)</option>
                        <option value="Asia/Kolkata">India (IST)</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-end gap-4">
                    {profileMsg && (
                      <span className={`text-sm font-medium ${profileMsg.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {profileMsg.text}
                      </span>
                    )}
                    <button onClick={handleSaveProfile} disabled={savingProfile} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-70 flex items-center gap-2">
                      {savingProfile && <span className="animate-spin"><Icons.Refresh /></span>}
                      Save Changes
                    </button>
                  </div>
                </div>

                {/* SECTION 3: Security */}
                <div className="bg-card border border-border rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Security</h3>
                  <div className="divide-y divide-border">
                    
                    {/* Password */}
                    <div className="py-4 first:pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-lg text-muted-foreground"><Icons.Lock /></div>
                          <div>
                            <p className="text-sm font-medium text-foreground">Change Password</p>
                            <p className="text-xs text-muted-foreground">Update your account password</p>
                          </div>
                        </div>
                        <button onClick={() => setShowPasswordForm(!showPasswordForm)} className="px-4 py-1.5 bg-background border border-border hover:bg-muted text-foreground text-sm rounded-lg transition-colors">
                          {showPasswordForm ? "Cancel" : "Update"}
                        </button>
                      </div>
                      {showPasswordForm && (
                        <div className="mt-4 p-4 bg-background border border-border rounded-lg animate-in fade-in slide-in-from-top-2">
                          <div className="grid gap-3 max-w-sm">
                            <div className="relative">
                              <input type={showPw ? "text" : "password"} value={pwForm.current} onChange={e => setPwForm({...pwForm, current: e.target.value})} placeholder="Current Password" className="bg-background border border-border rounded-lg pl-3 pr-10 py-2 text-foreground text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary" />
                              <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPw ? <Icons.EyeOff /> : <Icons.Eye />}</button>
                            </div>
                            
                            <div>
                              <input type={showPw ? "text" : "password"} value={pwForm.new} onChange={e => setPwForm({...pwForm, new: e.target.value})} placeholder="New Password" className={`bg-background border rounded-lg px-3 py-2 text-foreground text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary ${pwErrors.new ? 'border-red-500' : 'border-border'}`} />
                              {pwErrors.new && <p className="text-red-500 text-xs mt-1">{pwErrors.new}</p>}
                            </div>

                            <div>
                              <input type={showPw ? "text" : "password"} value={pwForm.confirm} onChange={e => setPwForm({...pwForm, confirm: e.target.value})} placeholder="Confirm New Password" className={`bg-background border rounded-lg px-3 py-2 text-foreground text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary ${pwErrors.confirm ? 'border-red-500' : 'border-border'}`} />
                              {pwErrors.confirm && <p className="text-red-500 text-xs mt-1">{pwErrors.confirm}</p>}
                            </div>

                            {pwMainError && <p className="text-red-500 text-xs font-medium">{pwMainError}</p>}
                            {pwSuccess && <p className="text-emerald-500 text-xs font-medium">{pwSuccess}</p>}

                            <button onClick={handleChangePassword} disabled={savingPw} className="mt-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity w-full flex justify-center gap-2">
                              {savingPw && <span className="animate-spin"><Icons.Refresh /></span>}
                              Update Password
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Active Sessions */}
                    <div className="py-4 pb-0 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg text-muted-foreground"><Icons.Activity /></div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Active Sessions</p>
                          <p className="text-xs text-muted-foreground">Manage your active logged-in devices</p>
                        </div>
                      </div>
                      <button className="px-4 py-1.5 bg-background border border-border hover:bg-muted text-foreground text-sm rounded-lg transition-colors">
                        View Sessions
                      </button>
                    </div>

                  </div>
                </div>

                {/* SECTION 4: Preferences */}
                <div className="bg-card border border-border rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Preferences</h3>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-foreground mb-3">Theme</label>
                    <div className="flex flex-wrap items-center gap-3">
                      <button 
                        onClick={() => setTheme("light")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors border ${theme === 'light' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                      >
                        <Icons.Sun /> Light
                      </button>
                      <button 
                        onClick={() => setTheme("dark")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors border ${theme === 'dark' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                      >
                        <Icons.Moon /> Dark
                      </button>
                      <button 
                        onClick={() => setTheme("system")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors border ${theme === 'system' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                      >
                        <Icons.Monitor /> System
                      </button>
                    </div>
                  </div>

                  <div className="mb-6 max-w-xs">
                    <label className="block text-sm font-medium text-foreground mb-2">Language</label>
                    <p className="text-sm text-muted-foreground">English</p>
                  </div>
                </div>

                {/* SECTION 5: Danger Zone */}
                <div className="bg-card border border-red-500/30 rounded-xl p-6 relative overflow-hidden">
                  <h3 className="text-lg font-semibold text-red-500 mb-2">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                  <button onClick={() => setShowDeleteModal(true)} className="border border-red-500 text-red-500 hover:bg-red-500/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Delete Account
                  </button>
                </div>
              </>
            )}

          </div>
        </main>

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95">
              <h3 className="text-xl font-bold text-red-500 mb-2">Are you absolutely sure?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This action cannot be undone. This will permanently delete your account and remove your data from our servers.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Please type <span className="font-bold text-red-500">DELETE</span> to confirm.
                </label>
                <input 
                  type="text" 
                  value={deleteConfirmText} 
                  onChange={e => setDeleteConfirmText(e.target.value)} 
                  className="bg-background border border-border rounded-lg px-3 py-2 text-foreground text-sm w-full focus:outline-none focus:ring-2 focus:ring-red-500" 
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }}
                  className="px-4 py-2 bg-muted text-muted-foreground hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== "DELETE"}
                  className="px-4 py-2 bg-red-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600 rounded-lg text-sm font-medium transition-colors"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
