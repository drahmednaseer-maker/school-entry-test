'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { Search, X } from 'lucide-react';

export default function QuestionFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            return params.toString();
        },
        [searchParams]
    );

    const handleFilterChange = (name: string, value: string) => {
        router.push(`?${createQueryString(name, value)}`, { scroll: false });
    };

    const clearFilters = () => {
        router.push('/admin/questions');
    };

    const subjects = ['Math', 'English', 'Urdu'];
    const difficulties = ['Easy', 'Medium', 'Hard'];
    const classes = [
        'PlayGroup', 'KG 1', 'KG 2',
        ...Array.from({ length: 10 }, (_, i) => `Grade ${i + 1}`)
    ];

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search questions..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={searchParams.get('q') || ''}
                    onChange={(e) => handleFilterChange('q', e.target.value)}
                />
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <select
                    className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-white"
                    value={searchParams.get('subject') || ''}
                    onChange={(e) => handleFilterChange('subject', e.target.value)}
                >
                    <option value="">All Subjects</option>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <select
                    className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-white"
                    value={searchParams.get('difficulty') || ''}
                    onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                >
                    <option value="">All Difficulties</option>
                    {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                </select>

                <select
                    className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-white"
                    value={searchParams.get('level') || ''}
                    onChange={(e) => handleFilterChange('level', e.target.value)}
                >
                    <option value="">All Levels</option>
                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                {searchParams.toString() && (
                    <button
                        onClick={clearFilters}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Clear Filters"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>
        </div>
    );
}
