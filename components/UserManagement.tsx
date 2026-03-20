'use client';

import { updatePassword } from '@/lib/actions';
import { useRef, useState, useEffect } from 'react';
import { Users, Lock, ShieldAlert, CheckCircle2, Save } from 'lucide-react';
import clsx from 'clsx';

interface User {
    id: number;
    username: string;
    role: string;
}

interface UserManagementProps {
    users: User[];
    currentUsername: string | null;
}

export default function UserManagement({ users, currentUsername }: UserManagementProps) {
    const formRef = useRef<HTMLFormElement>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [selectedUsername, setSelectedUsername] = useState<string>(currentUsername || (users.length > 0 ? users[0].username : ''));

    useEffect(() => {
        if (currentUsername && !selectedUsername) setSelectedUsername(currentUsername);
    }, [currentUsername, selectedUsername]);

    async function handleSubmit(formData: FormData) {
        setMessage(null);
        if (!formData.has('username') && selectedUsername) {
            formData.append('username', selectedUsername);
        }

        const res = await updatePassword(null, formData);

        if (res.success) {
            setMessage({ type: 'success', text: res.success });
            formRef.current?.reset();
            setTimeout(() => setMessage(null), 3000);
        } else if (res.error) {
            setMessage({ type: 'error', text: res.error as string });
        }
    }

    return (
        <div className="st-surface rounded-2xl shadow-sm overflow-hidden">
            <div className="st-surface-2 p-7 border-b st-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-800 text-white shadow-lg shadow-slate-100/10 dark:shadow-none"><Users size={22} /></div>
                    <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase">User Password Management</h2>
                </div>
            </div>

            <div className="p-8 space-y-8">
                {/* User Selector */}
                <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Target Administrative Account</label>
                    <div className="relative group">
                        <select
                            className="st-input !rounded-2xl !p-4 !text-sm font-black"
                            value={selectedUsername}
                            onChange={(e) => setSelectedUsername(e.target.value)}
                        >
                            {users.map(user => (
                                <option key={user.id} value={user.username}>
                                    {user.username} — [{user.role.toUpperCase()}]
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-blue-500 transition-colors">
                            <Users size={18} />
                        </div>
                    </div>
                </div>

                <form ref={formRef} action={handleSubmit} className="space-y-6">
                    <input type="hidden" name="username" value={selectedUsername} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2 mb-2">
                                <Lock size={12} className="text-blue-500" /> New Password
                            </label>
                            <input
                                name="new_password"
                                type="password"
                                required
                                placeholder="••••••••"
                                className="st-input !rounded-xl !p-3 font-mono !text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase flex items-center gap-2 mb-2">
                                <ShieldAlert size={12} className="text-blue-500" /> Re-Enter New Password
                            </label>
                            <input
                                name="confirm_password"
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full rounded-xl border-gray-200 dark:border-slate-700 p-4 border focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-mono text-sm dark:bg-slate-800 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t st-border flex items-center justify-between">
                        <div className="min-h-[20px]">
                            {message && (
                                <div className={clsx(
                                    "px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-left-2",
                                    message.type === 'success' ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                                )}>
                                    {message.type === 'success' ? <CheckCircle2 size={14} /> : <ShieldAlert size={14} />}
                                    {message.text}
                                </div>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="st-btn-primary !px-8 !py-4 !rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl"
                        >
                            <Save size={18} />
                            Update Credentials
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
