import { getDb } from '@/lib/db';
import ResultsList from '@/components/ResultsList';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function ResultsPage() {
    const db = getDb();
    
    // Active session
    const activeSession = db.prepare('SELECT * FROM sessions WHERE is_active = 1 LIMIT 1').get() as any;
    const sid = activeSession?.id;
    const sessionFilter = sid ? 'AND session_id = ?' : '';
    const sessionArgs = sid ? [sid] : [];

    const results = db.prepare(`
        SELECT id, name, father_name, class_level, score, created_at, photo, admission_status, admitted_class, is_registered
        FROM students 
        WHERE status = 'completed' ${sessionFilter}
        ORDER BY created_at DESC
    `).all(...sessionArgs) as any[];

    return (
        <div className="flex-1 overflow-y-auto space-y-6">
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
