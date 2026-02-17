'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

interface Result {
    id: number;
    name: string;
    father_name: string;
    class_level: string;
    score: number | null;
    created_at: string;
}

export default function ResultsList({ initialResults }: { initialResults: Result[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [classFilter, setClassFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    const filteredResults = initialResults.filter(result => {
        const matchesSearch = result.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            result.father_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = classFilter === 'All' || result.class_level === classFilter;
        return matchesSearch && matchesClass;
    });

    const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedResults = filteredResults.slice(startIndex, startIndex + itemsPerPage);

    const classes = ['All', 'PlayGroup', 'Nursery', 'Prep', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-gray-700">Attempted Papers</h3>
                <div className="flex flex-col md:flex-row gap-2">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search student or father..."
                            className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-gray-400" />
                        <select
                            className="border rounded-lg text-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={classFilter}
                            onChange={(e) => {
                                setClassFilter(e.target.value);
                                setCurrentPage(1);
                            }}
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
                            <th className="px-6 py-4">Student Name</th>
                            <th className="px-6 py-4">Father's Name</th>
                            <th className="px-6 py-4">Class</th>
                            <th className="px-6 py-4">Score</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {paginatedResults.length > 0 ? (
                            paginatedResults.map((result) => (
                                <tr key={result.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{result.name}</td>
                                    <td className="px-6 py-4 text-gray-600 font-urdu">{result.father_name}</td>
                                    <td className="px-6 py-4">{result.class_level}</td>
                                    <td className="px-6 py-4 text-green-600 font-bold">{result.score} / 30</td>
                                    <td className="px-6 py-4">{new Date(result.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/admin/results/${result.id}`}
                                            className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 py-1 rounded-lg transition-colors"
                                        >
                                            <Eye size={16} />
                                            <span>View</span>
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                    {searchTerm || classFilter !== 'All' ? 'No matching results found.' : 'No tests completed yet.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Showing <span className="font-medium text-gray-700">{startIndex + 1}</span> to <span className="font-medium text-gray-700">{Math.min(startIndex + itemsPerPage, filteredResults.length)}</span> of <span className="font-medium text-gray-700">{filteredResults.length}</span> results
                    </p>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-lg border ${currentPage === 1 ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : 'text-gray-600 bg-white hover:bg-gray-100'}`}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-sm font-medium text-gray-700">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-lg border ${currentPage === totalPages ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : 'text-gray-600 bg-white hover:bg-gray-100'}`}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
