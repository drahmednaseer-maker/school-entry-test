'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, FileText, Settings, LogOut, Menu, X, ChevronRight, BarChart2 } from 'lucide-react';
import { logout } from '@/lib/actions';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import ThemeToggle from './ThemeToggle';

interface AdminLayoutProps {
    children: React.ReactNode;
    settings: any;
    userRole: string | null;
    username: string | null;
}

export default function AdminLayout({ children, settings, userRole, username }: AdminLayoutProps) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/admin/login';
    const [sidebarOpen, setSidebarOpen] = useState(false);

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

    // Get current page label for breadcrumb
    const currentItem = navItems.find(item => item.href === pathname);

    const SidebarContent = () => (
        <div className="flex flex-col h-full" style={{ background: 'linear-gradient(180deg, #1e3a8b 0%, #172554 100%)' }}>
            {/* Brand */}
            <div className="p-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-black text-sm shadow-inner">
                        ST
                    </div>
                    <div className="min-w-0">
                        <p className="text-white font-black tracking-wide text-sm leading-none truncate mb-1">SnapTest</p>
                        <p className="text-xs text-blue-200/80 font-medium truncate">
                            {settings.school_name}
                        </p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={clsx(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-semibold group",
                                isActive
                                    ? "text-white shadow-sm"
                                    : "text-blue-100/70 hover:text-white"
                            )}
                            style={{
                                background: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                                border: isActive ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent',
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255, 255, 255, 0.08)';
                                    (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255, 255, 255, 0.05)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                                    (e.currentTarget as HTMLAnchorElement).style.borderColor = 'transparent';
                                }
                            }}
                        >
                            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="flex-1">{item.label}</span>
                            {isActive && <ChevronRight size={14} className="opacity-60" />}
                        </Link>
                    );
                })}
            </nav>

            {/* User + Logout */}
            <div className="p-4 border-t border-white/10">
                {username && (
                    <div className="px-3 py-2 mb-2 flex items-center gap-3 bg-black/20 rounded-xl border border-white/5">
                        <div className="w-8 h-8 rounded-full bg-blue-500/40 border border-blue-400/50 flex items-center justify-center text-white text-xs font-black shadow-inner">
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate mb-0.5">{username}</p>
                            <p className="text-[10px] uppercase tracking-wider font-semibold text-blue-200/60">{userRole?.replace('_', ' ')}</p>
                        </div>
                    </div>
                )}
                <button
                    onClick={() => logout()}
                    className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl transition-all text-sm font-semibold text-red-300 hover:text-white hover:bg-red-500/20 hover:border-red-500/30 border border-transparent"
                >
                    <LogOut size={18} />
                    <span>Secure Logout</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-page)' }}>
            {/* Desktop Sidebar */}
            <aside className="w-64 hidden md:block shrink-0 shadow-2xl relative z-20">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <aside className="absolute left-0 top-0 bottom-0 w-72 z-50 shadow-2xl">
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header (Mobile Only) */}
                <header
                    className="md:hidden shrink-0 flex items-center justify-between px-4 h-14 border-b"
                    style={{ background: 'var(--header-bg)', borderColor: 'var(--header-border)' }}
                >
                    <div className="flex items-center gap-3">
                        {/* Mobile hamburger */}
                        <button
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: 'var(--text-secondary)' }}
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={20} />
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-hidden flex flex-col min-h-0 p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
