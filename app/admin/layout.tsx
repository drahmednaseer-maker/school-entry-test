import AdminLayout from '@/components/AdminLayout';
import { getSettings } from '@/lib/actions';

export default async function Layout({ children }: { children: React.ReactNode }) {
    const settings = await getSettings();
    return <AdminLayout schoolName={settings.school_name}>{children}</AdminLayout>;
}
