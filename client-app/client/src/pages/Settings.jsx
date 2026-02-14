import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Moon, Sun, Database, LogOut, Calendar, Bell, BellOff, Download,
  ChevronDown, Clock, User, Mail, Phone, MapPin, Globe, Camera,
  Edit3, Check, X, Lock, Shield, AlertCircle, Loader2, Pencil,
  CheckSquare, Activity, Flame, AlertTriangle, Info, Star, ExternalLink, Heart, Linkedin, Instagram
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

/* ═══════ SHARED TOGGLE ═══════ */
const Toggle = ({ label, description, isActive, onToggle }) => (
  <div className="flex items-center justify-between py-4">
    <div>
      <span style={{ color: 'var(--text-primary)' }}>{label}</span>
      {description && <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>{description}</p>}
    </div>
    <button
      onClick={onToggle}
      className="w-12 h-6 rounded-full p-1 transition-colors duration-300"
      style={{ background: isActive ? 'var(--accent-color)' : 'var(--glass-border)' }}
    >
      <div className={`w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isActive ? 'translate-x-6' : 'translate-x-0'}`}
        style={{ backgroundColor: '#fff' }} />
    </button>
  </div>
);

/* ═══════ PROFILE FIELD ═══════ */
const ProfileField = ({ icon: Icon, label, value, name, editing, editValues, onChange, type = 'text', isLast = false }) => (
  <div className={`flex items-center gap-4 py-3.5`}>
    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: 'var(--accent-glow)' }}>
      <Icon size={16} style={{ color: 'var(--accent-color)' }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-medium uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-dim)' }}>{label}</p>
      {editing ? (
        <input
          type={type}
          value={editValues[name] ?? ''}
          onChange={(e) => onChange(name, e.target.value)}
          className="w-full bg-transparent text-sm outline-none border-b-2 py-1 transition-colors"
          style={{ color: 'var(--text-primary)', borderColor: 'var(--accent-color)' }}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      ) : (
        <p className="text-sm truncate" style={{ color: value ? 'var(--text-primary)' : 'var(--text-dim)' }}>
          {value || 'Not set'}
        </p>
      )}
    </div>
  </div>
);

