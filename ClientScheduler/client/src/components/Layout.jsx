import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    Layout as LayoutIcon, MessageSquare, Calendar as CalendarIcon,
    CheckSquare, BookOpen, Settings, User, Activity, Bot, Menu, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { hapticLight } from '../native';
import NetworkStatus from './NetworkStatus';
import SyncStatus from './SyncStatus';

const luxuryEase = [0.22, 1, 0.36, 1];

/* Sidebar profile helpers */
const ProfileAvatar = ({ size = 'w-9 h-9' }) => {
    const { profile } = useAuth();
    const { theme } = useData();
    const isLight = theme === 'light';
    const getInitials = () => {
        const name = profile?.fullName || profile?.email || 'U';
        const parts = name.split(' ');
        return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
    };
    if (profile?.avatarUrl) {
        return <img src={profile.avatarUrl} alt="" className={`${size} rounded-full object-cover ring-1`} style={{ ringColor: isLight ? 'var(--accent-color)' : 'rgba(242,235,227,0.1)' }} />;
    }
    return (
        <div className={`${size} rounded-full flex items-center justify-center text-xs font-bold ring-1`}
            style={{
                background: `linear-gradient(135deg, var(--accent-color), var(--accent-soft))`,
                color: 'white',
                ringColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(242,235,227,0.1)',
            }}>
            {getInitials()}
        </div>
    );
};

const ProfileName = () => {
    const { profile } = useAuth();
    const name = profile?.fullName || profile?.email || 'User';
    if (name.length > 16) return name.substring(0, 15) + '…';
    return name;
};

/* ═══ NAV ITEMS ═══ */
const navItems = [
    { path: '/dashboard', label: 'Home', icon: LayoutIcon },
    { path: '/habits', label: 'Habits', icon: Activity },
    { path: '/calendar', label: 'Calendar', icon: CalendarIcon },
    { path: '/tasks', label: 'Tasks', icon: CheckSquare },
    { path: '/journal', label: 'Journal', icon: BookOpen },
    { path: '/dost', label: 'Dost Mode', icon: MessageSquare },
];

/* Bottom bar items (subset for mobile) — Settings moved to top-right */
const bottomNavItems = [
    { path: '/dashboard', label: 'Home', icon: LayoutIcon },
    { path: '/habits', label: 'Habits', icon: Activity },
    { path: '/calendar', label: 'Calendar', icon: CalendarIcon },
    { path: '/tasks', label: 'Tasks', icon: CheckSquare },
    { path: '/dost', label: 'Dost', icon: MessageSquare },
];

/* ═══════════════════════════════════════════════════════════════
   DESKTOP SIDEBAR — Hidden on mobile (< md)
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════
   DESKTOP SIDEBAR — Hidden on mobile (< md)
   ═══════════════════════════════════════════════════════════════ */
