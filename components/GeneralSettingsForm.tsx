'use client';

import { updateSettings, updateActiveAIProvider, updateGROQConfig, updateGeminiConfig } from '@/lib/actions';
import { useRef, useState, useTransition } from 'react';
import { CheckCircle2, ShieldCheck, Zap, Sparkles, Save, Info, School, BookOpen, BarChart3, Lock, Cpu, Globe } from 'lucide-react';
import clsx from 'clsx';

export interface Settings {
    school_name: string;
    easy_percent: number;
    medium_percent: number;
    hard_percent: number;
    english_questions: number;
    urdu_questions: number;
    math_questions: number;
    master_password?: string;
    groq_api_key?: string;
    gemini_api_key?: string;
    active_ai_provider?: string;
    gemini_model?: string;
}

export function AISettingsForm({ initialSettings }: { initialSettings: Settings }) {
    const [isPending, startTransition] = useTransition();
    const [activeProvider, setActiveProvider] = useState(initialSettings.active_ai_provider || 'groq');
    
    // Status and Messages for each section
    const [providerMsg, setProviderMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [groqMsg, setGroqMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [geminiMsg, setGeminiMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Track configured status locally for immediate UI update
    const [isGroqConfigured, setIsGroqConfigured] = useState(!!initialSettings.groq_api_key);
    const [isGeminiConfigured, setIsGeminiConfigured] = useState(!!initialSettings.gemini_api_key);

    async function handleProviderUpdate() {
        setProviderMsg(null);
        startTransition(async () => {
            const res = await updateActiveAIProvider(activeProvider);
            if (res.success) {
                setProviderMsg({ type: 'success', text: res.success });
                setTimeout(() => setProviderMsg(null), 3000);
            } else {
                setProviderMsg({ type: 'error', text: res.error || 'Failed to update' });
            }
        });
    }

    async function handleGroqUpdate(formData: FormData) {
        setGroqMsg(null);
        const apiKey = formData.get('groq_api_key') as string;
        startTransition(async () => {
            const res = await updateGROQConfig(apiKey);
            if (res.success) {
                setGroqMsg({ type: 'success', text: res.success });
                setIsGroqConfigured(!!apiKey);
                setTimeout(() => setGroqMsg(null), 3000);
            } else {
                setGroqMsg({ type: 'error', text: res.error || 'Failed to update' });
            }
        });
    }

    async function handleGeminiUpdate(formData: FormData) {
        setGeminiMsg(null);
        const apiKey = formData.get('gemini_api_key') as string;
        const model = formData.get('gemini_model') as string;
        startTransition(async () => {
            const res = await updateGeminiConfig(apiKey, model);
            if (res.success) {
                setGeminiMsg({ type: 'success', text: res.success });
                setIsGeminiConfigured(!!apiKey);
                setTimeout(() => setGeminiMsg(null), 3000);
            } else {
                setGeminiMsg({ type: 'error', text: res.error || 'Failed to update' });
            }
        });
    }

    return (
        <div className="space-y-6">
            {/* 1. Provider Selection Card */}
            <div className="st-surface rounded-3xl shadow-sm overflow-hidden border-2 border-transparent">
                <div className="p-6 border-b st-border flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none"><Cpu size={20} /></div>
                        <div>
                            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">Intelligence Strategy</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Core AI Orchestration</p>
                        </div>
                    </div>
                </div>
                <div className="p-8 space-y-6">
                    <div className="flex flex-col gap-6">
                        <div className="w-full">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                                Active Inference Engine <Info size={14} className="text-slate-300" />
                            </h4>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                Choose which artificial intelligence provider will drive the student performance evaluations. Switching engines takes effect immediately for all new assessments.
                            </p>
                        </div>
                        <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1.5 border st-border rounded-2xl w-full">
                            {[
                                { id: 'groq', name: 'GROQ (Fastest)', icon: Zap, color: 'text-emerald-600' },
                                { id: 'gemini', name: 'Google Gemini', icon: Sparkles, color: 'text-orange-600' }
                            ].map(p => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => setActiveProvider(p.id)}
                                    className={clsx(
                                        "flex-1 px-4 py-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wider",
                                        activeProvider === p.id 
                                            ? "bg-white dark:bg-slate-800 shadow-xl text-blue-600 border border-slate-200/50" 
                                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    )}
                                >
                                    <p.icon size={14} className={activeProvider === p.id ? p.color : 'opacity-40'} />
                                    {p.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="pt-6 border-t st-border flex items-center justify-between">
                        <div className="min-h-[24px]">
                            {providerMsg && (
                                <div className={clsx("px-3 py-1.5 rounded-lg text-xs font-bold animate-in fade-in slide-in-from-left-2 flex items-center gap-2", 
                                    providerMsg.type === 'success' ? "bg-indigo-50 text-indigo-700" : "bg-red-50 text-red-700")}>
                                    <CheckCircle2 size={14} />
                                    {providerMsg.text}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleProviderUpdate}
                            disabled={isPending}
                            className="st-btn-primary !px-6 !py-3 !rounded-xl !text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-200 dark:shadow-none active:scale-95 transition-transform"
                        >
                            <Globe size={16} />
                            Deploy Intelligence
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 2. GROQ Config Card */}
                <form action={handleGroqUpdate} className={clsx(
                    "st-surface flex flex-col rounded-[2rem] transition-all duration-500 border-2 overflow-hidden",
                    activeProvider === 'groq' ? "border-emerald-500 ring-8 ring-emerald-50/50 dark:ring-emerald-900/10" : "st-border grayscale-[0.4] opacity-80"
                )}>
                    <div className="p-6 border-b st-border flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-lg"><Zap size={18} /></div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">GROQ API Core</h3>
                        </div>
                        {isGroqConfigured && (
                            <div className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-lg border border-emerald-100 flex items-center gap-2 uppercase tracking-tighter">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                Validated
                            </div>
                        )}
                    </div>
                    
                    <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Secret API Key</label>
                            <input
                                name="groq_api_key"
                                type="password"
                                defaultValue={initialSettings.groq_api_key || ''}
                                placeholder="gsk_••••••••••••••••"
                                className="st-input !rounded-xl !p-4 font-mono !text-xs !bg-slate-50 dark:!bg-slate-900/40"
                            />
                        </div>

                        <div className="pt-6 border-t st-border flex items-center justify-between">
                            <div className="min-h-[20px]">
                                {groqMsg && <span className="text-[11px] font-bold text-emerald-600 animate-in fade-in">{groqMsg.text}</span>}
                            </div>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all flex items-center gap-2 active:scale-95"
                            >
                                <Save size={14} />
                                Sync Key
                            </button>
                        </div>
                    </div>
                </form>

                {/* 3. Gemini Config Card */}
                <form action={handleGeminiUpdate} className={clsx(
                    "st-surface flex flex-col rounded-[2rem] transition-all duration-500 border-2 overflow-hidden",
                    activeProvider === 'gemini' ? "border-orange-500 ring-8 ring-orange-50/50 dark:ring-orange-900/10" : "st-border grayscale-[0.4] opacity-80"
                )}>
                    <div className="p-6 border-b st-border flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-orange-600 text-white shadow-lg"><Sparkles size={18} /></div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Gemini API Core</h3>
                        </div>
                        {isGeminiConfigured && (
                            <div className="px-2.5 py-1 bg-orange-50 text-orange-700 text-[10px] font-black rounded-lg border border-orange-100 flex items-center gap-2 uppercase tracking-tighter">
                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                                Validated
                            </div>
                        )}
                    </div>
                    
                    <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Secret API Key</label>
                                <input
                                    name="gemini_api_key"
                                    type="password"
                                    defaultValue={initialSettings.gemini_api_key || ''}
                                    placeholder="AIza••••••••••••••••"
                                    className="st-input !rounded-xl !p-4 font-mono !text-xs !bg-slate-50 dark:!bg-slate-900/40"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Model Intelligence Tier</label>
                                <select 
                                    name="gemini_model" 
                                    defaultValue={initialSettings.gemini_model || 'gemini-2.5-flash'}
                                    className="st-input !rounded-xl !p-4 text-xs font-black !bg-slate-50 dark:!bg-slate-900/40"
                                >
                                    <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash-Lite (Optimized)</option>
                                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                                    <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash-Lite</option>
                                    <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Advanced Path)</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-6 border-t st-border flex items-center justify-between">
                            <div className="min-h-[20px]">
                                {geminiMsg && <span className="text-[11px] font-bold text-orange-600 animate-in fade-in">{geminiMsg.text}</span>}
                            </div>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all flex items-center gap-2 active:scale-95"
                            >
                                <Save size={14} />
                                Sync Key
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function SystemSettingsForm({ initialSettings }: { initialSettings: Settings }) {
    const formRef = useRef<HTMLFormElement>(null);
    const [isPending, startTransition] = useTransition();
    const [percents, setPercents] = useState({
        easy: initialSettings.easy_percent,
        medium: initialSettings.medium_percent,
        hard: initialSettings.hard_percent
    });
    const [counts, setCounts] = useState({
        english: initialSettings.english_questions,
        urdu: initialSettings.urdu_questions,
        math: initialSettings.math_questions
    });

    const [generalMsg, setGeneralMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const totalPercent = percents.easy + percents.medium + percents.hard;
    const isPercentValid = totalPercent === 100;
    const totalQuestions = counts.english + counts.urdu + counts.math;

    async function handleGeneralSubmit(formData: FormData) {
        if (!isPercentValid) {
            setGeneralMsg({ type: 'error', text: 'Percentages must total 100%' });
            return;
        }
        setGeneralMsg(null);
        startTransition(async () => {
            const res = await updateSettings(null, formData);
            if (res.success) {
                setGeneralMsg({ type: 'success', text: res.success });
                setTimeout(() => setGeneralMsg(null), 3000);
            } else {
                setGeneralMsg({ type: 'error', text: res.error as string || 'Failed to update' });
            }
        });
    }

    return (
        <form action={handleGeneralSubmit} ref={formRef} className="st-surface rounded-[2.5rem] shadow-sm overflow-hidden border-none ring-1 ring-slate-200 dark:ring-white/10">
            <div className="p-8 border-b st-border flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-200 dark:shadow-none"><School size={22} /></div>
                    <div>
                        <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase">General Parameters</h2>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mt-1">Identity & Distribution</p>
                    </div>
                </div>
            </div>
            
            <div className="p-10 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        {/* School Name */}
                        <div>
                            <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Institutional Identity</label>
                            <div className="relative group">
                                <input
                                    name="school_name"
                                    type="text"
                                    defaultValue={initialSettings.school_name}
                                    placeholder="Enter School Name"
                                    required
                                    className="st-input !rounded-2xl !p-4 font-black text-lg !bg-slate-50 dark:!bg-slate-900/40 !border-transparent group-hover:!border-blue-500/50 focus:!border-blue-500 group-hover:shadow-lg transition-all"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                                    <Globe size={20} />
                                </div>
                            </div>
                        </div>

                        {/* Security */}
                        <div className="p-6 rounded-[2rem] bg-indigo-50/50 dark:bg-blue-900/10 border border-indigo-100 dark:border-blue-800 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><ShieldCheck size={100} /></div>
                            <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Lock size={12} /> Data Authorization Key
                            </label>
                            <div className="space-y-4 relative z-10">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">Master Administrative Password</label>
                                    <input
                                        name="master_password"
                                        type="text"
                                        defaultValue={initialSettings.master_password || '1234'}
                                        className="st-input !rounded-xl !p-3.5 font-mono !text-sm !bg-white dark:!bg-slate-900 !border-transparent focus:!border-indigo-500 shadow-sm"
                                    />
                                    <p className="mt-3 text-[10px] text-slate-400 font-medium leading-relaxed italic">
                                        This high-level credential is required to authorize critical actions like deleting records or altering score history across all roles.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Question Composition */}
                        <div className="space-y-4">
                            <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center justify-between">
                                Question Bank Payload <BookOpen size={14} className="text-slate-300" />
                            </label>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { name: 'english_questions', label: 'English', color: 'bg-blue-500', value: counts.english, set: (v: number) => setCounts({...counts, english: v}) },
                                    { name: 'urdu_questions', label: 'Urdu', color: 'bg-purple-500', value: counts.urdu, set: (v: number) => setCounts({...counts, urdu: v}) },
                                    { name: 'math_questions', label: 'Math', color: 'bg-emerald-500', value: counts.math, set: (v: number) => setCounts({...counts, math: v}) }
                                ].map(c => (
                                    <div key={c.name} className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5 px-1 truncate">
                                            <div className={clsx("w-1.5 h-1.5 rounded-full", c.color)}/> {c.label}
                                        </label>
                                        <input
                                            name={c.name}
                                            type="number"
                                            min="0"
                                            value={c.value}
                                            onChange={(e) => c.set(parseInt(e.target.value) || 0)}
                                            className="st-input !rounded-2xl !p-4 font-black text-center text-lg !bg-slate-50 dark:!bg-slate-900/40 hover:shadow-md transition-all border-transparent focus:!border-blue-500/50"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-slate-900 rounded-2xl flex items-center justify-between shadow-lg shadow-slate-100 dark:shadow-none">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white"><BarChart3 size={18} /></div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Aggregated Payload</p>
                                        <p className="text-xl font-black text-white leading-none mt-1">TEST LOADOUT</p>
                                    </div>
                                </div>
                                <span className="text-3xl font-black text-white">{totalQuestions} <span className="text-xs text-slate-400 uppercase">items</span></span>
                            </div>
                        </div>

                        {/* Difficulty Profile */}
                        <div className="space-y-4">
                            <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center justify-between">
                                Difficulty Balance Matrix (%) <Zap size={14} className={isPercentValid ? "text-emerald-500" : "text-amber-500"} />
                            </label>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { name: 'easy_percent', label: 'Easy', value: percents.easy, set: (v: number) => setPercents({...percents, easy: v}) },
                                    { name: 'medium_percent', label: 'Medium', value: percents.medium, set: (v: number) => setPercents({...percents, medium: v}) },
                                    { name: 'hard_percent', label: 'Hard', value: percents.hard, set: (v: number) => setPercents({...percents, hard: v}) }
                                ].map(p => (
                                    <div key={p.name} className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase text-center block px-1">{p.label}</label>
                                        <input
                                            name={p.name}
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={p.value}
                                            onChange={(e) => p.set(parseInt(e.target.value) || 0)}
                                            className="st-input !rounded-2xl !p-4 font-black text-center text-lg !bg-slate-50 dark:!bg-slate-900/40 hover:shadow-md transition-all border-transparent focus:!border-blue-500/50"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className={clsx(
                                "p-4 rounded-2xl flex items-center justify-between transition-all",
                                isPercentValid 
                                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100 dark:shadow-none" 
                                    : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/40"
                            )}>
                                <div className="flex items-center gap-3">
                                    <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center", isPercentValid ? "bg-white/20" : "bg-red-100 dark:bg-red-900/40")}>
                                        <CheckCircle2 size={18} />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest leading-none">Matrix Integrity</p>
                                </div>
                                <span className="text-2xl font-black">{totalPercent}% {isPercentValid ? '✓' : '⚠️'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-10 border-t st-border flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="min-h-[40px]">
                        {generalMsg && (
                            <div className={clsx("px-5 py-3 rounded-2xl text-sm font-black flex items-center gap-3 animate-in fade-in slide-in-from-left-4", 
                                generalMsg.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100")}>
                                {generalMsg.type === 'success' ? <CheckCircle2 size={18} /> : <Info size={18} />}
                                {generalMsg.text}
                            </div>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={isPending || !isPercentValid}
                        className="st-btn-primary !px-10 !py-4 !rounded-2xl !text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-300 dark:shadow-none disabled:opacity-50 active:scale-95 transition-all w-full md:w-auto"
                    >
                        <Save size={20} />
                        Update Console
                    </button>
                </div>
            </div>
        </form>
    );
}
