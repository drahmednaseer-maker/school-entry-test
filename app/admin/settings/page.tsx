import { getSettings, getAllUsers, getCurrentUser } from '@/lib/actions';
import ThemeToggle from '@/components/ThemeToggle';
import SettingsTabs from '@/components/SettingsTabs';

export default async function SettingsPage() {
    const settings = await getSettings();
    const users = await getAllUsers();
    const currentUser = await getCurrentUser();

    return (
        <div className="flex-1 overflow-y-auto space-y-8 pb-10">
            {/* Premium Header Card */}
            <div className="rounded-3xl overflow-hidden shadow-lg border border-gray-100 dark:border-slate-800 shrink-0">
                <div className="p-8 text-white relative" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}>
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <ThemeToggle isPremium />
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                                <span className="text-2xl font-black">ST</span>
                            </div>
                            <div>
                                <p className="text-blue-200 text-xs font-black uppercase tracking-[0.2em] mb-1">Administrative Console</p>
                                <h1 className="text-4xl font-black mb-1 flex items-center gap-3">System Settings</h1>
                                <p className="text-blue-100/70 font-medium text-sm">Configure core parameters, AI intelligence, and administrative access levels.</p>
                            </div>
                        </div>
                        <div className="hidden md:block shrink-0"><ThemeToggle isPremium /></div>
                    </div>
                </div>
            </div>

            <SettingsTabs settings={settings} users={users} currentUser={currentUser} />
        </div>
    );
}
