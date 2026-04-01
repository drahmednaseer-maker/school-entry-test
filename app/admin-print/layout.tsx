import { getCurrentUser } from "@/lib/actions";
import { redirect } from "next/navigation";

export default async function PrintLayout({ children }: { children: React.ReactNode }) {
    const user = await getCurrentUser();
    
    // Safety check just in case middleware is bypassed
    if (!user) {
        redirect('/admin/login');
    }

    return (
        <div className="min-h-screen bg-white print-only-container">
            {children}
        </div>
    );
}
