import { getDb } from '@/lib/db';
import StudentForm from '@/components/StudentForm';
import StudentList from '@/components/StudentList';
import { getCurrentUser } from '@/lib/actions';
import ThemeToggle from '@/components/ThemeToggle';

export const dynamic = 'force-dynamic';

export default async function StudentsPage() {
    const db = getDb();
    const students = db.prepare('SELECT * FROM students ORDER BY created_at DESC').all() as any[];

    return (
        <div className="flex-1 overflow-y-auto space-y-8">
            {/* Premium Header Card */}
            <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 shrink-0">
                <div className="p-7 text-white" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">Mardan Youth's Academy</p>
                            <h1 className="text-3xl font-black mb-1">Students & Access Codes</h1>
                            <p className="text-blue-100/80 font-medium text-sm">Manage student registration and admission testing</p>
                        </div>
                        <div className="hidden md:block shrink-0"><ThemeToggle isPremium /></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section - Quick Entry */}
                <div className="lg:col-span-2">
                    <StudentForm />
                </div>

                {/* Form Section - Full Entry Action */}
                <div className="lg:col-span-1">
                    <div className="h-full rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col p-6 space-y-4" style={{ background: 'var(--bg-surface)' }}>
                        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 border border-amber-100/50">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-blue-900 leading-tight">Full Student Admission</h3>
                            <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">Enter all academic, personal, and medical details in a single step for formal registration.</p>
                        </div>
                        <a 
                            href="/admin/students/new/admission" 
                            className="st-btn-ghost w-full flex items-center justify-center gap-2 py-3 border border-gray-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition-all font-bold text-sm"
                        >
                            Start Full Admission
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </a>
                    </div>
                </div>
            </div>

                {/* List Section */}
                <div>
                    <StudentList initialStudents={students} userRole={(await getCurrentUser())?.role || 'staff'} />
                </div>
        </div>
    );
}
