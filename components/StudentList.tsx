'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteStudent } from '@/lib/actions';
import { Trash2, Edit2, Search, Filter, User, Printer } from 'lucide-react';
import MasterPasswordModal from './MasterPasswordModal';

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
}
 
const CLASSES = ['PlayGroup', 'KG 1', 'KG 2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];
 
export default function StudentList({ initialStudents, userRole }: { initialStudents: Student[], userRole: string }) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [classFilter, setClassFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('Today');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    
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
            (student.father_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
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
                    Registered Students <span className="font-normal text-xs ml-1" style={{ color: 'var(--text-muted)' }}>({filteredStudents.length})</span>
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
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* Date filter */}
                    <div className="flex items-center gap-2">
                        <select
                            className="st-input py-2 text-sm"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
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
                                onChange={(e) => setCustomStartDate(e.target.value)}
                            />
                            <span className="text-xs text-gray-400">to</span>
                            <input
                                type="date"
                                className="st-input py-2 text-sm"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                            />
                        </div>
                    )}
                    {/* Class filter */}
                    <div className="flex items-center gap-2">
                        <Filter size={15} style={{ color: 'var(--text-muted)' }} />
                        <select
                            className="st-input py-2 text-sm"
                            value={classFilter}
                            onChange={(e) => setClassFilter(e.target.value)}
                        >
                            {classes.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm st-table min-w-[1000px]">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Student</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Code</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide hidden md:table-cell" style={{ color: 'var(--text-secondary)' }}>Father / Mobile</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>Class</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Status</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>Score</th>
                            <th className="px-5 py-3 text-right" style={{ color: 'var(--text-secondary)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((student) => (
                            <tr key={student.id}>
                                {/* Student name + photo */}
                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-2.5">
                                        {student.photo ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={student.photo}
                                                alt={student.name}
                                                className="w-8 h-8 rounded-full object-cover border shrink-0"
                                                style={{ borderColor: 'var(--border)' }}
                                            />
                                        ) : (
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                                                style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
                                            >
                                                {student.name?.charAt(0)?.toUpperCase() || <User size={14} />}
                                            </div>
                                        )}
                                        <div className="flex flex-col">
                                            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{student.name}</span>
                                            <span className="text-[10px] uppercase font-bold tracking-tight opacity-50">{student.gender || 'N/A'}</span>
                                        </div>
                                    </div>
                                </td>
                                {/* Code */}
                                <td className="px-5 py-3 font-mono font-bold text-sm" style={{ color: 'var(--primary)' }}>
                                    {student.access_code}
                                </td>
                                {/* Father */}
                                <td className="px-5 py-3 hidden md:table-cell">
                                    <div className="font-medium text-xs" style={{ color: 'var(--text-primary)' }}>{student.father_name}</div>
                                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{student.father_mobile}</div>
                                </td>
                                {/* Class */}
                                <td className="px-5 py-3 text-xs hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>{student.class_level}</td>
                                {/* Status */}
                                <td className="px-5 py-3">
                                    <span className={`st-badge ${student.status === 'completed' ? 'st-badge-green' : student.status === 'started' ? 'st-badge-blue' : 'st-badge-gray'}`}>
                                        {(student.status || 'pending').charAt(0).toUpperCase() + (student.status || 'pending').slice(1)}
                                    </span>
                                </td>
                                {/* Score */}
                                <td className="px-5 py-3 font-bold text-sm hidden sm:table-cell" style={{ color: student.score !== null ? 'var(--success)' : 'var(--text-muted)' }}>
                                    {student.score !== null ? `${student.score} / 30` : '—'}
                                </td>
                                {/* Actions */}
                                <td className="px-5 py-3 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <button
                                            onClick={() => handlePrint(student)}
                                            className="p-2.5 rounded-lg transition-colors flex items-center gap-1.5 px-3"
                                            style={{ color: 'var(--text-secondary)', minHeight: '44px' }}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-hover)')}
                                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                            title="Print Slip"
                                        >
                                            <Printer size={16} />
                                            <span className="text-xs font-bold uppercase tracking-tight">Print</span>
                                        </button>
                                        <button
                                            onClick={() => router.push(`/admin/students/${student.id}/admission`)}
                                            className="p-2.5 rounded-lg transition-colors flex items-center gap-1.5 px-3"
                                            style={{ color: 'var(--primary)', minHeight: '44px' }}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--primary-muted)')}
                                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                            title="Digital Admission Form"
                                        >
                                            <Edit2 size={16} />
                                            <span className="text-xs font-bold uppercase tracking-tight">Form</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(student.id)}
                                            className="p-2.5 rounded-lg transition-colors"
                                            style={{ color: 'var(--danger)', minWidth: '44px', minHeight: '44px' }}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--danger-bg)')}
                                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                            title="Delete Student"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredStudents.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                                    {searchTerm || classFilter !== 'All' ? 'No matching students found.' : 'No students registered yet.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
 
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
