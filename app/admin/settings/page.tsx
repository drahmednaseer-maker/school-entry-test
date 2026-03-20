import { getSettings, getAllUsers, getCurrentUser } from '@/lib/actions';
import { AISettingsForm, SystemSettingsForm } from '@/components/GeneralSettingsForm';
import UserManagement from '@/components/UserManagement';
import ThemeToggle from '@/components/ThemeToggle';

export default async function SettingsPage() {
    const settings = await getSettings();
    const users = await getAllUsers();
    const currentUser = await getCurrentUser();

    return (
        <div className="flex-1 overflow-y-auto space-y-6 pb-10">
            {/* Premium Header Card */}
            <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 shrink-0">
                <div className="p-7 text-white" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-5">
                            <div>
                                <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">Mardan Youth's Academy</p>
                                <h1 className="text-3xl font-black mb-1">System Settings</h1>
                                <p className="text-blue-100/80 font-medium text-sm">Manage configuration, Artificial Intelligence features, and access control.</p>
                            </div>
                        </div>
                        <div className="hidden md:block shrink-0"><ThemeToggle isPremium /></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* LEFT SIDE: AI CONFIGURATION */}
                <AISettingsForm initialSettings={settings} />

                {/* RIGHT SIDE: SYSTEM & USER MANAGEMENT */}
                <div className="space-y-8">
                    <SystemSettingsForm initialSettings={settings} />
                    <UserManagement users={users} currentUsername={currentUser?.username || null} />
                </div>
            </div>
        </div>
    );
}
