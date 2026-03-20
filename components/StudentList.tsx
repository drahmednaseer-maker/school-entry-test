'use client';

import { useState, useTransition } from 'react';
import { deleteStudent, updateStudent } from '@/lib/actions';
import { Trash2, Edit2, Search, Filter, User, X, Check, Loader2, Phone, BookOpen } from 'lucide-react';
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
const GENDERS = ['Male', 'Female'];

export default function StudentList({ initialStudents, userRole }: { initialStudents: Student[], userRole: string }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [classFilter, setClassFilter] = useState('All');
    const [isPending, startTransition] = useTransition();
    
    // Edit state
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [editForm, setEditForm] = useState({
        name: '',
        fatherName: '',
        fatherMobile: '',
        classLevel: '',
        gender: ''
    });

    // Master Password Modal State
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

    const filteredStudents = initialStudents.filter(student => {
        const matchesSearch =
            (student.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (student.father_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesClass = classFilter === 'All' || student.class_level === classFilter;
        return matchesSearch && matchesClass;
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

    const openEditModal = (student: Student) => {
        const performOpen = () => {
            setEditingStudent(student);
            setEditForm({
                name: student.name || '',
                fatherName: student.father_name || '',
                fatherMobile: student.father_mobile || '',
                classLevel: student.class_level || 'PlayGroup',
                gender: student.gender || 'Male'
            });
        };

        if (userRole === 'admin') {
            performOpen();
        } else {
            setPasswordModal({
                isOpen: true,
                onSuccess: performOpen,
                title: "Edit Student Record",
                description: "Editing student records requires the master password."
            });
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStudent) return;

        startTransition(async () => {
            const res = await updateStudent(editingStudent.id, editForm);
            if (res.success) {
                setEditingStudent(null);
                window.location.reload();
            } else {
                alert('Error: ' + res.error);
            }
        });
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
                <div className="flex flex-col sm:flex-row gap-2">
                    {/* Search */}
                    <div className="relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search name..."
                            className="st-input py-2 text-sm w-full sm:w-52"
                            style={{ paddingLeft: '2.25rem' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
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
                                            onClick={() => openEditModal(student)}
                                            className="p-1.5 rounded-lg transition-colors"
                                            style={{ color: 'var(--primary)' }}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--primary-muted)')}
                                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                            title="Edit Student"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(student.id)}
                                            className="p-1.5 rounded-lg transition-colors"
                                            style={{ color: 'var(--danger)' }}
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

            {/* Edit Modal */}
            {editingStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div 
                        className="w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200"
                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                    >
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface-2)' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--primary-muted)' }}>
                                    <Edit2 size={18} style={{ color: 'var(--primary)' }} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Edit Student Details</h3>
                                    <p className="text-[10px] uppercase font-black opacity-50">Code: {editingStudent.access_code}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setEditingStudent(null)}
                                className="p-2 rounded-lg hover:bg-black/5 transition-colors"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleUpdate} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Name */}
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>Student Name</label>
                                    <div className="relative">
                                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                        <input
                                            required
                                            className="st-input w-full"
                                            style={{ paddingLeft: '2.5rem' }}
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Father Name */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>Father Name</label>
                                    <div className="relative">
                                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                        <input
                                            className="st-input w-full"
                                            style={{ paddingLeft: '2.5rem' }}
                                            value={editForm.fatherName}
                                            onChange={(e) => setEditForm({ ...editForm, fatherName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Mobile */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>Mobile Number</label>
                                    <div className="relative">
                                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                        <input
                                            className="st-input w-full"
                                            style={{ paddingLeft: '2.5rem' }}
                                            value={editForm.fatherMobile}
                                            onChange={(e) => setEditForm({ ...editForm, fatherMobile: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Class */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>Class Level</label>
                                    <div className="relative">
                                        <BookOpen size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                        <select
                                            className="st-input w-full"
                                            style={{ paddingLeft: '2.5rem' }}
                                            value={editForm.classLevel}
                                            onChange={(e) => setEditForm({ ...editForm, classLevel: e.target.value })}
                                        >
                                            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Gender */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>Gender</label>
                                    <div className="relative">
                                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                        <select
                                            className="st-input w-full"
                                            style={{ paddingLeft: '2.5rem' }}
                                            value={editForm.gender}
                                            onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                                        >
                                            {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                                <button
                                    type="button"
                                    onClick={() => setEditingStudent(null)}
                                    className="st-btn-ghost px-5 py-2 text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="st-btn-primary px-8 py-2 text-sm min-w-[120px]"
                                >
                                    {isPending ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Check size={18} />
                                            Save Changes
                                        </div>
                                    )}
                                </button>
                            </div>
                        </form>
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
