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

            <div className="flex flex-col gap-8">
                {/* Form Section */}
                <div>
                    <StudentForm />
                </div>

                {/* List Section */}
                <div>
                    <StudentList initialStudents={students} userRole={(await getCurrentUser())?.role || 'staff'} />
                </div>
            </div>
        </div>
    );
}
