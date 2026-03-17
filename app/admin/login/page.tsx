'use client';

import { login } from '@/lib/actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, Eye, EyeOff, Loader2, ShieldCheck, BookOpen } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function LoginPage() {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError('');
        const res = await login(formData);
        if (res.success) {
            router.push('/admin');
        } else {
            setError(res.error || 'Login failed');
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--bg-page)' }}>

            {/* ── Left Brand Panel ──────────────────────────── */}
            <div
                className="hidden lg:flex flex-col justify-between w-[42%] p-12 relative overflow-hidden"
                style={{ background: 'linear-gradient(145deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)' }}
            >
                {/* Background dot pattern */}
                <div className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}
                />

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center text-white font-black text-lg border border-white/30">
                        ST
                    </div>
                    <div>
                        <p className="text-white font-black text-lg leading-none">SnapTest</p>
                        <p className="text-blue-200 text-xs font-medium mt-0.5">Entry Examination System</p>
                    </div>
                </div>

                {/* Center content */}
                <div className="relative z-10 space-y-6">
                    <div className="inline-flex items-center gap-2 bg-white/15 border border-white/30 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                        <ShieldCheck size={13} />
                        Admin Control Panel
                    </div>
                    <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.15]">
                        Mardan<br />
                        <span className="text-blue-200">Youth's</span><br />
                        Academy
                    </h1>
                    <p className="text-blue-100 text-base leading-relaxed max-w-xs">
                        Manage questions, students, results and admission decisions from one place.
                    </p>

                    {/* Feature bullets */}
                    <div className="space-y-2.5">
                        {['Question Bank Management', 'Live Test Monitoring', 'Admission Decisions & Reports'].map(f => (
                            <div key={f} className="flex items-center gap-2.5 text-blue-100 text-sm">
                                <div className="w-5 h-5 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                                    <BookOpen size={10} className="text-white" />
                                </div>
                                {f}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10">
                    <p className="text-blue-200/60 text-xs">
                        © {new Date().getFullYear()} Mardan Youth's Academy. All rights reserved.
                    </p>
                </div>
            </div>

            {/* ── Right Form Panel ──────────────────────────── */}
            <div className="flex-1 flex flex-col" style={{ background: 'var(--bg-page)' }}>

                {/* Top bar */}
                <div className="flex justify-between items-center px-6 py-4">
                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm"
                            style={{ background: 'var(--primary)' }}>
                            ST
                        </div>
                        <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>SnapTest</span>
                    </div>
                    <div className="hidden lg:block" />
                    <ThemeToggle />
                </div>

                {/* Centered form */}
                <div className="flex-1 flex items-center justify-center px-6 py-8">
                    <div className="w-full max-w-sm">

                        <div className="mb-8">
                            <h2 className="text-3xl font-black mb-1.5" style={{ color: 'var(--text-primary)' }}>
                                Admin Sign In
                            </h2>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                Enter your credentials to access the dashboard.
                            </p>
                        </div>

                        <form action={handleSubmit} className="space-y-4">

                            {/* Username */}
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                                    Username
                                </label>
                                <div className="relative">
                                    <User
                                        size={16}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                        style={{ color: 'var(--text-muted)', zIndex: 1 }}
                                    />
                                    <input
                                        name="username"
                                        type="text"
                                        required
                                        style={{ paddingLeft: '2.5rem' }}
                                        className="st-input"
                                        placeholder="admin"
                                        autoComplete="username"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock
                                        size={16}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                        style={{ color: 'var(--text-muted)', zIndex: 1 }}
                                    />
                                    <input
                                        name="password"
                                        type={showPass ? 'text' : 'password'}
                                        required
                                        style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
                                        className="st-input"
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(v => !v)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-100 opacity-50"
                                        style={{ color: 'var(--text-muted)' }}
                                        tabIndex={-1}
                                    >
                                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div
                                    className="p-3 text-sm rounded-lg flex items-center gap-2"
                                    style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)' }}
                                >
                                    <ShieldCheck size={14} />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="st-btn-primary w-full py-3 text-sm mt-2"
                            >
                                {loading ? (
                                    <><Loader2 size={16} className="animate-spin" /> Signing in...</>
                                ) : (
                                    'Sign In →'
                                )}
                            </button>
                        </form>

                        <div
                            className="mt-8 pt-5 flex items-center gap-2 text-xs"
                            style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}
                        >
                            <ShieldCheck size={13} />
                            Secured by SnapTest — Mardan Youth's Academy
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
