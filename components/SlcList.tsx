'use client';

import { useState } from 'react';
import { Search, Filter, BookOpen, Layers } from 'lucide-react';

const SECTIONS = ['All', 'M', 'Y', 'A', 'S', 'N', 'R', 'F'];

interface SlcRecord {
    id: number;
    name: string;
    father_name: string;
    class_level: string;
    section: string;
    gender: string;
    date_issued: string;
    created_at: string;
}

export default function SlcList({ initialSlcs }: { initialSlcs: SlcRecord[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [classFilter, setClassFilter] = useState('All');
    const [sectionFilter, setSectionFilter] = useState('All');

    const filteredSlcs = initialSlcs.filter(slc => {
        const matchesSearch = 
            slc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (slc.father_name && slc.father_name.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesClass = classFilter === 'All' || slc.class_level === classFilter;
        const matchesSection = sectionFilter === 'All' || slc.section === sectionFilter;
        return matchesSearch && matchesClass && matchesSection;
    });

    const classes = ['All', ...Array.from(new Set(initialSlcs.map(s => s.class_level)))];

    const inputStyle = { paddingLeft: '2.5rem' };

    return (
        <div 
            className="rounded-2xl overflow-hidden shadow-sm flex flex-col flex-1 min-h-0"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
            {/* Filters */}
            <div 
                className="p-4 border-b flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-surface-2)' }}
            >
                <div>
                    <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                        Issued SLC Records <span className="font-normal text-xs ml-1" style={{ color: 'var(--text-muted)' }}>({filteredSlcs.length})</span>
                    </h3>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 z-10" style={{ color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search by name..."
                            className="st-input py-2 text-sm w-full sm:w-60 relative z-0"
                            style={inputStyle}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Class Filter */}
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 z-10" style={{ color: 'var(--text-muted)' }} />
                            <select 
                                className="st-input py-2 text-sm min-w-[120px] relative z-0"
                                style={inputStyle}
                                value={classFilter}
                                onChange={(e) => setClassFilter(e.target.value)}
                            >
                                {classes.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Section Filter */}
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Layers size={14} className="absolute left-3 top-1/2 -translate-y-1/2 z-10" style={{ color: 'var(--text-muted)' }} />
                            <select 
                                className="st-input py-2 text-sm min-w-[120px] relative z-0"
                                style={inputStyle}
                                value={sectionFilter}
                                onChange={(e) => setSectionFilter(e.target.value)}
                            >
                                {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0 text-sm">
                <table className="w-full st-table">
                    <thead className="sticky top-0 z-10" style={{ background: 'var(--bg-surface-2)' }}>
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Student</th>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Father's Name</th>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Class</th>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Section</th>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Gender</th>
                            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>SLC Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                        {filteredSlcs.length > 0 ? (
                            filteredSlcs.map((slc) => (
                                <tr key={slc.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                                                {slc.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{slc.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-urdu" style={{ color: 'var(--text-secondary)' }}>
                                        {slc.father_name || <span className="opacity-30">—</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-xs px-2 py-1 rounded-md font-medium" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                                            {slc.class_level}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                                        {slc.section ? slc.section : <span className="opacity-30">—</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={slc.gender === 'Male' ? 'text-blue-500' : 'text-pink-500'}>
                                            {slc.gender}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium" style={{ color: 'var(--text-primary)' }}>
                                        {new Date(slc.date_issued).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center" style={{ color: 'var(--text-muted)' }}>
                                    No SLC records found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
