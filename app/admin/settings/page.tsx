import { getSettings, getAllUsers, getCurrentUser } from '@/lib/actions';
import { AISettingsForm, SystemSettingsForm } from '@/components/GeneralSettingsForm';
import UserManagement from '@/components/UserManagement';

export default async function SettingsPage() {
    const settings = await getSettings();
    const users = await getAllUsers();
    const currentUser = await getCurrentUser();

    return (
        <div className="flex-1 overflow-y-auto space-y-6 pb-10">
            <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard Settings</h2>

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
