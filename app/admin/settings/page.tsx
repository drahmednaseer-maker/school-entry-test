import { getSettings, getAllUsers, getCurrentUser, getSessions } from '@/lib/actions';
import GeneralSettingsForm from '@/components/GeneralSettingsForm';
import UserManagement from '@/components/UserManagement';
import SessionManager from '@/components/SessionManager';
import SessionSeats from '@/components/SessionSeats';

export default async function SettingsPage() {
    const settings = await getSettings();
    const users = await getAllUsers();
    const currentUser = await getCurrentUser();
    const sessions = await getSessions();

    return (
        <div className="flex-1 overflow-y-auto space-y-8">
            <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Admin Settings</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <GeneralSettingsForm initialSettings={settings} />
                <UserManagement users={users} currentUsername={currentUser?.username || null} />
            </div>

            <SessionManager sessions={sessions} />
            <SessionSeats sessions={sessions} />
        </div>
    );
}