/* ═══════ THEME PREVIEW CIRCLE ═══════ */
const ThemeCircle = ({ palette, isSelected, onClick, isDark }) => {
  const { preview } = palette;
  const size = 72;
  const half = size / 2;
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 group">
      <motion.div
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="rounded-full transition-all duration-300"
        style={{
          width: size, height: size,
          boxShadow: isSelected ? `0 0 0 3px ${isDark ? '#050505' : '#FAF7F4'}, 0 0 0 5px ${preview.top}, 0 0 24px ${preview.top}55` : 'none',
        }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <path d={`M 0 ${half} A ${half} ${half} 0 0 1 ${size} ${half} L ${half} ${half} Z`} fill={preview.top} />
          <path d={`M 0 ${half} A ${half} ${half} 0 0 0 ${half} ${size} L ${half} ${half} Z`} fill={preview.bottomLeft} />
          <path d={`M ${half} ${size} A ${half} ${half} 0 0 0 ${size} ${half} L ${half} ${half} Z`} fill={preview.bottomRight} />
          <circle cx={half} cy={half} r={half - 1} fill="none" stroke={isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'} strokeWidth="1.5" />
          {isSelected && <circle cx={half} cy={half} r={half - 1} fill="none" stroke={preview.top} strokeWidth="2.5" />}
        </svg>
      </motion.div>
      <span className="text-xs font-medium transition-colors"
        style={{ color: isSelected ? 'var(--accent-color)' : 'var(--text-dim)', fontWeight: isSelected ? 700 : 500 }}>
        {palette.name}
      </span>
    </button>
  );
};

/* ═══════ TOGGLE WITH ICON (for notification categories) ═══════ */
const IconToggle = ({ label, description, icon: Icon, isActive, onToggle, disabled = false }) => (
  <div className={`flex items-center justify-between py-4 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
    <div className="flex items-center gap-3 flex-1 min-w-0">
      {Icon && (
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'var(--accent-glow)' }}>
          <Icon size={16} style={{ color: 'var(--accent-color)' }} />
        </div>
      )}
      <div className="min-w-0">
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</span>
        {description && <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>{description}</p>}
      </div>
    </div>
    <button onClick={onToggle}
      className="w-12 h-6 rounded-full p-1 transition-colors duration-300 shrink-0 ml-3"
      style={{ background: isActive ? 'var(--accent-color)' : 'var(--glass-border)' }}>
      <div className={`w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isActive ? 'translate-x-6' : 'translate-x-0'}`}
        style={{ backgroundColor: '#fff' }} />
    </button>
  </div>
);

/* ═══════ REMINDER SLIDER ═══════ */
const SLIDER_STEPS = [
  { value: 0, label: '0' }, { value: 1, label: '1m' }, { value: 5, label: '5m' },
  { value: 10, label: '10m' }, { value: 15, label: '15m' }, { value: 30, label: '30m' },
  { value: 60, label: '1h' }, { value: 120, label: '2h' }, { value: 360, label: '6h' },
  { value: 720, label: '12h' }, { value: 1440, label: '1d' },
];

const formatMinutes = (mins) => {
  if (mins === 0) return 'Off';
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} before`;
  if (mins < 1440) {
    const h = Math.floor(mins / 60), m = mins % 60;
    return m > 0 ? `${h}h ${m}m before` : `${h} hour${h > 1 ? 's' : ''} before`;
  }
  return '1 day before';
};

const ReminderSlider = ({ label, value, onChange }) => {
  const { theme } = useData();
  const isDark = theme === 'dark';
  const stepIndex = useMemo(() => {
    const idx = SLIDER_STEPS.findIndex(s => s.value === value);
    return idx >= 0 ? idx : SLIDER_STEPS.findIndex(s => s.value >= value) || 4;
  }, [value]);
  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</span>
        <span className="text-xs font-semibold px-3 py-1 rounded-full"
          style={{ background: 'var(--accent-glow)', color: 'var(--accent-color)' }}>
          {formatMinutes(value)}
        </span>
      </div>
      <input type="range" min={0} max={SLIDER_STEPS.length - 1} value={stepIndex}
        onChange={(e) => onChange(SLIDER_STEPS[parseInt(e.target.value, 10)].value)}
        className="w-full h-2 rounded-full appearance-none cursor-pointer reminder-slider"
        style={{ background: `linear-gradient(to right, var(--accent-color) ${(stepIndex / (SLIDER_STEPS.length - 1)) * 100}%, ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} ${(stepIndex / (SLIDER_STEPS.length - 1)) * 100}%)` }}
      />
      <div className="flex justify-between mt-2 px-0.5">
        {SLIDER_STEPS.map((s, i) => (
          <span key={s.value} className="text-[9px]"
            style={{ color: i <= stepIndex ? 'var(--accent-color)' : 'var(--text-dim)', fontWeight: i === stepIndex ? 700 : 400 }}>
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
};

/* ═══════ NOTIFICATIONS SECTION ═══════ */
const NotificationsSection = ({ isDarkMode, notificationSettings, updateNotificationSettings, requestNotificationPermission }) => {
  const [expanded, setExpanded] = useState(false);

  const handleEnableNotifications = async () => {
    if (!notificationSettings.enabled) {
      const granted = await requestNotificationPermission();
      if (granted) updateNotificationSettings({ enabled: true });
      else alert('Please allow notifications in your browser settings to enable this feature.');
    } else {
      updateNotificationSettings({ enabled: false });
    }
  };

  return (
    <section className="glass-panel glass-shine rounded-2xl p-6">
      {/* Header with master toggle */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: notificationSettings.enabled ? 'var(--accent-glow)' : (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)') }}>
            {notificationSettings.enabled
              ? <Bell size={20} style={{ color: 'var(--accent-color)' }} />
              : <BellOff size={20} style={{ color: 'var(--text-dim)' }} />}
          </div>
          <div>
            <h2 className="uppercase text-xs font-bold tracking-widest" style={{ color: 'var(--accent-color)' }}>Notifications</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>
              {notificationSettings.enabled ? 'Active — receiving reminders' : 'Disabled'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button onClick={handleEnableNotifications} whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
            style={{
              background: notificationSettings.enabled ? 'rgba(239,68,68,0.08)' : 'var(--accent-glow)',
              color: notificationSettings.enabled ? '#ef4444' : 'var(--accent-color)',
              border: `1px solid ${notificationSettings.enabled ? 'rgba(239,68,68,0.15)' : 'var(--accent-color)'}`,
            }}>
            {notificationSettings.enabled ? 'Disable' : 'Enable'}
          </motion.button>
          <button onClick={() => setExpanded(e => !e)}
            className="p-2 rounded-lg transition-colors" style={{ color: 'var(--text-dim)' }}>
            <ChevronDown size={16} className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Browser permission */}
      {'Notification' in window && (
        <div className="flex items-center gap-2 mt-2 mb-3">
          <Shield size={13} style={{ color: 'var(--text-dim)' }} />
          <span className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
            Browser: <span className="font-semibold" style={{
              color: Notification.permission === 'granted' ? '#22c55e'
                : Notification.permission === 'denied' ? '#ef4444' : 'var(--accent-color)'
            }}>{Notification.permission === 'granted' ? 'Allowed' : Notification.permission === 'denied' ? 'Blocked' : 'Requesting'}</span>
          </span>
        </div>
      )}

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">

            {/* Reminder Timing */}
            <div className={`mt-4 pt-4 transition-opacity ${!notificationSettings.enabled ? 'opacity-40 pointer-events-none' : ''}`}>
              <h3 className="uppercase text-[10px] font-bold tracking-widest mb-1 flex items-center gap-2"
                style={{ color: 'var(--text-dim)' }}>
                <Clock size={12} /> Reminder Timing
              </h3>
              <ReminderSlider label="Tasks"
                value={notificationSettings.taskReminderMinutes || notificationSettings.reminderMinutes}
                onChange={(v) => updateNotificationSettings({ taskReminderMinutes: v, reminderMinutes: v })} />
              <div className="h-px bg-white/5" />
              <ReminderSlider label="Calendar Events"
                value={notificationSettings.eventReminderMinutes || notificationSettings.reminderMinutes}
                onChange={(v) => updateNotificationSettings({ eventReminderMinutes: v })} />
              <div className="h-px bg-white/5" />
              <ReminderSlider label="Habits"
                value={notificationSettings.habitReminderMinutes || 60}
                onChange={(v) => updateNotificationSettings({ habitReminderMinutes: v })} />
            </div>

            {/* Notification Types */}
            <div className={`mt-4 pt-4 transition-opacity ${!notificationSettings.enabled ? 'opacity-40 pointer-events-none' : ''}`}>
              <h3 className="uppercase text-[10px] font-bold tracking-widest mb-2 flex items-center gap-2"
                style={{ color: 'var(--text-dim)' }}>
                <Bell size={12} /> Notification Types
              </h3>
              <IconToggle label="Task Reminders" description="Get notified before tasks are due" icon={CheckSquare}
                isActive={notificationSettings.taskReminders !== false}
                onToggle={() => updateNotificationSettings({ taskReminders: !notificationSettings.taskReminders })} />
              <IconToggle label="Event Reminders" description="Get notified before calendar events start" icon={Calendar}
                isActive={notificationSettings.eventReminders !== false}
                onToggle={() => updateNotificationSettings({ eventReminders: !notificationSettings.eventReminders })} />
              <IconToggle label="Habit Reminders" description="Evening reminder for incomplete daily habits" icon={Activity}
                isActive={notificationSettings.habitReminders !== false}
                onToggle={() => updateNotificationSettings({ habitReminders: !notificationSettings.habitReminders })} />
              <IconToggle label="Streak Loss Alerts" description="Warn when you're about to lose a habit streak" icon={Flame}
                isActive={notificationSettings.streakLossAlerts !== false}
                onToggle={() => updateNotificationSettings({ streakLossAlerts: !notificationSettings.streakLossAlerts })} />
              <IconToggle label="Overdue Task Alerts" description="Notified about tasks past their due date" icon={AlertTriangle}
                isActive={notificationSettings.overdueTaskAlerts !== false}
                onToggle={() => updateNotificationSettings({ overdueTaskAlerts: !notificationSettings.overdueTaskAlerts })} />
            </div>

            {/* Info */}
            <div className="flex items-start gap-2.5 mt-4 p-3 rounded-xl"
              style={{ background: 'var(--glass-bg-hover)' }}>
              <Info size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--text-dim)' }} />
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                Notifications use your browser's built-in system. Make sure browser notifications are allowed for this site.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════ */
export default function Settings() {
  const {
    theme, toggleTheme,
    colorTheme, changeColorTheme, COLOR_THEMES, accentColor,
    notifications, toggleNotifications,
    focusSound, toggleFocusSound,
    notificationSettings, updateNotificationSettings, requestNotificationPermission,
    syncSettings, toggleSyncTasks, toggleSyncHabits, toggleSyncFocus,
    exportData,
  } = useData();

  const { profile, updateProfile, updatePassword, signOut } = useAuth();

  const isDarkMode = theme === 'dark';

  // Profile editing state
  const [editingProfile, setEditingProfile] = useState(false);
  const [editValues, setEditValues] = useState({});
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Password change
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmNewPw, setConfirmNewPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

  // Avatar file input ref
  const avatarInputRef = useRef(null);

  const startEditProfile = () => {
    setEditValues({
      fullName: profile.fullName || '',
      email: profile.email || '',
      phone: profile.phone || '',
      bio: profile.bio || '',
      location: profile.location || '',
    });
    setEditingProfile(true);
    setProfileSaved(false);
  };

  const cancelEditProfile = () => {
    setEditingProfile(false);
    setEditValues({});
  };

  const saveProfile = async () => {
    setProfileSaving(true);
    await new Promise(r => setTimeout(r, 500));
    updateProfile(editValues);
    setEditingProfile(false);
    setProfileSaving(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleEditField = (name, value) => {
    setEditValues(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      updateProfile({ avatarUrl: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError('');
    if (newPw.length < 6) { setPwError('New password must be at least 6 characters'); return; }
    if (newPw !== confirmNewPw) { setPwError('Passwords do not match'); return; }
    setPwLoading(true);
    try {
      await updatePassword(currentPw, newPw);
      setPwSuccess(true);
      setTimeout(() => { setShowPasswordModal(false); setPwSuccess(false); setCurrentPw(''); setNewPw(''); setConfirmNewPw(''); }, 2000);
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwLoading(false);
    }
  };

  const getInitials = () => {
    const name = profile.fullName || profile.email || 'U';
    const parts = name.split(' ');
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
  };

  const memberSince = profile.dateJoined
    ? new Date(profile.dateJoined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  return (
    <div className="p-4 pt-2 md:p-12 max-w-4xl mx-auto pb-28 md:pb-20" style={{ color: 'var(--text-primary)' }}>
      <h1 className="text-2xl md:text-4xl font-light mb-6 md:mb-8">Settings</h1>

      <div className="space-y-8">

        {/* ═══════ PROFILE CARD ═══════ */}
        <section className="glass-panel glass-shine rounded-2xl overflow-hidden">
          {/* Centered Profile Header */}
          <div className="flex flex-col items-center py-10 px-6"
            style={{ background: 'var(--glass-bg-hover)' }}>
            {/* Circular Avatar */}
            <div className="relative group mb-5">
              <div className="w-28 h-28 rounded-full overflow-hidden shadow-xl transition-transform group-hover:scale-105"
                style={{ background: 'var(--glass-bg)' }}>
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" fill={isDarkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)'} />
                      <path d="M4 20c0-3.3 2.7-6 6-6h4c3.3 0 6 2.7 6 6" fill={isDarkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)'} />
                    </svg>
                  </div>
                )}
              </div>
              <button onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg"
                style={{ background: 'var(--accent-color)', color: 'white' }}>
                <Camera size={14} />
              </button>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            {/* Name */}
            <h2 className="text-xl font-bold tracking-wider text-center uppercase"
              style={{ color: 'var(--text-primary)', letterSpacing: '0.08em' }}>
              {profile.fullName || 'YOUR NAME'}
            </h2>
          </div>

          <div className="px-6 pb-6">
            {/* Edit button row */}
            <div className="flex justify-end gap-2 py-4">
              {editingProfile ? (
                <>
                  <motion.button
                    onClick={cancelEditProfile}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
                    style={{ color: 'var(--text-dim)', background: 'var(--glass-bg-hover)' }}>
                    <X size={14} /> Cancel
                  </motion.button>
                  <motion.button
                    onClick={saveProfile}
                    whileTap={{ scale: 0.95 }}
                    disabled={profileSaving}
                    className="px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 text-white disabled:opacity-60"
                    style={{ background: 'var(--accent-color)' }}>
                    {profileSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    Save
                  </motion.button>
                </>
              ) : (
                <motion.button
                  onClick={startEditProfile}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
                  style={{
                    color: 'var(--accent-color)',
                    background: 'var(--glass-bg-hover)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  }}>
                  <Pencil size={14} /> Edit Profile
                </motion.button>
              )}
            </div>

            {/* Saved indicator */}
            <AnimatePresence>
              {profileSaved && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-3 flex items-center gap-2 text-sm font-medium"
                  style={{ color: '#22c55e' }}>
                  <Check size={16} /> Profile saved successfully
                </motion.div>
              )}
            </AnimatePresence>

            {/* Profile Fields */}
            <div>
              <ProfileField icon={User} label="Full Name" value={profile.fullName} name="fullName"
                editing={editingProfile} editValues={editValues} onChange={handleEditField} />
              <ProfileField icon={Mail} label="Email" value={profile.email} name="email" type="email"
                editing={editingProfile} editValues={editValues} onChange={handleEditField} />
              <ProfileField icon={Phone} label="Phone" value={profile.phone} name="phone" type="tel"
                editing={editingProfile} editValues={editValues} onChange={handleEditField} />
              <ProfileField icon={MapPin} label="Location" value={profile.location} name="location"
                editing={editingProfile} editValues={editValues} onChange={handleEditField} />

              {/* Bio field */}
              <div className="flex items-start gap-4 py-3.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'var(--accent-glow)' }}>
                  <Edit3 size={16} style={{ color: 'var(--accent-color)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-dim)' }}>Bio</p>
                  {editingProfile ? (
                    <textarea
                      value={editValues.bio ?? ''}
                      onChange={(e) => handleEditField('bio', e.target.value)}
                      rows={3}
                      className="w-full bg-transparent text-sm outline-none border-b-2 py-1 resize-none transition-colors"
                      style={{ color: 'var(--text-primary)', borderColor: 'var(--accent-color)' }}
                      placeholder="Tell us about yourself"
                    />
                  ) : (
                    <p className="text-sm" style={{ color: profile.bio ? 'var(--text-primary)' : 'var(--text-dim)' }}>
                      {profile.bio || 'Not set'}
                    </p>
                  )}
                </div>
              </div>

              <ProfileField icon={Globe} label="Timezone" value={profile.timezone} name="timezone"
                editing={false} editValues={editValues} onChange={handleEditField} isLast />
            </div>

            {/* Security Actions */}
            <div className="mt-5 flex gap-3">
              <button onClick={() => { setShowPasswordModal(true); setPwError(''); setPwSuccess(false); setCurrentPw(''); setNewPw(''); setConfirmNewPw(''); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  color: 'var(--text-primary)',
                  background: 'var(--glass-bg-hover)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                }}>
                <Lock size={14} style={{ color: 'var(--accent-color)' }} /> Change Password
              </button>
            </div>
          </div>
        </section>

        {/* ═══════ APPEARANCE ═══════ */}
        <section className="glass-panel glass-shine rounded-2xl p-6">
          <h2 className="uppercase text-xs font-bold tracking-widest mb-4" style={{ color: 'var(--accent-color)' }}>Appearance</h2>
          <div className="flex items-center justify-between py-4">
            <span className="flex items-center gap-3">
              {isDarkMode ? <Moon size={20} style={{ color: 'var(--accent-color)' }} /> : <Sun size={20} style={{ color: 'var(--accent-color)' }} />}
              <div>
                <span>Dark Mode</span>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>
                  {isDarkMode ? 'Using dark theme' : 'Using light theme'}
                </p>
              </div>
            </span>
            <button onClick={toggleTheme}
              className="w-14 h-7 rounded-full p-1 transition-colors duration-300"
              style={{ background: isDarkMode ? 'var(--accent-color)' : 'var(--glass-border)' }}>
              <div className="w-5 h-5 rounded-full shadow-md transform transition-transform duration-300"
                style={{ transform: isDarkMode ? 'translateX(28px)' : 'translateX(0)', backgroundColor: isDarkMode ? '#fff' : 'var(--accent-color)' }} />
            </button>
          </div>
        </section>

        {/* ═══════ APP THEME ═══════ */}
        <section className="glass-panel glass-shine rounded-2xl p-6">
          <h2 className="uppercase text-xs font-bold tracking-widest mb-5" style={{ color: 'var(--accent-color)' }}>App Theme</h2>
          <div className="flex flex-wrap gap-6 justify-start">
            {Object.entries(COLOR_THEMES).map(([id, palette]) => (
              <ThemeCircle key={id} palette={palette} isSelected={colorTheme === id}
                onClick={() => changeColorTheme(id)} isDark={isDarkMode} />
            ))}
          </div>
        </section>

        {/* ═══════ NOTIFICATIONS ═══════ */}
        <NotificationsSection isDarkMode={isDarkMode} notificationSettings={notificationSettings} updateNotificationSettings={updateNotificationSettings} requestNotificationPermission={requestNotificationPermission} />

        {/* ═══════ PREFERENCES ═══════ */}
        <section className="glass-panel glass-shine rounded-2xl p-6">
          <h2 className="uppercase text-xs font-bold tracking-widest mb-4" style={{ color: 'var(--accent-color)' }}>Preferences</h2>
          <Toggle label="Daily AI Briefing" description="Get a smart summary of your day every morning" isActive={notifications} onToggle={toggleNotifications} />
          <Toggle label="Focus Mode Sounds" description="Play ambient sounds during focus sessions" isActive={focusSound} onToggle={toggleFocusSound} />
        </section>

        {/* ═══════ SYNC SETTINGS ═══════ */}
        <section className="glass-panel glass-shine rounded-2xl p-6">
          <h2 className="uppercase text-xs font-bold tracking-widest mb-4 flex items-center gap-2" style={{ color: 'var(--accent-color)' }}>
            <Calendar size={14} /> Sync Settings
          </h2>
          <Toggle label="Sync Tasks to Calendar" description="Show tasks with due dates as events on your calendar" isActive={syncSettings.syncTasksToCalendar} onToggle={toggleSyncTasks} />
          <Toggle label="Sync Habits to Calendar" description="Show daily habits as scheduled blocks" isActive={syncSettings.syncHabitsToCalendar} onToggle={toggleSyncHabits} />
          <Toggle label="Sync Focus to Tracker" description="Automatically log focus sessions as habit progress" isActive={syncSettings.syncFocusToTracker} onToggle={toggleSyncFocus} />
        </section>

        {/* ═══════ SUPPORT & ABOUT ═══════ */}
        <section className="glass-panel glass-shine rounded-2xl p-6">
          <h2 className="uppercase text-xs font-bold tracking-widest mb-4" style={{ color: 'var(--accent-color)' }}>Support & About</h2>

          {/* Star on GitHub */}
          <a href="https://github.com/hemasaivattikuti25/Mithra-AI-life-os" target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center justify-between p-4 rounded-lg transition-colors text-left group"
            onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                <Star size={18} className="text-white" fill="white" />
              </div>
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Star us on GitHub</div>
                <div className="text-xs" style={{ color: 'var(--text-dim)' }}>Support the project with a star</div>
              </div>
            </div>
            <ExternalLink size={16} className="opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--accent-color)' }} />
          </a>

          {/* About */}
          <div className="w-full flex items-center justify-between p-4 rounded-lg text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #60a5fa, #3b82f6)' }}>
                <Info size={18} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>About</div>
                <div className="text-xs" style={{ color: 'var(--text-dim)' }}>Mithra AI v1.0.0</div>
              </div>
            </div>
          </div>

          {/* Footer with Social Links */}
          <div className="pt-6 text-center">
            <p className="text-sm flex items-center justify-center gap-1" style={{ color: 'var(--text-dim)' }}>
              Crafted with <Heart size={14} className="text-red-500" fill="#ef4444" /> by
            </p>
            <p className="text-sm font-semibold mt-1" style={{ color: 'var(--accent-color)' }}>
              Hemasai Vattikuti
            </p>

            {/* Social Links */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <a href="https://github.com/hemasaivattikuti25" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                style={{ background: 'var(--glass-bg-hover)' }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={{ color: 'var(--text-primary)' }}>
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/hemsaivattikuti" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                style={{ background: 'linear-gradient(135deg, #0077b5, #00a0dc)' }}>
                <Linkedin size={18} className="text-white" />
              </a>
              <a href="https://www.instagram.com/hemasai_chowdary/" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                style={{ background: 'linear-gradient(135deg, #E4405F, #C13584, #833AB4)' }}>
                <Instagram size={18} className="text-white" />
              </a>
            </div>
          </div>
        </section>

        {/* ═══════ DATA ZONE ═══════ */}
        <section className="glass-panel glass-shine rounded-2xl p-6">
          <h2 className="text-red-500 uppercase text-xs font-bold tracking-widest mb-4">Data Zone</h2>
          <button onClick={exportData}
            className="w-full flex items-center justify-between p-4 rounded-lg transition-colors text-left group"
            onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div className="flex items-center gap-3">
              <Database size={20} style={{ color: 'var(--text-dim)' }} />
              <div>
                <div className="text-sm" style={{ color: 'var(--text-primary)' }}>Export My Data</div>
                <div className="text-xs" style={{ color: 'var(--text-dim)' }}>Download JSON of all journals & tasks</div>
              </div>
            </div>
            <Download size={16} className="opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--accent-color)' }} />
          </button>
          <button onClick={signOut}
            className="w-full flex items-center justify-between p-4 mt-2 rounded-lg transition-colors text-left group"
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div className="flex items-center gap-3">
              <LogOut size={20} className="text-red-500/50" />
              <div className="text-red-500">Log Out</div>
            </div>
          </button>
        </section>
      </div>

      {/* ═══════ CHANGE PASSWORD MODAL ═══════ */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
              style={{
                background: 'var(--body-bg)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                backdropFilter: 'blur(40px)',
              }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Lock size={18} style={{ color: 'var(--accent-color)' }} /> Change Password
                </h3>
                <button onClick={() => setShowPasswordModal(false)} className="p-1.5 rounded-lg transition-colors"
                  style={{ color: 'var(--text-dim)' }}>
                  <X size={18} />
                </button>
              </div>

              {pwSuccess ? (
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                  className="text-center py-8">
                  <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4"
                    style={{ background: 'rgba(34,197,94,0.1)' }}>
                    <Check size={24} className="text-green-400" />
                  </div>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Password Updated</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-dim)' }}>Your password has been changed successfully</p>
                </motion.div>
              ) : (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-dim)' }}>Current Password</label>
                    <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                      style={{
                        background: 'var(--glass-bg-hover)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                        color: 'var(--text-primary)',
                      }} required />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-dim)' }}>New Password</label>
                    <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                      style={{
                        background: 'var(--glass-bg-hover)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                        color: 'var(--text-primary)',
                      }} required minLength={6} />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-dim)' }}>Confirm New Password</label>
                    <input type="password" value={confirmNewPw} onChange={e => setConfirmNewPw(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                      style={{
                        background: 'var(--glass-bg-hover)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                        color: 'var(--text-primary)',
                      }} required minLength={6} />
                  </div>

                  {pwError && (
                    <div className="flex items-center gap-2 text-sm text-red-400">
                      <AlertCircle size={14} /> {pwError}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowPasswordModal(false)}
                      className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors"
                      style={{
                        background: 'var(--glass-bg-hover)',
                        color: 'var(--text-primary)',
                      }}>
                      Cancel
                    </button>
                    <button type="submit" disabled={pwLoading}
                      className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                      style={{ background: 'var(--accent-color)' }}>
                      {pwLoading ? <Loader2 size={14} className="animate-spin" /> : 'Update Password'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
