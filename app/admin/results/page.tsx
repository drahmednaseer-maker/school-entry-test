import { getDb } from '@/lib/db';
import ResultsList from '@/components/ResultsList';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function ResultsPage() {
    const db = getDb();
    const results = db.prepare(`
        SELECT id, name, father_name, class_level, score, created_at 
        FROM students 
        WHERE status = 'completed' 
        ORDER BY created_at DESC
    `).all() as any[];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronLeft size={24} className="text-gray-600" />
                    </Link>
                    <h2 className="text-3xl font-bold text-gray-800">All Attempted Papers</h2>
                </div>
            </div>

            <ResultsList initialResults={results} />
        </div>
    );
}
