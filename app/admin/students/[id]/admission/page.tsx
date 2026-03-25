import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions';
import AdmissionForm from '@/components/AdmissionForm';

export const dynamic = 'force-dynamic';

export default async function AdmissionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) redirect('/admin/login');

    const { getStudentById } = await import('@/lib/actions');
    const student = await getStudentById(Number(id));
    if (!student) redirect('/admin/students');

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
            <AdmissionForm student={student} />
        </div>
    );
}
