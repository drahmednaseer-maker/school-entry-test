'use client';

import { useTransition } from 'react';
import { toggleRegistration } from '@/lib/actions';

export default function RegisterCheckbox({ 
    studentId, 
    isRegistered, 
    admittedClass 
}: { 
    studentId: number; 
    isRegistered: number;
    admittedClass?: string | null;
}) {
    const [isPending, startTransition] = useTransition();

    function handleChange() {
        startTransition(async () => {
            const fd = new FormData();
            fd.set('student_id', String(studentId));
            await toggleRegistration(fd);
        });
    }

    const isIncomplete = !!(isRegistered && !admittedClass);

    return (
        <label
            className="flex items-center justify-center cursor-pointer group relative"
            title={isIncomplete 
                ? 'Registered but No Admitted Class assigned (Seat will NOT be deducted)' 
                : isRegistered ? 'Registered — click to undo' : 'Click to mark as registered'}
        >
            <input
                type="checkbox"
                checked={!!isRegistered}
                onChange={handleChange}
                disabled={isPending}
                className="sr-only"
            />
            <div
                className="w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all duration-200"
                style={{
                    background: isRegistered 
                        ? (isIncomplete ? 'rgba(245, 158, 11, 0.15)' : 'var(--primary)') 
                        : 'transparent',
                    borderColor: isRegistered 
                        ? (isIncomplete ? '#f59e0b' : 'var(--primary)') 
                        : 'var(--border)',
                    opacity: isPending ? 0.5 : 1,
                    boxShadow: isRegistered && !isIncomplete ? '0 0 10px rgba(37, 99, 235, 0.2)' : 'none'
                }}
            >
                {isRegistered ? (
                    <svg width="10" height="8" viewBox="0 0 11 9" fill="none" className="transform scale-110">
                        <path 
                            d="M1 4L4 7.5L10 1" 
                            stroke={isIncomplete ? '#f59e0b' : 'white'} 
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                        />
                    </svg>
                ) : null}
            </div>
            {isIncomplete && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-white shadow-sm ring-1 ring-amber-500/20" />
            )}
        </label>
    );
}

