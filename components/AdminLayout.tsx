'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, FileText, Settings, LogOut, Menu, BarChart2, Moon, Sun } from 'lucide-react';
import { logout } from '@/lib/actions';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import ThemeToggle from './ThemeToggle';
import { useTheme } from './ThemeProvider';

interface AdminLayoutProps {
    children: React.ReactNode;
    settings: any;
    userRole: string | null;
    username: string | null;
}

// Unified User Console Component (Minimal Three-Icon Approach)
function UserConsole({ username, userRole, theme, toggleTheme }: { username: string | null, userRole: string | null, theme: string, toggleTheme: () => void }) {
    if (!username) return null;
    return (
        <div className="px-6 py-8 border-t border-white/5 mt-auto">
            <div className="flex items-center justify-between gap-4">
                {/* 1. Account Status/Indicator */}
                <div 
                    title={`${username} (${userRole})`}
                    className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white text-xs font-black shadow-inner cursor-default transition-all group"
                >
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#1e3a8a] shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    {username.charAt(0).toUpperCase()}
                </div>

                {/* 2. Mode Switcher (Smart Center) */}
                <button
                    onClick={toggleTheme}
                    title={theme === 'dark' ? 'Activate Light Mode' : 'Activate Dark Mode'}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-white/5 hover:bg-white/15 text-blue-200/60 hover:text-white border border-white/5 hover:border-white/10 active:scale-95"
                >
                    {theme === 'dark' ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
                </button>

                {/* 3. Session Security (Right) */}
                <button
                    onClick={() => logout()}
                    title="Terminate Session"
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 hover:border-red-500 shadow-lg shadow-red-900/10 active:scale-95"
                >
                    <LogOut size={18} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
}

export default function AdminLayout({ children, settings, userRole, username }: AdminLayoutProps) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/admin/login';
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { theme, toggle: toggleTheme } = useTheme();

    React.useEffect(() => {
        if (userRole === 'staff' && pathname === '/admin') {
            window.location.href = '/admin/students';
        }
        if (userRole === 'qbank' && pathname === '/admin') {
            window.location.href = '/admin/questions';
        }
    }, [userRole, pathname]);

    const allNavItems = [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'exam_coordinator'] },
        { href: '/admin/questions', label: 'Question Bank', icon: FileText, roles: ['admin', 'qbank'] },
        { href: '/admin/students', label: 'Students & Codes', icon: Users, roles: ['admin', 'exam_coordinator', 'staff'] },
        { href: '/admin/reports', label: 'Reports', icon: BarChart2, roles: ['admin', 'exam_coordinator'] },
        { href: '/admin/slc', label: 'SLC', icon: FileText, roles: ['admin', 'exam_coordinator', 'staff'] },
        { href: '/admin/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
    ];

    const navItems = allNavItems.filter(item => userRole && item.roles.includes(userRole));

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex fixed inset-0 overflow-hidden" style={{ background: 'var(--bg-page)' }}>
            {/* Desktop Sidebar */}
            <aside className="w-64 hidden md:flex flex-col shrink-0 shadow-2xl relative z-20">
                <div className="flex flex-col flex-1 w-full" style={{ background: 'linear-gradient(180deg, #1e3a8b 0%, #172554 100%)' }}>
                    {/* Brand */}
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[1.25rem] bg-white/10 border border-white/20 flex items-center justify-center text-white font-black text-lg shadow-inner">
                                ST
                            </div>
                            <div className="min-w-0">
                                <p className="text-white font-black tracking-widest text-sm leading-none truncate mb-1">SNAPTEST</p>
                                <p className="text-[10px] text-blue-200/60 font-bold uppercase tracking-tighter truncate">
                                    {settings.school_name}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={clsx(
                                        "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-xs font-black uppercase tracking-widest group",
                                        isActive
                                            ? "text-white shadow-lg bg-white/15 border border-white/10"
                                            : "text-blue-200/60 hover:text-white hover:bg-white/5 active:scale-95"
                                    )}
                                >
                                    <Icon size={16} strokeWidth={isActive ? 3 : 2} className={clsx("transition-transform", isActive ? "scale-110" : "group-hover:scale-110")} />
                                    <span className="flex-1">{item.label}</span>
                                    {isActive && <div className="w-1 h-1 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,1)]" />}
                                </Link>
                            );
                        })}
                    </nav>

                    <UserConsole username={username} userRole={userRole} theme={theme} toggleTheme={toggleTheme} />
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <aside className="absolute left-0 top-0 bottom-0 w-72 z-50 shadow-2xl flex flex-col">
                        <div className="flex flex-col flex-1 w-full" style={{ background: 'linear-gradient(180deg, #1e3a8b 0%, #172554 100%)' }}>
                            {/* Brand */}
                            <div className="p-6 border-b border-white/10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-[1.25rem] bg-white/10 border border-white/20 flex items-center justify-center text-white font-black text-lg shadow-inner">
                                        ST
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-white font-black tracking-widest text-sm leading-none truncate mb-1">SNAPTEST</p>
                                        <p className="text-[10px] text-blue-200/60 font-bold uppercase tracking-tighter truncate">
                                            {settings.school_name}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Nav */}
                            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={clsx(
                                                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-xs font-black uppercase tracking-widest group",
                                                isActive
                                                    ? "text-white shadow-lg bg-white/15 border border-white/10"
                                                    : "text-blue-200/60 hover:text-white hover:bg-white/5"
                                            )}
                                        >
                                            <Icon size={16} strokeWidth={isActive ? 3 : 2} />
                                            <span className="flex-1">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>

                            <UserConsole username={username} userRole={userRole} theme={theme} toggleTheme={toggleTheme} />
                        </div>
                    </aside>
                </div>
            )}

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
                {/* Header (Mobile Only) */}
                <header
                    className="md:hidden shrink-0 flex items-center justify-between px-3 h-14 border-b"
                    style={{ background: 'var(--header-bg)', borderColor: 'var(--header-border)' }}
                >
                    <div className="flex items-center gap-2">
                        <button
                            className="flex items-center justify-center rounded-xl transition-colors"
                            style={{ color: 'var(--text-secondary)', minWidth: '44px', minHeight: '44px' }}
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Open navigation"
                        >
                            <Menu size={22} />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-xs" style={{ background: 'linear-gradient(135deg,#1e3a8a,#2563eb)' }}>
                                ST
                            </div>
                            <span className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>SnapTest</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 min-h-0">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
