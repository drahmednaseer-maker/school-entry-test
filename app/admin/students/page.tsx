import { getDb } from '@/lib/db';
import StudentForm from '@/components/StudentForm';
import StudentList from '@/components/StudentList';

export const dynamic = 'force-dynamic';

export default function StudentsPage() {
    const db = getDb();
    const students = db.prepare('SELECT * FROM students ORDER BY created_at DESC').all() as any[];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">Students & Access Codes</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-1">
                    <StudentForm />
                </div>

                {/* List Section */}
                <div className="lg:col-span-2">
                    <StudentList initialStudents={students} />
                </div>
            </div>
        </div>
    );
}
