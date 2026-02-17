'use client';

import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, FileText, Settings, LogOut } from 'lucide-react';
import { logout } from '@/lib/actions';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

interface AdminLayoutProps {
    children: React.ReactNode;
    settings: any;
    userRole: string | null;
    username: string | null;
}

export default function AdminLayout({ children, settings, userRole, username }: AdminLayoutProps) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/admin/login';

    // If staff, and on /admin (dashboard), redirect to /admin/students
    React.useEffect(() => {
        if (userRole === 'staff' && pathname === '/admin') {
            window.location.href = '/admin/students';
        }
    }, [userRole, pathname]);

    const allNavItems = [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'exam_coordinator'] },
        { href: '/admin/questions', label: 'Question Bank', icon: FileText, roles: ['admin'] },
        { href: '/admin/students', label: 'Students & Codes', icon: Users, roles: ['admin', 'exam_coordinator', 'staff'] },
        { href: '/admin/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
    ];

    const navItems = allNavItems.filter(item => userRole && item.roles.includes(userRole));

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md hidden md:flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-xl font-bold text-blue-600 line-clamp-2">{settings.school_name}</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                                    isActive ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t">
                    <button
                        onClick={() => logout()}
                        className="flex items-center space-x-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}
