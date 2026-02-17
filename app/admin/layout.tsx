import AdminLayout from '@/components/AdminLayout';
import { getSettings, getCurrentUser } from "@/lib/actions";

export default async function Layout({ children }: { children: React.ReactNode }) {
    const settings = await getSettings();
    const user = await getCurrentUser();

    return (
        <AdminLayout
            settings={settings}
            userRole={user?.role || null}
            username={user?.username || null}
        >
            {children}
        </AdminLayout>
    );
}
