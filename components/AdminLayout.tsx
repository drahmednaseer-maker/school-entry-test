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
    }, [userRole, pathname]);

    const allNavItems = [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'exam_coordinator'] },
        { href: '/admin/questions', label: 'Question Bank', icon: FileText, roles: ['admin'] },
        { href: '/admin/students', label: 'Students & Codes', icon: Users, roles: ['admin', 'exam_coordinator', 'staff'] },
        { href: '/admin/reports', label: 'Reports', icon: BarChart2, roles: ['admin', 'exam_coordinator'] },
        { href: '/admin/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
    ];

    const navItems = allNavItems.filter(item => userRole && item.roles.includes(userRole));

    if (isLoginPage) {
        return <>{children}</>;
    }

    // Get current page label for breadcrumb
    const currentItem = navItems.find(item => item.href === pathname);

    const SidebarContent = () => (
        <div className="flex flex-col h-full" style={{ background: 'var(--sidebar-bg)' }}>
            {/* Brand */}
            <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-white font-black text-sm">
                        ST
                    </div>
                    <div className="min-w-0">
                        <p className="text-white font-bold text-sm leading-none truncate">SnapTest</p>
                        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--sidebar-text)' }}>
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
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium group",
                                isActive
                                    ? "text-white"
                                    : "hover:text-white"
                            )}
                            style={{
                                background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                                color: isActive ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = 'var(--sidebar-hover-bg)';
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
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
            <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                {username && (
                    <div className="px-3 py-2 mb-1 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-500/25 border border-blue-400/30 flex items-center justify-center text-white text-xs font-bold">
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{username}</p>
                            <p className="text-[10px] capitalize" style={{ color: 'var(--sidebar-text)' }}>{userRole?.replace('_', ' ')}</p>
                        </div>
                    </div>
                )}
                <button
                    onClick={() => logout()}
                    className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg transition-all text-sm font-medium"
                    style={{ color: '#f87171' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.12)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                    <LogOut size={17} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-page)' }}>
            {/* Desktop Sidebar */}
            <aside className="w-60 hidden md:block shrink-0 shadow-xl" style={{ background: 'var(--sidebar-bg)' }}>
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <aside className="absolute left-0 top-0 bottom-0 w-64 z-50 shadow-2xl" style={{ background: 'var(--sidebar-bg)' }}>
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header
                    className="shrink-0 flex items-center justify-between px-4 md:px-6 h-14 border-b"
                    style={{ background: 'var(--header-bg)', borderColor: 'var(--header-border)' }}
                >
                    <div className="flex items-center gap-3">
                        {/* Mobile hamburger */}
                        <button
                            className="md:hidden p-2 rounded-lg transition-colors"
                            style={{ color: 'var(--text-secondary)' }}
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={20} />
                        </button>
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-sm">
                            <span style={{ color: 'var(--text-muted)' }}>Admin</span>
                            {currentItem && (
                                <>
                                    <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                        {currentItem.label}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
