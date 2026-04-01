'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, ChevronLeft, ChevronRight, Eye, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
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
    const [dateFilter, setDateFilter] = useState('Today');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState<'none' | 'admission_status' | 'is_registered'>('none');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const itemsPerPage = 50;

    const filteredResults = initialResults.filter(result => {
        const matchesSearch =
            result.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            result.father_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            result.id.toString().includes(searchTerm);

        // If searching, ignore date and class filters for "smart" discovery
        if (searchTerm.trim() !== '') {
            return matchesSearch;
        }

        const matchesClass = classFilter === 'All' || result.class_level === classFilter;
        
        let matchesDate = true;
        if (result.created_at) {
            const resultDate = new Date(result.created_at);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (dateFilter === 'Today') {
                matchesDate = resultDate >= today;
            } else if (dateFilter === 'Yesterday') {
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                matchesDate = resultDate >= yesterday && resultDate < today;
            } else if (dateFilter === 'Last 7 Days') {
                const last7 = new Date(today);
                last7.setDate(last7.getDate() - 7);
                matchesDate = resultDate >= last7;
            } else if (dateFilter === 'Last 30 Days') {
                const last30 = new Date(today);
                last30.setDate(last30.getDate() - 30);
                matchesDate = resultDate >= last30;
            } else if (dateFilter === 'Custom Range') {
                if (customStartDate) {
                    const start = new Date(customStartDate);
                    start.setHours(0, 0, 0, 0);
                    if (resultDate < start) matchesDate = false;
                }
                if (customEndDate) {
                    const end = new Date(customEndDate);
                    end.setHours(23, 59, 59, 999);
                    if (resultDate > end) matchesDate = false;
                }
            }
        }
        
        return matchesSearch && matchesClass && matchesDate;
    });

    const sortedResults = [...filteredResults].sort((a, b) => {
        if (sortField === 'none') return 0;

        let valA: any = a[sortField];
        let valB: any = b[sortField];

        // Handle null/undefined for admission_status
        if (valA === null || valA === undefined) valA = '';
        if (valB === null || valB === undefined) valB = '';

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const handleSort = (field: 'admission_status' | 'is_registered') => {
        if (sortField === field) {
            if (sortDirection === 'asc') {
                setSortDirection('desc');
            } else {
                setSortField('none');
                setSortDirection('asc');
            }
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    const SortIcon = ({ field }: { field: 'admission_status' | 'is_registered' }) => {
        if (sortField !== field) return <ArrowUpDown size={12} className="ml-1 opacity-50" />;
        return sortDirection === 'asc' ? <ChevronUp size={12} className="ml-1 text-primary" /> : <ChevronDown size={12} className="ml-1 text-primary" />;
    };

    const totalPages = Math.ceil(sortedResults.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedResults = sortedResults.slice(startIndex, startIndex + itemsPerPage);

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
                        {title} <span className="font-normal text-xs ml-1" style={{ color: 'var(--text-muted)' }}>({sortedResults.length})</span>
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
                <div className="flex flex-col sm:flex-row gap-2 mt-3 md:mt-0 w-full md:w-auto justify-end flex-wrap items-center">
                    <div className="relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search student or father..."
                            className="st-input py-2 text-sm w-full sm:w-48"
                            style={{ paddingLeft: '2.25rem' }}
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                    {/* Date filter */}
                    <div className="flex items-center gap-2">
                        <select
                            className="st-input py-2 text-sm"
                            value={dateFilter}
                            onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="Today">Today</option>
                            <option value="Yesterday">Yesterday</option>
                            <option value="Last 7 Days">Last 7 Days</option>
                            <option value="Last 30 Days">Last 30 Days</option>
                            <option value="All Time">All Time</option>
                            <option value="Custom Range">Custom Range</option>
                        </select>
                    </div>
                    {/* Custom Range Inputs */}
                    {dateFilter === 'Custom Range' && (
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                className="st-input py-2 text-sm"
                                value={customStartDate}
                                onChange={(e) => { setCustomStartDate(e.target.value); setCurrentPage(1); }}
                            />
                            <span className="text-xs text-gray-400">to</span>
                            <input
                                type="date"
                                className="st-input py-2 text-sm"
                                value={customEndDate}
                                onChange={(e) => { setCustomEndDate(e.target.value); setCurrentPage(1); }}
                            />
                        </div>
                    )}
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
                <table className="w-full text-sm st-table min-w-[1000px] border-collapse">
                    <thead className="sticky top-0 z-10" style={{ background: 'var(--bg-surface-2)' }}>
                        <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>Student Participant</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.1em] hidden md:table-cell" style={{ color: 'var(--text-muted)' }}>Guardian / Contact</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.1em] hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>Class</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>Score Analytics</th>
                            <th 
                                className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.1em] hidden sm:table-cell cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors" 
                                style={{ color: 'var(--text-muted)' }}
                                onClick={() => handleSort('admission_status')}
                            >
                                <div className="flex items-center">
                                    Admission Status <SortIcon field="admission_status" />
                                </div>
                            </th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.1em] hidden md:table-cell" style={{ color: 'var(--text-muted)' }}>Admitted Group</th>
                            <th 
                                className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-[0.1em] cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors" 
                                style={{ color: 'var(--text-muted)' }}
                                onClick={() => handleSort('is_registered')}
                            >
                                <div className="flex items-center justify-center">
                                    Reg <SortIcon field="is_registered" />
                                </div>
                            </th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.1em] hidden lg:table-cell" style={{ color: 'var(--text-muted)' }}>Date</th>
                            <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>Access</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                        {paginatedResults.length > 0 ? (
                            paginatedResults.map((result) => (
                                <tr 
                                    key={result.id}
                                    className="group transition-all duration-200 hover:bg-[#f8fafc] dark:hover:bg-white/5"
                                >
                                    {/* Student Participant */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative shrink-0">
                                                {result.photo ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={result.photo}
                                                        alt={result.name}
                                                        className="w-10 h-10 rounded-xl object-cover border-2 shadow-sm transition-transform group-hover:scale-105"
                                                        style={{ borderColor: 'var(--bg-surface)' }}
                                                    />
                                                ) : (
                                                    <div
                                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black border-2 shadow-sm transition-transform group-hover:scale-105"
                                                        style={{ background: 'var(--primary-muted)', color: 'var(--primary)', borderColor: 'var(--bg-surface)' }}
                                                    >
                                                        {result.name?.charAt(0)?.toUpperCase()}
                                                    </div>
                                                )}
                                                {/* Hidden Gender Logic - result doesn't have gender from dashboard query, keeping it simple */}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-bold truncate text-sm" style={{ color: 'var(--text-primary)' }}>{result.name}</span>
                                                <span className="text-[10px] font-bold tracking-wider opacity-40 uppercase">UID: #{result.id.toString().padStart(4, '0')}</span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Guardian */}
                                    <td className="px-6 py-4 hidden md:table-cell">
                                        <div className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>{result.father_name}</div>
                                    </td>

                                    {/* Class */}
                                    <td className="px-6 py-4 hidden sm:table-cell">
                                        <span className="text-xs font-bold px-2 py-1 rounded bg-slate-100 dark:bg-white/5" style={{ color: 'var(--text-secondary)' }}>
                                            {result.class_level}
                                        </span>
                                    </td>

                                    {/* Score Analytics */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex justify-between items-center w-28">
                                                <span className="font-black text-sm" style={{ color: 'var(--success)' }}>{result.score}</span>
                                                <span className="text-[10px] opacity-40">/ 30</span>
                                            </div>
                                            <div className="w-28 h-1.5 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                                                <div 
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{ 
                                                        width: `${((result.score || 0) / 30) * 100}%`,
                                                        background: 'var(--success)'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </td>

                                    {/* Admission Status */}
                                    <td className="px-6 py-4 hidden sm:table-cell">
                                        <div className="flex">
                                            {result.admission_status === 'granted' ? (
                                                <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all" 
                                                      style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-border)' }}>
                                                    ✅ Granted
                                                </span>
                                            ) : result.admission_status === 'not_granted' ? (
                                                <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all" 
                                                      style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)' }}>
                                                    ❌ Denied
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all" 
                                                      style={{ background: 'var(--bg-surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                                                    ⏳ Pending
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Admitted Class */}
                                    <td className="px-6 py-4 hidden md:table-cell">
                                        {result.admitted_class ? (
                                            <span className="text-[11px] font-black uppercase tracking-tight py-1 px-2 bg-blue-50 dark:bg-blue-500/10 rounded-md" style={{ color: 'var(--primary)' }}>
                                                {result.admitted_class}
                                            </span>
                                        ) : (
                                            <span className="text-xs font-bold opacity-30 italic">Not Assigned</span>
                                        )}
                                    </td>

                                    {/* Registered */}
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center">
                                            <RegisterCheckbox 
                                                studentId={result.id} 
                                                studentName={result.name}
                                                isRegistered={result.is_registered} 
                                                admittedClass={result.admitted_class}
                                            />
                                        </div>
                                    </td>

                                    {/* Date */}
                                    <td className="px-6 py-4 hidden lg:table-cell">
                                        <div className="text-[11px] font-bold opacity-50 uppercase tracking-tight">
                                            {new Date(result.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </div>
                                    </td>

                                    {/* Action */}
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/admin/results/${result.id}`}
                                            className="inline-flex items-center justify-center w-10 h-10 rounded-xl transition-all hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:shadow-sm"
                                            style={{ color: 'var(--primary)', border: '1px solid transparent' }}
                                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary-muted)')}
                                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
                                        >
                                            <Eye size={18} strokeWidth={2.5} />
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={9} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3 opacity-40">
                                        <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                                            <Search size={32} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">No Result Records Found</p>
                                            <p className="text-xs">Initial tests have not been registered yet</p>
                                        </div>
                                    </div>
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
                        Showing <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{startIndex + 1}–{Math.min(startIndex + itemsPerPage, sortedResults.length)}</span> of {sortedResults.length}
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
