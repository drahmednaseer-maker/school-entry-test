'use client';

import { updateSettings, updateActiveAIProvider, updateGROQConfig, updateGeminiConfig } from '@/lib/actions';
import { useRef, useState, useTransition } from 'react';
import { CheckCircle2, ShieldCheck, Zap, Sparkles, Save, Info } from 'lucide-react';
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
        <div className="space-y-8 h-full">
            {/* 1. Provider Selection Card */}
            <div className="rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-7 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-600 text-white shadow"><Sparkles size={18} /></div>
                        <h2 className="text-lg font-bold text-gray-900">Active AI Provider Strategy</h2>
                    </div>
                </div>
                <div className="p-8 space-y-6">
                    <div className="flex flex-col items-center justify-between gap-8">
                        <div className="w-full">
                            <h4 className="text-sm font-bold text-gray-900 mb-1">Select Engine</h4>
                            <p className="text-sm text-gray-500 font-medium">
                                Choose which artificial intelligence provider will drive the student performance evaluations.
                            </p>
                        </div>
                        <div className="flex bg-gray-100 p-1.5 rounded-xl w-full">
                            <button
                                type="button"
                                onClick={() => setActiveProvider('groq')}
                                className={clsx(
                                    "flex-1 px-4 py-2.5 text-sm font-bold rounded-lg transition-all",
                                    activeProvider === 'groq' ? "bg-white text-blue-600 shadow" : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                GROQ
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveProvider('gemini')}
                                className={clsx(
                                    "flex-1 px-4 py-2.5 text-sm font-bold rounded-lg transition-all",
                                    activeProvider === 'gemini' ? "bg-white text-blue-600 shadow" : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                Gemini
                            </button>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                        <div className="min-h-[20px]">
                            {providerMsg && <span className="text-xs font-bold text-indigo-600 animate-in fade-in">{providerMsg.text}</span>}
                        </div>
                        <button
                            onClick={handleProviderUpdate}
                            disabled={isPending}
                            className="bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-2 active:scale-95"
                        >
                            <CheckCircle2 size={16} />
                            Set Active Engine
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. GROQ Config Card */}
            <form action={handleGroqUpdate} className={clsx(
                "flex flex-col rounded-3xl bg-white shadow-xl transition-all duration-500 border-2",
                activeProvider === 'groq' ? "border-blue-500 ring-8 ring-blue-50/50" : "border-gray-100 grayscale-[0.6] opacity-70"
            )}>
                <div className="p-7 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-600 text-white shadow"><Zap size={18} /></div>
                        <h3 className="text-lg font-bold text-gray-900">GROQ Core Settings</h3>
                    </div>
                    {isGroqConfigured && (
                        <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            Active Credentials
                        </div>
                    )}
                </div>
                
                {isGroqConfigured && <div className="h-1.5 bg-emerald-500 w-full" />}
                
                <div className="p-8 flex-1 flex flex-col justify-between space-y-8">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-2">Secret API Access Token</label>
                        <input
                            name="groq_api_key"
                            type="password"
                            defaultValue={initialSettings.groq_api_key || ''}
                            placeholder="Enter gsk_..."
                            className="w-full rounded-xl border-gray-200 shadow-sm p-3 border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-sm bg-gray-50"
                        />
                    </div>

                    <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                        <div className="min-h-[20px]">
                            {groqMsg && <span className="text-xs font-bold text-emerald-600 animate-in fade-in">{groqMsg.text}</span>}
                        </div>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-2 active:scale-95"
                        >
                            <Save size={16} />
                            Save GROQ Key
                        </button>
                    </div>
                </div>
            </form>

            {/* 3. Gemini Config Card */}
            <form action={handleGeminiUpdate} className={clsx(
                "flex flex-col rounded-3xl bg-white shadow-xl transition-all duration-500 border-2",
                activeProvider === 'gemini' ? "border-blue-500 ring-8 ring-blue-50/50" : "border-gray-100 grayscale-[0.6] opacity-70"
            )}>
                <div className="p-7 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-600 text-white shadow"><Sparkles size={18} /></div>
                        <h3 className="text-lg font-bold text-gray-900">Gemini Core Settings</h3>
                    </div>
                    {isGeminiConfigured && (
                        <div className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-semibold rounded-full border border-orange-100 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                            Active Credentials
                        </div>
                    )}
                </div>
                
                {isGeminiConfigured && <div className="h-1.5 bg-emerald-500 w-full" />}

                <div className="p-8 flex-1 flex flex-col justify-between space-y-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-2">Secret API Access Token</label>
                            <input
                                name="gemini_api_key"
                                type="password"
                                defaultValue={initialSettings.gemini_api_key || ''}
                                placeholder="Enter AIza..."
                                className="w-full rounded-xl border-gray-200 shadow-sm p-3 border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-sm bg-gray-50"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-2">AI Intelligence Tier</label>
                            <select 
                                name="gemini_model" 
                                defaultValue={initialSettings.gemini_model || 'gemini-2.5-flash'}
                                className="w-full rounded-xl border-gray-200 p-3 border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-semibold bg-white cursor-pointer"
                            >
                                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                                <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash-Lite</option>
                                <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash-Lite</option>
                                <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Exp)</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                        <div className="min-h-[20px]">
                            {geminiMsg && <span className="text-xs font-bold text-orange-600 animate-in fade-in">{geminiMsg.text}</span>}
                        </div>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-2 active:scale-95"
                        >
                            <Save size={16} />
                            Save Gemini
                        </button>
                    </div>
                </div>
            </form>
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
        <form action={handleGeneralSubmit} ref={formRef} className="rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden mb-8 col-span-1">
            <div className="p-7 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-600 text-white shadow"><ShieldCheck size={18} /></div>
                    <h2 className="text-lg font-bold text-gray-900">General System Configuration</h2>
                </div>
            </div>
            
            <div className="p-8 space-y-10">
                <div className="space-y-6">
                    {/* School Name */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-2">Institutional Identity</label>
                        <input
                            name="school_name"
                            type="text"
                            defaultValue={initialSettings.school_name}
                            placeholder="Enter School Name"
                            required
                            className="w-full rounded-xl border-gray-200 shadow-sm p-3 border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-base font-semibold"
                        />
                    </div>

                    {/* Question Composition */}
                    <div className="space-y-4">
                        <label className="block text-xs font-semibold text-gray-500">Question Bank Distribution</label>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"/> English</label>
                                <input
                                    name="english_questions"
                                    type="number"
                                    min="0"
                                    value={counts.english}
                                    onChange={(e) => setCounts({ ...counts, english: parseInt(e.target.value) || 0 })}
                                    className="w-full rounded-xl border-gray-200 p-3 border font-bold text-center"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1"><div className="w-1.5 h-1.5 bg-purple-500 rounded-full"/> Urdu</label>
                                <input
                                    name="urdu_questions"
                                    type="number"
                                    min="0"
                                    value={counts.urdu}
                                    onChange={(e) => setCounts({ ...counts, urdu: parseInt(e.target.value) || 0 })}
                                    className="w-full rounded-xl border-gray-200 p-3 border font-bold text-center"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"/> Math</label>
                                <input
                                    name="math_questions"
                                    type="number"
                                    min="0"
                                    value={counts.math}
                                    onChange={(e) => setCounts({ ...counts, math: parseInt(e.target.value) || 0 })}
                                    className="w-full rounded-xl border-gray-200 p-3 border font-bold text-center"
                                />
                            </div>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-xl flex items-center justify-between">
                            <span className="text-xs font-bold text-blue-700 uppercase">Total Questions</span>
                            <span className="text-lg font-black text-blue-900">{totalQuestions}</span>
                        </div>
                    </div>

                    {/* Difficulty Profile */}
                    <div className="space-y-4">
                        <label className="block text-xs font-semibold text-gray-500">Difficulty Gradient (%)</label>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase text-center block">Easy</label>
                                <input
                                    name="easy_percent"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={percents.easy}
                                    onChange={(e) => setPercents({ ...percents, easy: parseInt(e.target.value) || 0 })}
                                    className="w-full rounded-xl border-gray-200 p-3 border font-bold text-center"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase text-center block">Medium</label>
                                <input
                                    name="medium_percent"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={percents.medium}
                                    onChange={(e) => setPercents({ ...percents, medium: parseInt(e.target.value) || 0 })}
                                    className="w-full rounded-xl border-gray-200 p-3 border font-bold text-center"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase text-center block">Hard</label>
                                <input
                                    name="hard_percent"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={percents.hard}
                                    onChange={(e) => setPercents({ ...percents, hard: parseInt(e.target.value) || 0 })}
                                    className="w-full rounded-xl border-gray-200 p-3 border font-bold text-center"
                                />
                            </div>
                        </div>
                        <div className={clsx(
                            "p-3 rounded-xl flex items-center justify-between transition-colors",
                            isPercentValid ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                        )}>
                            <span className="text-xs font-bold uppercase">Target Allocation</span>
                            <span className="text-lg font-black">{totalPercent}% {isPercentValid ? '✓' : '⚠️'}</span>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="rounded-xl bg-gray-50 p-5 border border-gray-100">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                            <ShieldCheck size={14} className="text-gray-400" /> Admin Access Controls
                        </label>
                        <div>
                            <label className="text-xs font-semibold text-gray-600 mb-1 block">Master Security Password</label>
                            <input
                                name="master_password"
                                type="text"
                                defaultValue={initialSettings.master_password || '1234'}
                                className="w-full rounded-xl border-gray-200 p-3 border font-mono text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            <p className="mt-2 text-[10px] text-gray-400 font-medium italic">
                                Required for Staff & Exam roles to authorize record deletions or modifications.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
                    <div>
                        {generalMsg && (
                            <div className={clsx("px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-left-2", generalMsg.type === 'success' ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
                                {generalMsg.type === 'success' ? <CheckCircle2 size={16} /> : <Info size={16} />}
                                {generalMsg.text}
                            </div>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={isPending || !isPercentValid}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 text-sm active:scale-95"
                    >
                        <Save size={18} />
                        Update System
                    </button>
                </div>
            </div>
        </form>
    );
}
