'use client';

import { useTransition } from 'react';
import { toggleRegistration } from '@/lib/actions';

export default function RegisterCheckbox({ studentId, isRegistered }: { studentId: number; isRegistered: number }) {
    const [isPending, startTransition] = useTransition();

    function handleChange() {
        startTransition(async () => {
            const fd = new FormData();
            fd.set('student_id', String(studentId));
            await toggleRegistration(fd);
        });
    }

    return (
        <label
            className="flex items-center justify-center cursor-pointer"
            title={isRegistered ? 'Registered — click to undo' : 'Click to mark as registered'}
        >
            <input
                type="checkbox"
                checked={!!isRegistered}
                onChange={handleChange}
                disabled={isPending}
                className="sr-only"
            />
            <div
                className="w-5 h-5 rounded flex items-center justify-center border-2 transition-all"
                style={{
                    background: isRegistered ? 'var(--success)' : 'transparent',
                    borderColor: isRegistered ? 'var(--success)' : 'var(--border)',
                    opacity: isPending ? 0.5 : 1,
                }}
            >
                {isRegistered ? (
                    <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                        <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                ) : null}
            </div>
        </label>
    );
}
