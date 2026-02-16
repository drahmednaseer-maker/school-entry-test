'use client';

import { updatePassword } from '@/lib/actions';
import { useRef, useState } from 'react';

export default function UpdatePasswordForm() {
    const formRef = useRef<HTMLFormElement>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    async function handleSubmit(formData: FormData) {
        setMessage(null);
        const res = await updatePassword(null, formData);

        if (res.success) {
            setMessage({ type: 'success', text: res.success });
            formRef.current?.reset();
        } else if (res.error) {
            setMessage({ type: 'error', text: res.error as string });
        }
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-md max-w-md">
            <h3 className="text-xl font-bold mb-4">Change Password</h3>

            <form ref={formRef} action={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Current Password</label>
                    <input
                        name="current_password"
                        type="password"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                    <input
                        name="new_password"
                        type="password"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                    <input
                        name="confirm_password"
                        type="password"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                    />
                </div>

                {message && (
                    <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                    Update Password
                </button>
            </form>
        </div>
    );
}
