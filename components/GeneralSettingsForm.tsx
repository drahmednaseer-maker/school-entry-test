'use client';

import { updateSettings } from '@/lib/actions';
import { useRef, useState } from 'react';

interface Settings {
    school_name: string;
    easy_percent: number;
    medium_percent: number;
    hard_percent: number;
    english_questions: number;
    urdu_questions: number;
    math_questions: number;
}

export default function GeneralSettingsForm({ initialSettings }: { initialSettings: Settings }) {
    const formRef = useRef<HTMLFormElement>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
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

    const totalPercent = percents.easy + percents.medium + percents.hard;
    const isPercentValid = totalPercent === 100;
    const totalQuestions = counts.english + counts.urdu + counts.math;

    async function handleSubmit(formData: FormData) {
        if (!isPercentValid) {
            setMessage({ type: 'error', text: 'Percentages must total 100%' });
            return;
        }

        setMessage(null);
        const res = await updateSettings(null, formData);

        if (res.success) {
            setMessage({ type: 'success', text: res.success });
        } else if (res.error) {
            setMessage({ type: 'error', text: res.error as string });
        }
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-md max-w-lg">
            <h3 className="text-xl font-bold mb-4">General Settings</h3>

            <form ref={formRef} action={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">School Name</label>
                    <input
                        name="school_name"
                        type="text"
                        defaultValue={initialSettings.school_name}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Test Composition (Question Counts)</h4>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">English</label>
                            <input
                                name="english_questions"
                                type="number"
                                min="0"
                                value={counts.english}
                                onChange={(e) => setCounts({ ...counts, english: parseInt(e.target.value) || 0 })}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Urdu</label>
                            <input
                                name="urdu_questions"
                                type="number"
                                min="0"
                                value={counts.urdu}
                                onChange={(e) => setCounts({ ...counts, urdu: parseInt(e.target.value) || 0 })}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Math</label>
                            <input
                                name="math_questions"
                                type="number"
                                min="0"
                                value={counts.math}
                                onChange={(e) => setCounts({ ...counts, math: parseInt(e.target.value) || 0 })}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                            />
                        </div>
                    </div>
                    <div className="text-sm font-bold text-blue-600">
                        Total Questions: {totalQuestions}
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Difficulty Distribution (%)</h4>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Easy</label>
                            <input
                                name="easy_percent"
                                type="number"
                                min="0"
                                max="100"
                                value={percents.easy}
                                onChange={(e) => setPercents({ ...percents, easy: parseInt(e.target.value) || 0 })}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Medium</label>
                            <input
                                name="medium_percent"
                                type="number"
                                min="0"
                                max="100"
                                value={percents.medium}
                                onChange={(e) => setPercents({ ...percents, medium: parseInt(e.target.value) || 0 })}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Hard</label>
                            <input
                                name="hard_percent"
                                type="number"
                                min="0"
                                max="100"
                                value={percents.hard}
                                onChange={(e) => setPercents({ ...percents, hard: parseInt(e.target.value) || 0 })}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                            />
                        </div>
                    </div>

                    <div className={clsx(
                        "text-sm font-medium",
                        isPercentValid ? "text-green-600" : "text-red-600"
                    )}>
                        Total: {totalPercent}% {isPercentValid ? '✓' : '(Must be 100%)'}
                    </div>
                </div>

                {message && (
                    <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!isPercentValid}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                >
                    Save Settings
                </button>
            </form>
        </div>
    );
}

function clsx(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
