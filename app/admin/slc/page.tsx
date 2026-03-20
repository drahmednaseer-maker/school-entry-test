import { getSlcs } from '@/lib/actions';
import SlcForm from '@/components/SlcForm';
import SlcList from '@/components/SlcList';
import { getCurrentUser } from '@/lib/actions';
import ThemeToggle from '@/components/ThemeToggle';

export const dynamic = 'force-dynamic';

export default async function SlcPage() {
    const slcs = await getSlcs();

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Premium Header Card */}
            <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 shrink-0 mb-6">
                <div className="p-7 text-white" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">Mardan Youth's Academy</p>
                            <h1 className="text-3xl font-black mb-1">SLC Management</h1>
                            <p className="text-blue-100/80 font-medium text-sm">Issue and record School Leaving Certificates securely</p>
                        </div>
                        <div className="hidden md:block shrink-0"><ThemeToggle isPremium /></div>
                    </div>
                </div>
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
