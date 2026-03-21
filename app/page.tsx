'use client';

import { startTest } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { useState, useRef, useCallback } from 'react';
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

const DIGITS = 6;

export default function Home() {
  const [digits, setDigits] = useState<string[]>(Array(DIGITS).fill(''));
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const accessCode = digits.join('');

  const focusBox = (i: number) => inputRefs.current[i]?.focus();

  const handleChange = useCallback((i: number, val: string) => {
    const ch = val.replace(/\D/g, '').slice(-1).toUpperCase();
    const next = [...digits];
    next[i] = val.replace(/[^0-9]/g, '').slice(-1);
    setDigits(next);
    if (ch && i < DIGITS - 1) focusBox(i + 1);
  }, [digits]);

  const handleKeyDown = useCallback((i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[i]) {
        const next = [...digits]; next[i] = ''; setDigits(next);
      } else if (i > 0) {
        const next = [...digits]; next[i - 1] = ''; setDigits(next);
        focusBox(i - 1);
      }
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && i > 0) {
      focusBox(i - 1);
    } else if (e.key === 'ArrowRight' && i < DIGITS - 1) {
      focusBox(i + 1);
    }
  }, [digits]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, DIGITS);
    if (!pasted) return;
    const next = Array(DIGITS).fill('');
    pasted.split('').forEach((ch, idx) => { next[idx] = ch; });
    setDigits(next);
    focusBox(Math.min(pasted.length, DIGITS - 1));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (accessCode.length < DIGITS) return;
    setError('');
    setLoading(true);

    const res = await startTest(accessCode);

    if (res.success && res.sessionId) {
      router.push(`/test/${res.sessionId}`);
    } else {
      setError(res.error || 'Invalid access code. Please check and try again.');
      setLoading(false);
      setShake(true);
      setDigits(Array(DIGITS).fill(''));
      setTimeout(() => { setShake(false); focusBox(0); }, 600);
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

            <style>{`
              @keyframes shake {
                0%,100%{transform:translateX(0)}
                15%{transform:translateX(-8px)}
                30%{transform:translateX(7px)}
                45%{transform:translateX(-6px)}
                60%{transform:translateX(5px)}
                75%{transform:translateX(-3px)}
                90%{transform:translateX(2px)}
              }
              .otp-shake { animation: shake 0.5s ease; }
              .otp-box:focus { border-color: var(--primary) !important; box-shadow: 0 0 0 3px var(--primary-muted) !important; }
              .otp-grid { display: flex; gap: clamp(4px, 2vw, 12px); justify-content: center; }
              .otp-box {
                width: clamp(38px, 12vw, 56px) !important;
                height: clamp(48px, 14vw, 70px) !important;
                touch-action: manipulation;
              }
            `}</style>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Access Code
                </label>
                {/* OTP digit boxes */}
                <div
                  className={`otp-grid ${shake ? 'otp-shake' : ''}`}
                  onPaste={handlePaste}
                >
                  {digits.map((d, i) => (
                    <input
                      key={i}
                      ref={el => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      autoFocus={i === 0}
                      autoComplete="off"
                      className="otp-box"
                      style={{
                        textAlign: 'center',
                        fontSize: 'clamp(18px, 5vw, 28px)',
                        fontWeight: 800,
                        fontFamily: 'monospace',
                        borderRadius: '14px',
                        border: `2px solid ${d ? 'var(--primary)' : 'var(--border)'}`,
                        background: d ? 'var(--primary-muted)' : 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        transition: 'all 0.15s ease',
                        boxShadow: d ? '0 2px 8px rgba(37,99,235,0.15)' : 'var(--shadow-xs)',
                        caretColor: 'transparent',
                      }}
                      onChange={e => handleChange(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                      onFocus={e => e.target.select()}
                    />
                  ))}
                </div>
                <p className="text-center text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                  Enter each digit · or paste the full code
                </p>
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
                disabled={loading || accessCode.length < DIGITS}
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