const DesktopSidebar = () => {
    const location = useLocation();

    return (
        <aside className="hidden md:flex w-20 lg:w-64 h-screen fixed left-0 top-0 z-30 flex-col transition-all duration-400"
            style={{
                background: 'var(--nav-bg)',
                backdropFilter: 'blur(20px)',
                borderRight: '1px solid var(--glass-border)'
            }}>
            <div className="h-20 flex items-center justify-center lg:justify-start lg:px-7 border-b border-[var(--glass-border)]">
                <div className="relative w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--accent-glow)] border border-[var(--accent-glow)] shadow-[0_0_15px_var(--accent-glow)]">
                    <Bot className="w-5 h-5 text-[var(--accent-color)]" />
                    <div className="absolute inset-0 rounded-xl border border-[var(--accent-glow)] animate-pulse opacity-50" />
                </div>
                <div className="hidden lg:block ml-3">
                    <h1 className="font-sans font-bold text-lg tracking-wide text-[var(--text-primary)]">Mithra</h1>
                    <p className="text-[10px] font-medium -mt-0.5 tracking-widest uppercase text-[var(--accent-color)] opacity-60">Life OS</p>
                </div>
            </div>

            <nav className="flex-1 py-5 px-3 space-y-1">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <NavLink key={item.path} to={item.path}
                            className="relative flex items-center p-3 rounded-xl transition-all duration-200 group">
                            {isActive && (<motion.div layoutId="sidebar-tab-pill" className="absolute inset-0 rounded-xl bg-[var(--accent-glow)] border border-[var(--glass-border)]" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />)}
                            {isActive && (<motion.div layoutId="sidebar-active-bar" className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[var(--accent-color)] shadow-[0_0_10px_var(--accent-glow)]" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />)}
                            <item.icon size={20} className={`relative z-10 transition-all duration-300 ${isActive ? 'text-[var(--accent-color)] drop-shadow-[0_0_8px_var(--accent-glow)]' : 'text-[var(--text-dim)] group-hover:text-[var(--text-primary)]'}`} />
                            <span className={`hidden lg:block ml-4 text-sm relative z-10 transition-all duration-300 ${isActive ? 'font-semibold text-[var(--text-primary)]' : 'font-medium text-[var(--text-dim)] group-hover:text-[var(--text-primary)]'}`}>{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>

            <div className="p-3 border-t border-[var(--glass-border)] space-y-1">
                <NavLink to="/settings" className="relative flex items-center p-3 rounded-xl transition-all duration-200 group">
                    <Settings size={20} className="relative z-10 transition-all duration-300 text-[var(--text-dim)] group-hover:text-[var(--text-primary)]" />
                    <span className="hidden lg:block ml-4 text-sm relative z-10 transition-all duration-300 font-medium text-[var(--text-dim)] group-hover:text-[var(--text-primary)]">Settings</span>
                </NavLink>

                <NavLink to="/settings" className="flex items-center p-3 rounded-xl cursor-pointer group hover:bg-[var(--glass-bg-hover)] border border-transparent hover:border-[var(--glass-border)] transition-all">
                    <ProfileAvatar />
                    <div className="hidden lg:block ml-3">
                        <div className="text-sm font-medium transition-colors text-[var(--text-primary)] group-hover:text-[var(--accent-color)]"><ProfileName /></div>
                        <div className="text-[10px] font-medium text-[var(--text-dim)]">Pro Workspace</div>
                    </div>
                </NavLink>
                <div className="hidden lg:flex justify-center pt-1">
                    <SyncStatus />
                </div>
            </div>
        </aside>
    );
};

/* ═══════════════════════════════════════════════════════════════
   MOBILE TOP BAR — Visible only on mobile (< md)
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════
   MOBILE TOP BAR — Visible only on mobile (< md)
   ═══════════════════════════════════════════════════════════════ */
const MobileTopBar = () => {
    const location = useLocation();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const currentPage = [...navItems, { path: '/settings', label: 'Settings' }].find(i => i.path === location.pathname)?.label || 'Mithra';

    return (
        <>
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4"
                style={{
                    paddingTop: 'max(env(safe-area-inset-top, 0px), 8px)',
                    height: 'calc(56px + env(safe-area-inset-top, 0px))',
                    background: 'var(--nav-bg)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid var(--glass-border)'
                }}>
                <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--accent-glow)] border border-[var(--accent-glow)]">
                        <Bot className="w-4 h-4 text-[var(--accent-color)]" />
                    </div>
                    <h1 className="font-bold text-sm tracking-wide text-[var(--text-primary)]">{currentPage}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <NavLink to="/settings" onClick={() => hapticLight()}
                        className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-dim)]">
                        <Settings size={18} />
                    </NavLink>
                    <button onClick={() => { setDrawerOpen(!drawerOpen); hapticLight(); }}
                        className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                        {drawerOpen ? <X size={18} className="text-[var(--text-primary)]" /> : <Menu size={18} className="text-[var(--text-dim)]" />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {drawerOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="md:hidden fixed inset-0 z-50" onClick={() => setDrawerOpen(false)}>
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                            className="absolute right-0 top-0 bottom-0 w-72 p-6 pt-20 space-y-2"
                            style={{
                                background: 'var(--body-bg)',
                                borderLeft: '1px solid var(--glass-border)'
                            }}
                            onClick={e => e.stopPropagation()}>
                            {navItems.map(item => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <NavLink key={item.path} to={item.path}
                                        onClick={() => { setDrawerOpen(false); hapticLight(); }}
                                        className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${isActive ? 'bg-[var(--accent-glow)] border border-[var(--accent-glow)]' : 'hover:bg-[var(--glass-bg-hover)] border border-transparent'}`}>
                                        <item.icon size={20} className={isActive ? 'text-[var(--accent-color)]' : 'text-[var(--text-dim)]'} />
                                        <span className="text-sm font-medium" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-dim)' }}>{item.label}</span>
                                    </NavLink>
                                );
                            })}
                            <div className="pt-4 border-t border-[var(--glass-border)]">
                                <NavLink to="/settings" onClick={() => setDrawerOpen(false)}
                                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--glass-bg-hover)]">
                                    <ProfileAvatar size="w-8 h-8" />
                                    <div>
                                        <div className="text-sm font-medium text-[var(--text-primary)]"><ProfileName /></div>
                                        <div className="text-[10px] text-[var(--text-dim)]">Settings & Profile</div>
                                    </div>
                                </NavLink>
                            </div>

                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

/* ═══════════════════════════════════════════════════════════════
   MOBILE BOTTOM NAV — Android-style bottom navigation
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════
   MOBILE BOTTOM NAV — Android-style bottom navigation
   ═══════════════════════════════════════════════════════════════ */
const MobileBottomNav = () => {
    const location = useLocation();

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40"
            style={{
                paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 4px)',
                background: 'var(--nav-bg)',
                backdropFilter: 'blur(20px)',
                borderTop: '1px solid var(--glass-border)'
            }}>
            <div className="flex items-center justify-around px-2 py-1">
                {bottomNavItems.map(item => {
                    const isActive = location.pathname === item.path;
                    return (
                        <NavLink key={item.path} to={item.path} onClick={() => hapticLight()}
                            className="flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl relative transition-all min-w-[56px]">
                            {isActive && (
                                <motion.div layoutId="bottom-nav-pill"
                                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-[var(--accent-color)] shadow-[0_0_10px_var(--accent-glow)]"
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                            )}
                            <item.icon size={20} className="transition-all" style={{ color: isActive ? 'var(--accent-color)' : 'var(--text-dim)' }} />
                            <span className="text-[11px] font-semibold transition-all" style={{ color: isActive ? 'var(--accent-color)' : 'var(--text-dim)' }}>{item.label}</span>
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
};

/* ═══════════════════════════════════════════════════════════════
   LAYOUT — Responsive: Sidebar on desktop, Bottom bar on mobile
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════
   LAYOUT — Responsive: Sidebar on desktop, Bottom bar on mobile
   ═══════════════════════════════════════════════════════════════ */
export const Layout = ({ children }) => {
    const { theme } = useData();
    const isLight = theme === 'light';

    return (
        <div className="min-h-screen font-sans transition-all duration-400 text-[var(--text-primary)] selection:bg-[var(--selection-bg)] selection:text-[var(--selection-text)]" style={{ backgroundColor: 'var(--body-bg)' }}>
            <NetworkStatus />
            <DesktopSidebar />
            <MobileTopBar />
            <main className="md:ml-20 lg:ml-64 min-h-screen relative overflow-x-hidden pt-14 md:pt-0 pb-20 md:pb-0">
                <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    {/* Theme-aware Ambient Glows */}
                    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[var(--accent-glow)] rounded-full blur-[120px] opacity-40 animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[var(--accent-glow)] rounded-full blur-[120px] opacity-30" />
                    <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[800px] h-[400px] bg-[var(--visor-glow)] rounded-full blur-[150px] opacity-20" />
                </div>
                <div className="relative z-10">
                    {children}
                </div>
            </main>
            <MobileBottomNav />
        </div>
    );
};
