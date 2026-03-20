import { getSlcs } from '@/lib/actions';
import SlcForm from '@/components/SlcForm';
import SlcList from '@/components/SlcList';
import { getCurrentUser } from '@/lib/actions';

export const dynamic = 'force-dynamic';

export default async function SlcPage() {
    const slcs = await getSlcs();

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="mb-6">
                <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    SLC Management
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Record School Leaving Certificates and manage student departures.
                </p>
            </div>

            <div className="flex flex-col flex-1 min-h-0">
                {/* Form at the top */}
                <div className="shrink-0">
                    <SlcForm />
                </div>

                {/* List at the bottom */}
                <div className="flex-1 min-h-0 flex flex-col">
                    <SlcList initialSlcs={slcs} userRole={(await getCurrentUser())?.role || 'staff'} />
                </div>
            </div>
        </div>
    );
}
