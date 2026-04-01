'use client';

import { useState, useTransition } from 'react';
import { Trash2, Edit2, Search, Filter, User, X, Check, Loader2, Calendar, BookOpen, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';
import MasterPasswordModal from './MasterPasswordModal';
import { deleteSlc, updateSlc } from '@/lib/actions';

const SECTIONS = ['M', 'Y', 'A', 'S', 'N', 'R', 'F'];
const CLASSES = ['PlayGroup', 'KG 1', 'KG 2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];
const GENDERS = ['Male', 'Female'];

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

export default function SlcList({ initialSlcs, userRole }: { initialSlcs: SlcRecord[], userRole: string }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [classFilter, setClassFilter] = useState('All');
    const [sectionFilter, setSectionFilter] = useState('All');
    const [isPending, startTransition] = useTransition();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    // Edit state
    const [editingSlc, setEditingSlc] = useState<SlcRecord | null>(null);

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

    const filteredSlcs = initialSlcs.filter(slc => {
        const matchesSearch =
            (slc.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (slc.father_name && slc.father_name.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesClass = classFilter === 'All' || slc.class_level === classFilter;
        const matchesSection = sectionFilter === 'All' || slc.section === sectionFilter;
        return matchesSearch && matchesClass && matchesSection;
    });

    const totalPages = Math.ceil(filteredSlcs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedSlcs = filteredSlcs.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const classes = ['All', 'PlayGroup', 'KG 1', 'KG 2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];

    const handleDelete = async (id: number) => {
        const performDelete = async () => {
            if (confirm('Are you sure you want to delete this SLC record? This will also revert the seat occupancy count.')) {
                startTransition(async () => {
                    const res = await deleteSlc(id);
                    if (res.success) {
                        window.location.reload();
                    } else {
                        alert('Error: ' + res.error);
                    }
                });
            }
        };

        if (userRole === 'admin') {
            performDelete();
        } else {
            setPasswordModal({
                isOpen: true,
                onSuccess: performDelete,
                title: "Confirm SLC Deletion",
                description: "Deleting SLC records requires the master password. This will affect seat capacity reports."
            });
        }
    };

    const handleEditClick = (slc: SlcRecord) => {
        const performEdit = () => {
            setEditingSlc(slc);
        };

        if (userRole === 'admin') {
            performEdit();
        } else {
            setPasswordModal({
                isOpen: true,
                onSuccess: performEdit,
                title: "Edit SLC Record",
                description: "Modifying SLC records requires the master password."
            });
        }
    };

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingSlc) return;

        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            const res = await updateSlc(editingSlc.id, formData);
            if (res.success) {
                setEditingSlc(null);
                window.location.reload();
            } else {
                alert('Error: ' + res.error);
            }
        });
    };

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
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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
                                onChange={(e) => { setClassFilter(e.target.value); setCurrentPage(1); }}
                            >
                                {classes.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Section Filter */}
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <GraduationCap size={14} className="absolute left-3 top-1/2 -translate-y-1/2 z-10" style={{ color: 'var(--text-muted)' }} />
                            <select
                                className="st-input py-2 text-sm min-w-[120px] relative z-0"
                                style={inputStyle}
                                value={sectionFilter}
                                onChange={(e) => { setSectionFilter(e.target.value); setCurrentPage(1); }}
                            >
                                {['All', ...SECTIONS].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0 text-sm">
                <table className="w-full st-table min-w-[1000px]">
                    <thead className="sticky top-0 z-10" style={{ background: 'var(--bg-surface-2)' }}>
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Student</th>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Father's Name</th>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Class</th>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Section</th>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Gender</th>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>SLC Date</th>
                            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                        {paginatedSlcs.length > 0 ? (
                            paginatedSlcs.map((slc) => (
                                <tr key={slc.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                                                {slc.name?.charAt(0).toUpperCase() || '?'}
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
                                    <td className="px-6 py-4 whitespace-nowrap font-medium" style={{ color: 'var(--text-primary)' }}>
                                        {slc.date_issued ? new Date(slc.date_issued).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => handleEditClick(slc)}
                                                className="p-2.5 rounded-lg transition-colors"
                                                style={{ color: 'var(--primary)', minWidth: '44px', minHeight: '44px' }}
                                                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--primary-muted)')}
                                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                                title="Edit SLC"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(slc.id)}
                                                className="p-2.5 rounded-lg transition-colors"
                                                style={{ color: 'var(--danger)', minWidth: '44px', minHeight: '44px' }}
                                                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--danger-bg)')}
                                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                                title="Delete SLC"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3 opacity-40">
                                        <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                                            <Search size={32} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">No SLC Records Found</p>
                                            <p className="text-xs">Try adjusting your search or filters</p>
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
                    className="p-4 border-t flex items-center justify-between font-sans"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg-surface-2)' }}
                >
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Showing <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredSlcs.length)}</span> of {filteredSlcs.length}
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

            {/* Edit Modal */}
            {editingSlc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div 
                        className="w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden"
                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                    >
                        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface-2)' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--primary-muted)' }}>
                                    <Edit2 size={18} style={{ color: 'var(--primary)' }} />
                                </div>
                                <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Edit SLC Record</h3>
                            </div>
                            <button onClick={() => setEditingSlc(null)} className="p-2 rounded-lg hover:bg-black/5 transition-colors">
                                <X size={20} style={{ color: 'var(--text-muted)' }} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>Student Name</label>
                                    <div className="relative">
                                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 z-10" style={{ color: 'var(--text-muted)' }} />
                                        <input
                                            name="name"
                                            required
                                            defaultValue={editingSlc.name}
                                            className="st-input w-full relative z-0"
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>

                                {/* Father Name */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>Father Name</label>
                                    <div className="relative">
                                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 z-10" style={{ color: 'var(--text-muted)' }} />
                                        <input
                                            name="father_name"
                                            defaultValue={editingSlc.father_name}
                                            className="st-input w-full relative z-0"
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>

                                {/* Class */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>Class</label>
                                    <div className="relative">
                                        <BookOpen size={16} className="absolute left-3 top-1/2 -translate-y-1/2 z-10" style={{ color: 'var(--text-muted)' }} />
                                        <select name="class_level" required defaultValue={editingSlc.class_level} className="st-input w-full relative z-0" style={inputStyle}>
                                            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Section */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>Section</label>
                                    <div className="relative">
                                        <GraduationCap size={16} className="absolute left-3 top-1/2 -translate-y-1/2 z-10" style={{ color: 'var(--text-muted)' }} />
                                        <select name="section" required defaultValue={editingSlc.section} className="st-input w-full relative z-0" style={inputStyle}>
                                            {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Gender */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>Gender</label>
                                    <div className="relative">
                                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 z-10" style={{ color: 'var(--text-muted)' }} />
                                        <select name="gender" required defaultValue={editingSlc.gender} className="st-input w-full relative z-0" style={inputStyle}>
                                            {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Date */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>Date of SLC</label>
                                    <div className="relative">
                                        <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 z-10" style={{ color: 'var(--text-muted)' }} />
                                        <input
                                            type="date"
                                            name="date_issued"
                                            required
                                            defaultValue={editingSlc.date_issued}
                                            className="st-input w-full relative z-0"
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t flex justify-end gap-3" style={{ borderColor: 'var(--border)' }}>
                                <button
                                    type="button"
                                    onClick={() => setEditingSlc(null)}
                                    className="st-btn-ghost px-6 py-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="st-btn-primary px-8 py-2 min-w-[140px]"
                                >
                                    {isPending ? <Loader2 size={18} className="animate-spin" /> : (
                                        <div className="flex items-center gap-2">
                                            <Check size={18} />
                                            Update Record
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
