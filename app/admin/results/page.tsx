import { getDb } from '@/lib/db';
import ResultsList from '@/components/ResultsList';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

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
            {/* Premium Header Card */}
            <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 shrink-0 mb-2">
                <div className="p-7 text-white" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-5">
                            <Link href="/admin" className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm border border-white/20 hidden md:block">
                                <ChevronLeft size={20} className="text-white" />
                            </Link>
                            <div>
                                <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">Mardan Youth's Academy</p>
                                <h1 className="text-3xl font-black mb-1">All Attempted Papers</h1>
                                <p className="text-blue-100/80 font-medium text-sm">Review, assess, and manage student performance results</p>
                            </div>
                        </div>
                        <div className="hidden md:block shrink-0"><ThemeToggle isPremium /></div>
                    </div>
                </div>
            </div>

            <ResultsList initialResults={results} pagination={false} />
        </div>
    );
}
