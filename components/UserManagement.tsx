'use client';

import { updatePassword } from '@/lib/actions';
import { useRef, useState, useEffect } from 'react';
import { Users, Lock, ShieldAlert, CheckCircle2, Save, UserCheck, KeyRound } from 'lucide-react';
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
        <div className="st-surface rounded-[2.5rem] shadow-sm overflow-hidden border-none ring-1 ring-slate-200 dark:ring-white/10">
            <div className="st-surface-2 p-8 border-b st-border flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-200 dark:shadow-none"><Users size={22} /></div>
                    <div>
                        <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">Access Control</h2>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5">Credential Orchestration</p>
                    </div>
                </div>
            </div>

            <div className="p-10 space-y-10">
                {/* User Selector */}
                <div className="max-w-md">
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <UserCheck size={14} className="text-blue-500" /> Target Administrative Account
                    </label>
                    <div className="relative group">
                        <select
                            className="st-input !rounded-2xl !p-5 !text-sm font-black !bg-slate-50 dark:!bg-slate-900/40 !border-transparent hover:!border-blue-500/50 focus:!border-blue-500 transition-all cursor-pointer appearance-none"
                            value={selectedUsername}
                            onChange={(e) => setSelectedUsername(e.target.value)}
                        >
                            {users.map(user => (
                                <option key={user.id} value={user.username}>
                                    {user.username} — [{user.role.toUpperCase()}]
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-focus-within:text-blue-500 transition-colors">
                            <Users size={20} />
                        </div>
                    </div>
                </div>

                <form ref={formRef} action={handleSubmit} className="space-y-8">
                    <input type="hidden" name="username" value={selectedUsername} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2 tracking-widest ml-1">
                                <KeyRound size={12} className="text-blue-500" /> New Access Credential
                            </label>
                            <input
                                name="new_password"
                                type="password"
                                required
                                placeholder="••••••••••••"
                                className="st-input !rounded-2xl !p-4 font-mono !text-sm !bg-slate-50 dark:!bg-slate-900/40 !border-transparent focus:!border-blue-500 hover:shadow-md transition-all"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase flex items-center gap-2 tracking-widest ml-1">
                                <ShieldAlert size={12} className="text-blue-500" /> Confirm Security Key
                            </label>
                            <input
                                name="confirm_password"
                                type="password"
                                required
                                placeholder="••••••••••••"
                                className="st-input !rounded-2xl !p-4 font-mono !text-sm !bg-slate-50 dark:!bg-slate-900/40 !border-transparent focus:!border-blue-500 hover:shadow-md transition-all"
                            />
                        </div>
                    </div>

                    <div className="pt-8 border-t st-border flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="min-h-[40px]">
                            {message && (
                                <div className={clsx(
                                    "px-5 py-3 rounded-2xl text-sm font-black flex items-center gap-3 animate-in fade-in slide-in-from-left-4 shadow-sm",
                                    message.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                                )}>
                                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <ShieldAlert size={18} />}
                                    {message.text}
                                </div>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="st-btn-primary !px-10 !py-4 !rounded-2xl !text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-300 dark:shadow-none active:scale-95 transition-all w-full md:w-auto"
                        >
                            <Save size={20} />
                            Commit Credentials
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
