'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import RegisterCheckbox from '@/components/RegisterCheckbox';

interface Result {
    id: number;
    name: string;
    father_name: string;
    class_level: string;
    score: number | null;
    created_at: string;
    photo?: string;
    admission_status?: string | null;
    admitted_class?: string | null;
    is_registered: number;
}

export default function ResultsList({ 
    initialResults,
    title = 'Attempted Papers',
    showViewAll = false
}: { 
    initialResults: Result[],
    title?: string,
    showViewAll?: boolean
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [classFilter, setClassFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    const filteredResults = initialResults.filter(result => {
        const matchesSearch =
            result.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            result.father_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = classFilter === 'All' || result.class_level === classFilter;
        return matchesSearch && matchesClass;
    });

    const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedResults = filteredResults.slice(startIndex, startIndex + itemsPerPage);

    const classes = ['All', 'PlayGroup', 'KG 1', 'KG 2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    return (
        <div
            className="rounded-xl overflow-hidden shadow-sm flex flex-col flex-1 min-h-0"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
            {/* Filters */}
            <div
                className="p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-3"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-surface-2)' }}
            >
                <div className="flex items-center gap-3">
                    <h3 className="font-bold text-sm shrink-0" style={{ color: 'var(--text-primary)' }}>
                        {title} <span className="font-normal text-xs ml-1" style={{ color: 'var(--text-muted)' }}>({filteredResults.length})</span>
                    </h3>
                    {showViewAll && (
                        <Link
                            href="/admin/results"
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0"
                            style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}
                        >
                            View All →
                        </Link>
                    )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-3 md:mt-0 w-full md:w-auto justify-end">
                    <div className="relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search student or father..."
                            className="st-input py-2 text-sm w-full sm:w-60"
                            style={{ paddingLeft: '2.25rem' }}
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter size={15} style={{ color: 'var(--text-muted)' }} />
                        <select
                            className="st-input py-2 text-sm"
                            value={classFilter}
                            onChange={(e) => { setClassFilter(e.target.value); setCurrentPage(1); }}
                        >
                            {classes.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0">
                <table className="w-full text-sm st-table min-w-[1000px]">
                    <thead className="sticky top-0 z-10" style={{ background: 'var(--bg-surface-2)' }}>
                        <tr>
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Student</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide hidden md:table-cell" style={{ color: 'var(--text-secondary)' }}>Father's Name</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>Class</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Score</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>Admission</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide hidden md:table-cell" style={{ color: 'var(--text-secondary)' }}>Admitted In</th>
                            <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Registered</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide hidden lg:table-cell" style={{ color: 'var(--text-secondary)' }}>Date</th>
                            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedResults.length > 0 ? (
                            paginatedResults.map((result) => (
                                <tr key={result.id}>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2.5">
                                            {result.photo ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={result.photo}
                                                    alt={result.name}
                                                    className="w-8 h-8 rounded-full object-cover border shrink-0"
                                                    style={{ borderColor: 'var(--border)' }}
                                                />
                                            ) : (
                                                <div
                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                                    style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
                                                >
                                                    {result.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                            )}
                                            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{result.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-sm hidden md:table-cell font-urdu" style={{ color: 'var(--text-secondary)' }}>{result.father_name}</td>
                                    <td className="px-5 py-3 text-xs hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>{result.class_level}</td>
                                    <td className="px-5 py-3 font-bold text-sm" style={{ color: 'var(--success)' }}>{result.score} / 30</td>
                                    <td className="px-5 py-3 hidden sm:table-cell">
                                        {result.admission_status === 'granted' ? (
                                            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-border)' }}>Granted</span>
                                        ) : result.admission_status === 'not_granted' ? (
                                            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)' }}>Not Granted</span>
                                        ) : (
                                            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>Pending</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3 text-sm font-semibold hidden md:table-cell" style={{ color: 'var(--text-primary)' }}>
                                        {result.admitted_class || <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>—</span>}
                                    </td>
                                    <td className="px-5 py-3">
                                        <RegisterCheckbox studentId={result.id} isRegistered={result.is_registered} />
                                    </td>
                                    <td className="px-5 py-3 text-xs hidden lg:table-cell" style={{ color: 'var(--text-muted)' }}>{new Date(result.created_at).toLocaleDateString()}</td>
                                    <td className="px-5 py-3 text-right">
                                        <Link
                                            href={`/admin/results/${result.id}`}
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2.5 rounded-lg transition-colors"
                                            style={{ background: 'var(--primary-muted)', color: 'var(--primary)', minHeight: '44px' }}
                                        >
                                            <Eye size={13} /> View
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={9} className="px-6 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                                    {searchTerm || classFilter !== 'All' ? 'No matching results found.' : 'No tests completed yet.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div
                    className="p-4 border-t flex items-center justify-between"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg-surface-2)' }}
                >
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Showing <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredResults.length)}</span> of {filteredResults.length}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="st-btn-ghost p-2.5"
                            style={{ minWidth: '44px', minHeight: '44px' }}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="st-btn-ghost p-2.5"
                            style={{ minWidth: '44px', minHeight: '44px' }}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
