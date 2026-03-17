'use client';

import { login } from '@/lib/actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
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
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{ background: 'var(--bg-page)' }}
        >
            {/* Theme toggle */}
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            {/* Card */}
            <div
                className="w-full max-w-md overflow-hidden rounded-2xl shadow-xl"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            >
                {/* Top accent bar */}
                <div
                    className="h-1.5 w-full"
                    style={{ background: 'linear-gradient(90deg, #1e3a8a, #2563eb, #3b82f6)' }}
                />

                <div className="p-8">
                    {/* Logo + heading */}
                    <div className="text-center mb-8">
                        <div
                            className="mx-auto mb-4 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                            style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}
                        >
                            <Lock size={24} className="text-white" strokeWidth={2.5} />
                        </div>
                        <h1
                            className="text-2xl font-black mb-1"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Admin Portal
                        </h1>
                        <p
                            className="text-sm"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            Sign in to manage SnapTest
                        </p>
                    </div>

                    <form action={handleSubmit} className="space-y-4">
                        {/* Username */}
                        <div>
                            <label
                                className="block text-sm font-semibold mb-1.5"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                Username
                            </label>
                            <div className="relative">
                                <User
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2"
                                    style={{ color: 'var(--text-muted)' }}
                                />
                                <input
                                    name="username"
                                    type="text"
                                    required
                                    className="st-input pl-9"
                                    placeholder="admin"
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                className="block text-sm font-semibold mb-1.5"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                Password
                            </label>
                            <div className="relative">
                                <Lock
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2"
                                    style={{ color: 'var(--text-muted)' }}
                                />
                                <input
                                    name="password"
                                    type={showPass ? 'text' : 'password'}
                                    required
                                    className="st-input pl-9 pr-10"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
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
                                style={{
                                    background: 'var(--danger-bg)',
                                    color: 'var(--danger)',
                                    border: '1px solid var(--danger-border)',
                                }}
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
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div
                        className="mt-6 pt-5 flex items-center gap-2 text-xs"
                        style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}
                    >
                        <ShieldCheck size={13} />
                        Secured by SnapTest — Mardan Youth's Academy
                    </div>
                </div>
            </div>
        </div>
    );
}
