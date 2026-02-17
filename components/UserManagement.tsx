'use client';

import { updatePassword } from '@/lib/actions';
import { useRef, useState, useEffect } from 'react';


interface User {
    id: number;
    username: string;
    role: string;
}

interface UserManagementProps {
    users: User[];
    currentUsername: string | null;
}

export default function UserManagement({ users, currentUsername }: UserManagementProps) {
    const formRef = useRef<HTMLFormElement>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);



    const [selectedUsername, setSelectedUsername] = useState<string>(currentUsername || (users.length > 0 ? users[0].username : ''));

    useEffect(() => {
        if (currentUsername && !selectedUsername) setSelectedUsername(currentUsername);
    }, [currentUsername, selectedUsername]);

    async function handleSubmit(formData: FormData) {
        setMessage(null);
        // Ensure the selected username is included if the select is showing
        if (!formData.has('username') && selectedUsername) {
            formData.append('username', selectedUsername);
        }

        const res = await updatePassword(null, formData);

        if (res.success) {
            setMessage({ type: 'success', text: res.success });
            formRef.current?.reset();
        } else if (res.error) {
            setMessage({ type: 'error', text: res.error as string });
        }
    }

    const isOwnAccount = selectedUsername === currentUsername;

    return (
        <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <h3 className="text-xl font-bold mb-4">User Password Management</h3>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Select User to Manage</label>
                <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                    value={selectedUsername}
                    onChange={(e) => setSelectedUsername(e.target.value)}
                >
                    {users.map(user => (
                        <option key={user.id} value={user.username}>
                            {user.username} ({user.role})
                        </option>
                    ))}
                </select>
            </div>

            <form ref={formRef} action={handleSubmit} className="space-y-4">
                <input type="hidden" name="username" value={selectedUsername} />

                {isOwnAccount && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Current Password</label>
                        <input
                            name="current_password"
                            type="password"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                        />
                    </div>
                )}

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
                    Update Password for {selectedUsername}
                </button>
            </form>
        </div>
    );
}
