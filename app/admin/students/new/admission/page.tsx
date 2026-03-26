import AdmissionForm from '@/components/AdmissionForm';

export const dynamic = 'force-dynamic';

export default function NewAdmissionPage() {
    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
            <AdmissionForm />
        </div>
    );
}
