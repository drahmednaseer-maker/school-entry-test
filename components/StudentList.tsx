'use client';

import { useState } from 'react';
import { deleteStudent } from '@/lib/actions';
import { Trash2, Search, Filter } from 'lucide-react';

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
}

export default function StudentList({ initialStudents }: { initialStudents: Student[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [classFilter, setClassFilter] = useState('All');
    const [students, setStudents] = useState(initialStudents);

    const filteredStudents = initialStudents.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.father_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = classFilter === 'All' || student.class_level === classFilter;
        return matchesSearch && matchesClass;
    });

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this student record? This will also delete their test sessions.')) {
            const res = await deleteStudent(id);
            if (res.success) {
                // The page will revalidate, but we can also update local state for immediate feedback
                // or just rely on revalidatePath if it works well.
                // Since this is a server component wrapper, we might need to handle refresh logic.
                window.location.reload(); // Simple way to refresh RSC data
            } else {
                alert('Error: ' + res.error);
            }
        }
    };

    const classes = ['All', 'PlayGroup', 'Nursery', 'Prep', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-gray-700">Registered Students</h3>
                <div className="flex flex-col md:flex-row gap-2">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search name..."
                            className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-gray-400" />
                        <select
                            className="border rounded-lg text-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={classFilter}
                            onChange={(e) => setClassFilter(e.target.value)}
                        >
                            {classes.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 font-medium">
                        <tr>
                            <th className="px-6 py-3">Access Code</th>
                            <th className="px-6 py-3">Student Name</th>
                            <th className="px-6 py-3">Father's Name & Mobile</th>
                            <th className="px-6 py-3">Class</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Score</th>
                            <th className="px-6 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredStudents.map((student) => (
                            <tr key={student.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-mono font-bold text-blue-600">{student.access_code}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                                <td className="px-6 py-4 text-gray-600 font-urdu">
                                    <div className="font-semibold text-gray-800">{student.father_name}</div>
                                    <div className="text-xs text-blue-600">{student.father_mobile}</div>
                                </td>
                                <td className="px-6 py-4">{student.class_level}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${student.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        student.status === 'started' ? 'bg-orange-100 text-orange-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-bold">
                                    {student.score !== null ? `${student.score} / 30` : '-'}
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleDelete(student.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                        title="Delete Student"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredStudents.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
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
