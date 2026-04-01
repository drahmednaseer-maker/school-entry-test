'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteStudent } from '@/lib/actions';
import { Trash2, Edit2, Search, Filter, Printer, ArrowUpDown, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import MasterPasswordModal from './MasterPasswordModal';
import RegisterCheckbox from './RegisterCheckbox';

interface Student {
    id: number;
    access_code: string;
    name: string;
    father_name: string;
    father_mobile: string;
    class_level: string;
    status: string;
    score: number | null;
    created_at: string;
    photo?: string;
    gender?: string;
    is_registered: number;
    admitted_class?: string | null;
}
 
const CLASSES = ['PlayGroup', 'KG 1', 'KG 2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];
 
export default function StudentList({ initialStudents, userRole }: { initialStudents: Student[], userRole: string }) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [classFilter, setClassFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('Today');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [sortField, setSortField] = useState<'none' | 'status' | 'is_registered'>('none');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;
    
    const [passwordModal, setPasswordModal] = useState<{
        isOpen: boolean;
        onSuccess: () => void;
        title: string;
        description: string;
    }>({
        isOpen: false,
        onSuccess: () => {},
        title: '',
        description: ''
    });

    const handlePrint = (student: Student) => {
        const printWindow = window.open('', '_blank', 'width=500,height=700');
        if (!printWindow) {
            alert('Please allow popups for this site to print receipts.');
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Receipt - ${student.name}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: sans-serif; padding: 16px; width: 280px; color: #000; }
                    .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 12px; margin-bottom: 16px; }
                    .header h2 { font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; }
                    .header p { font-size: 11px; margin-top: 2px; }
                    .field { margin-bottom: 14px; }
                    .field-label { font-size: 10px; font-weight: 700; text-transform: uppercase; line-height: 1; margin-bottom: 2px; }
                    .field-value { font-size: 14px; font-weight: 900; text-transform: uppercase; line-height: 1.2; }
                    .field-value.normal { text-transform: none; }
                    .row { display: flex; gap: 8px; }
                    .row .field { flex: 1; }
                    .code-section { margin-top: 24px; padding-top: 16px; border-top: 2px dashed #000; text-align: center; }
                    .code-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 4px; margin-bottom: 8px; }
                    .code-value { font-size: 42px; font-weight: 900; letter-spacing: 4px; line-height: 1; }
                    .footer { margin-top: 24px; font-size: 9px; text-align: center; line-height: 1.5; }
                    @media print { body { width: 80mm; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>Mardan Youth Academy</h2>
                    <p>Student Entry Test Ticket</p>
                </div>
                <div class="field">
                    <div class="field-label">Student Name</div>
                    <div class="field-value">${student.name || ''}</div>
                </div>
                <div class="field">
                    <div class="field-label">Father's Name</div>
                    <div class="field-value">${student.father_name || ''}</div>
                </div>
                <div class="row">
                    <div class="field">
                        <div class="field-label">Class</div>
                        <div class="field-value">${student.class_level || ''}</div>
                    </div>
                    <div class="field">
                        <div class="field-label">Gender</div>
                        <div class="field-value">${student.gender || 'N/A'}</div>
                    </div>
                </div>
                <div class="field">
                    <div class="field-label">Mobile</div>
                    <div class="field-value normal">${student.father_mobile || ''}</div>
                </div>
                <div class="code-section">
                    <div class="code-label">Access Code</div>
                    <div class="code-value">${student.access_code || ''}</div>
                </div>
                <div class="footer">
                    Please keep this ticket safe.<br>
                    System Generated: ${new Date().toLocaleString()}
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    const filteredStudents = initialStudents.filter(student => {
        const matchesSearch =
            (student.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (student.father_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (student.id.toString().includes(searchTerm));
            
        // If searching, ignore date and class filters for "smart" discovery
        if (searchTerm.trim() !== '') {
            return matchesSearch;
        }

        const matchesClass = classFilter === 'All' || student.class_level === classFilter;
        
        let matchesDate = true;
        if (student.created_at) {
            const studentDate = new Date(student.created_at);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (dateFilter === 'Today') {
                matchesDate = studentDate >= today;
            } else if (dateFilter === 'Yesterday') {
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                matchesDate = studentDate >= yesterday && studentDate < today;
            } else if (dateFilter === 'Last 7 Days') {
                const last7 = new Date(today);
                last7.setDate(last7.getDate() - 7);
                matchesDate = studentDate >= last7;
            } else if (dateFilter === 'Last 30 Days') {
                const last30 = new Date(today);
                last30.setDate(last30.getDate() - 30);
                matchesDate = studentDate >= last30;
            } else if (dateFilter === 'Custom Range') {
                if (customStartDate) {
                    const start = new Date(customStartDate);
                    start.setHours(0, 0, 0, 0);
                    if (studentDate < start) matchesDate = false;
                }
                if (customEndDate) {
                    const end = new Date(customEndDate);
                    end.setHours(23, 59, 59, 999);
                    if (studentDate > end) matchesDate = false;
                }
            }
        }
        
        return matchesSearch && matchesClass && matchesDate;
    });

    const sortedStudents = [...filteredStudents].sort((a, b) => {
        if (sortField === 'none') return 0;

        let valA: any = a[sortField];
        let valB: any = b[sortField];

        // Handle null/undefined
        if (valA === null || valA === undefined) valA = '';
        if (valB === null || valB === undefined) valB = '';

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const totalPages = Math.ceil(sortedStudents.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedStudents = sortedStudents.slice(startIndex, startIndex + itemsPerPage);

    const handleSort = (field: 'status' | 'is_registered') => {
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

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const SortIcon = ({ field }: { field: 'status' | 'is_registered' }) => {
        if (sortField !== field) return <ArrowUpDown size={12} className="ml-1 opacity-50" />;
        return sortDirection === 'asc' ? <ChevronUp size={12} className="ml-1 text-primary" /> : <ChevronDown size={12} className="ml-1 text-primary" />;
    };

    const handleDelete = async (id: number) => {
        const performDelete = async () => {
            if (confirm('Delete this student record? This will also delete their test sessions.')) {
                const res = await deleteStudent(id);
                if (res.success) {
                    window.location.reload();
                } else {
                    alert('Error: ' + res.error);
                }
            }
        };

        if (userRole === 'admin') {
            performDelete();
        } else {
            setPasswordModal({
                isOpen: true,
                onSuccess: performDelete,
                title: "Confirm Deletion",
                description: "Deletion requires the master password. All test data for this student will be lost."
            });
        }
    };

    const classes = ['All', ...CLASSES];

    return (
        <div
            className="rounded-xl overflow-hidden shadow-sm"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
            {/* Filters */}
            <div
                className="p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-3"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-surface-2)' }}
            >
                <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                    Registered Students <span className="font-normal text-xs ml-1" style={{ color: 'var(--text-muted)' }}>({sortedStudents.length})</span>
                </h3>
                <div className="flex flex-col sm:flex-row gap-2 flex-wrap items-center">
                    {/* Search */}
                    <div className="relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search name..."
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
                    {/* Class filter */}
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
            <div className="overflow-x-auto">
                <table className="w-full text-sm st-table min-w-[1000px] border-collapse">
                    <thead>
                        <tr className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface-2)' }}>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>Student Participant</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>Token / Code</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.1em] hidden md:table-cell" style={{ color: 'var(--text-muted)' }}>Guardian / Contact</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.1em] hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>Grade</th>
                            <th 
                                className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-[0.1em] cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors" 
                                style={{ color: 'var(--text-muted)' }}
                                onClick={() => handleSort('status')}
                            >
                                <div className="flex items-center justify-center">
                                    Exam Status <SortIcon field="status" />
                                </div>
                            </th>
                            <th 
                                className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-[0.1em] cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors" 
                                style={{ color: 'var(--text-muted)' }}
                                onClick={() => handleSort('is_registered')}
                            >
                                <div className="flex items-center justify-center">
                                    Reg <SortIcon field="is_registered" />
                                </div>
                            </th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.1em] hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>Score</th>
                            <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                        {paginatedStudents.map((student) => (
                            <tr 
                                key={student.id} 
                                className="group transition-all duration-200 hover:bg-[#f8fafc] dark:hover:bg-white/5"
                            >
                                {/* Student name + photo */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative shrink-0">
                                            {student.photo ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={student.photo}
                                                    alt={student.name}
                                                    className="w-10 h-10 rounded-xl object-cover border-2 shadow-sm transition-transform group-hover:scale-105"
                                                    style={{ borderColor: 'var(--bg-surface)' }}
                                                />
                                            ) : (
                                                <div
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black border-2 shadow-sm transition-transform group-hover:scale-105"
                                                    style={{ 
                                                        background: 'var(--primary-muted)', 
                                                        color: 'var(--primary)',
                                                        borderColor: 'var(--bg-surface)'
                                                    }}
                                                >
                                                    {student.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                            )}
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 flex items-center justify-center text-[8px] font-bold shadow-sm"
                                                style={{ 
                                                    background: student.gender?.toLowerCase() === 'female' ? '#ec4899' : '#0ea5e9',
                                                    color: 'white',
                                                    borderColor: 'var(--bg-surface)'
                                                }}>
                                                {student.gender?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-bold truncate text-sm" style={{ color: 'var(--text-primary)' }}>{student.name}</span>
                                            <span className="text-[10px] font-bold tracking-wider opacity-40 uppercase">ID: #{student.id.toString().padStart(4, '0')}</span>
                                        </div>
                                    </div>
                                </td>

                                {/* Code / Token */}
                                <td className="px-6 py-4">
                                    <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border bg-surface-2 font-mono text-sm font-black tracking-widest shadow-sm"
                                        style={{ borderColor: 'var(--border)', color: 'var(--primary)' }}>
                                        {student.access_code}
                                    </div>
                                </td>

                                {/* Father */}
                                <td className="px-6 py-4 hidden md:table-cell">
                                    <div className="flex flex-col">
                                        <div className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>{student.father_name}</div>
                                        <div className="text-[11px] font-medium opacity-60 mt-0.5">{student.father_mobile}</div>
                                    </div>
                                </td>

                                {/* Class */}
                                <td className="px-6 py-4 hidden sm:table-cell">
                                    <span className="text-xs font-bold px-2 py-1 rounded bg-slate-100 dark:bg-white/5" style={{ color: 'var(--text-secondary)' }}>
                                        {student.class_level}
                                    </span>
                                </td>

                                {/* Status */}
                                <td className="px-6 py-4 text-center">
                                    <div className="inline-flex items-center">
                                        <span className={`st-badge ${
                                            student.status === 'completed' ? 'st-badge-green' : 
                                            student.status === 'started' ? 'st-badge-blue' : 
                                            'st-badge-gray'
                                        } px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-xs`}>
                                            {student.status || 'pending'}
                                        </span>
                                    </div>
                                </td>

                                {/* Registered */}
                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center">
                                        <RegisterCheckbox 
                                            studentId={student.id} 
                                            studentName={student.name}
                                            isRegistered={student.is_registered} 
                                            admittedClass={student.admitted_class}
                                        />
                                    </div>
                                </td>

                                {/* Score */}
                                <td className="px-6 py-4 hidden sm:table-cell">
                                    {student.score !== null ? (
                                        <div className="flex flex-col gap-1">
                                            <div className="flex justify-between items-center w-24">
                                                <span className="font-black text-sm" style={{ color: 'var(--success)' }}>{student.score}</span>
                                                <span className="text-[10px] opacity-40">/ 30</span>
                                            </div>
                                            <div className="w-24 h-1.5 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                                                <div 
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{ 
                                                        width: `${(student.score / 30) * 100}%`,
                                                        background: 'var(--success)'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-xs font-bold opacity-30 italic">Not available</span>
                                    )}
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handlePrint(student)}
                                            className="p-2 rounded-lg transition-all hover:bg-slate-100 dark:hover:bg-white/10 hover:shadow-sm"
                                            style={{ color: 'var(--text-secondary)' }}
                                            title="Print Ticket"
                                        >
                                            <Printer size={16} strokeWidth={2.5} />
                                        </button>
                                        <button
                                            onClick={() => router.push(`/admin/students/${student.id}/admission`)}
                                            className="p-2 rounded-lg transition-all hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:shadow-sm"
                                            style={{ color: 'var(--primary)' }}
                                            title="Digital Admission Form"
                                        >
                                            <Edit2 size={16} strokeWidth={2.5} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(student.id)}
                                            className="p-2 rounded-lg transition-all hover:bg-red-50 dark:hover:bg-red-500/10 hover:shadow-sm"
                                            style={{ color: 'var(--danger)' }}
                                            title="Permanently Delete"
                                        >
                                            <Trash2 size={16} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {paginatedStudents.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3 opacity-40">
                                        <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                                            <Search size={32} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">No Student Records Found</p>
                                            <p className="text-xs">Adjust filters or search parameters</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div
                    className="p-4 border-t flex items-center justify-between"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg-surface-2)' }}
                >
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Showing <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{startIndex + 1}–{Math.min(startIndex + itemsPerPage, sortedStudents.length)}</span> of {sortedStudents.length}
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

            {/* Master Password Prompt */}
            <MasterPasswordModal
                isOpen={passwordModal.isOpen}
                title={passwordModal.title}
                description={passwordModal.description}
                onClose={() => setPasswordModal({ ...passwordModal, isOpen: false })}
                onSuccess={passwordModal.onSuccess}
            />
        </div>
    );
}
