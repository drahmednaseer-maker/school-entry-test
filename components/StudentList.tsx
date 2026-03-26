'use client';
 
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
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
 
const CLASSES = ['PlayGroup', 'KG 1', 'KG 2', 'Grade 1', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];
 
export default function StudentList({ initialStudents, userRole }: { initialStudents: Student[], userRole: string }) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [classFilter, setClassFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('Today');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [printData, setPrintData] = useState<Student | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    
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
        setPrintData(student);
        // We need a small timeout to let React render the hidden div with correct data before window.print()
        setTimeout(() => {
            window.print();
        }, 100);
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
            {/* Portal-based Hidden Template for Printing */}
            {mounted && typeof document !== 'undefined' && printData && createPortal(
                    <div className="flex justify-center bg-white text-black font-sans">
                        <div className="w-[280px]">
                            <div className="text-center border-b-2 border-dashed border-black pb-3 mb-4">
                                <h5 className="font-black text-sm uppercase tracking-tighter text-black m-0">Mardan Youth Academy</h5>
                                <p className="text-[11px] text-black m-0">Student Entry Test Ticket</p>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-black m-0 leading-tight">Student Name</p>
                                    <p className="text-[14px] font-black uppercase m-0 leading-tight text-black">{printData.name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-black m-0 leading-tight">Father's Name</p>
                                    <p className="text-[14px] font-black uppercase m-0 leading-tight text-black">{printData.father_name}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-black m-0 leading-tight">Class</p>
                                        <p className="text-[14px] font-black uppercase m-0 leading-tight text-black">{printData.class_level}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-black m-0 leading-tight">Gender</p>
                                        <p className="text-[14px] font-black uppercase m-0 leading-tight text-black">{printData.gender || 'Not Specified'}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-black m-0 leading-tight">Mobile</p>
                                    <p className="text-[14px] font-black m-0 leading-tight text-black">{printData.father_mobile}</p>
                                </div>
                            </div>
                            
                            <div className="mt-8 pt-4 border-t-2 border-dashed border-black text-center">
                                <p className="text-[11px] font-bold uppercase tracking-widest mb-1 m-0 text-black">Access Code</p>
                                <p className="text-5xl font-black tracking-widest m-0 leading-none text-black mt-2">{printData.access_code}</p>
                            </div>
                            
                            <div className="mt-8 text-[9px] text-center text-black leading-tight">
                                Please keep this ticket safe.<br/>
                                System Generated: {new Date().toLocaleString()}
                            </div>
                        </div>

                </div>,
                document.body
            )}
        </div>
    );
}
