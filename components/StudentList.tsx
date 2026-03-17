'use client';

import { useState } from 'react';
import { deleteStudent } from '@/lib/actions';
import { Trash2, Search, Filter, User } from 'lucide-react';

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
}

export default function StudentList({ initialStudents }: { initialStudents: Student[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [classFilter, setClassFilter] = useState('All');

    const filteredStudents = initialStudents.filter(student => {
        const matchesSearch =
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.father_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = classFilter === 'All' || student.class_level === classFilter;
        return matchesSearch && matchesClass;
    });

    const handleDelete = async (id: number) => {
        if (confirm('Delete this student record? This will also delete their test sessions.')) {
            const res = await deleteStudent(id);
            if (res.success) {
                window.location.reload();
            } else {
                alert('Error: ' + res.error);
            }
        }
    };

    const classes = ['All', 'PlayGroup', 'KG 1', 'KG 2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];

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
                            className="st-input pl-9 py-2 text-sm w-full sm:w-52"
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
                <table className="w-full text-sm st-table">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Student</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Code</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide hidden md:table-cell" style={{ color: 'var(--text-secondary)' }}>Father / Mobile</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>Class</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Status</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>Score</th>
                            <th className="px-5 py-3" />
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
                                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{student.name}</span>
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
                                        {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                                    </span>
                                </td>
                                {/* Score */}
                                <td className="px-5 py-3 font-bold text-sm hidden sm:table-cell" style={{ color: student.score !== null ? 'var(--success)' : 'var(--text-muted)' }}>
                                    {student.score !== null ? `${student.score} / 30` : '—'}
                                </td>
                                {/* Delete */}
                                <td className="px-5 py-3">
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
        </div>
    );
}
