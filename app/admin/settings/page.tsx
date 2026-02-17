import { getSettings, getAllUsers } from '@/lib/actions';
import GeneralSettingsForm from '@/components/GeneralSettingsForm';
import UserManagement from '@/components/UserManagement';

export default async function SettingsPage() {
    const settings = await getSettings();
    const users = await getAllUsers();

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">Admin Settings</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <GeneralSettingsForm initialSettings={settings} />
                <UserManagement users={users} />
            </div>
        </div>
    );
}
