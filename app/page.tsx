'use client';

import { startTest } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function Home() {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await startTest(accessCode);

    if (res.success && res.sessionId) {
      router.push(`/test/${res.sessionId}`);
    } else {
      setError(res.error || 'Failed to start test');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-page)' }}>

      {/* ── Left Brand Panel ──────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[42%] p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)' }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
        
        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center text-white font-black text-lg border border-white/30 backdrop-blur-sm">
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
            Secure · Timed · Computerized
          </div>
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.15]">
            Mardan<br />
            <span className="text-blue-200">Youth's</span><br />
            Academy
          </h1>
          <p className="text-blue-100 text-base leading-relaxed max-w-xs">
            Enter your access code to begin your timed entry test. 
            You will have <strong className="text-white">30 minutes</strong> to complete all questions.
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-blue-200/60 text-xs">
            © {new Date().getFullYear()} Mardan Youth's Academy. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Right Form Panel ──────────────────────────────── */}
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

        {/* Center form */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-sm">
            
            {/* Heading */}
            <div className="mb-8">
              <h2 className="text-3xl font-black mb-1.5" style={{ color: 'var(--text-primary)' }}>
                Begin Your Test
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Enter the 6-digit access code provided to you by the examiner.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-semibold mb-1.5"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Access Code
                </label>
                <input
                  type="text"
                  id="code"
                  required
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  className="st-input text-center text-3xl tracking-[0.35em] font-mono uppercase"
                  placeholder="– – – – – –"
                  maxLength={6}
                  autoComplete="off"
                  autoFocus
                />
              </div>

              {error && (
                <div
                  className="p-3 text-sm rounded-lg flex items-center gap-2"
                  style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)' }}
                >
                  <ShieldCheck size={15} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || accessCode.length < 6}
                className="st-btn-primary w-full py-3 text-base"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Starting Test...</>
                ) : (
                  <>Start Test <ArrowRight size={18} /></>
                )}
              </button>
            </form>

            <p className="text-center text-xs mt-8" style={{ color: 'var(--text-muted)' }}>
              Having trouble? Contact your exam coordinator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
