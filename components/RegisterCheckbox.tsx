'use client';

import { useTransition } from 'react';
import { toggleRegistration } from '@/lib/actions';
import { useToast } from './Toast';

export default function RegisterCheckbox({ 
    studentId, 
    studentName,
    isRegistered, 
    admittedClass 
}: { 
    studentId: number; 
    studentName: string;
    isRegistered: number;
    admittedClass?: string | null;
}) {
    const [isPending, startTransition] = useTransition();
    const { showToast } = useToast();

    function handleChange() {
        startTransition(async () => {
            const fd = new FormData();
            fd.set('student_id', String(studentId));
            await toggleRegistration(fd);
            
            // Show toast message
            if (!isRegistered) {
                showToast(`Registered: ${studentName}`, 'success');
            } else {
                showToast(`Removed: ${studentName}`, 'info');
            }
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
                className="w-6 h-6 rounded-md flex items-center justify-center border-[2.5px] transition-all duration-200"
                style={{
                    background: isRegistered 
                        ? (isIncomplete ? 'rgba(245, 158, 11, 0.15)' : 'var(--primary)') 
                        : 'var(--bg-surface-2)',
                    // High-contrast dark blue outline for both states, but more intense for registered
                    borderColor: isRegistered 
                        ? (isIncomplete ? '#f59e0b' : '#1e3a8a') 
                        : '#64748b', // Darker gray-blue for better visibility in empty state
                    opacity: isPending ? 0.5 : 1,
                    boxShadow: isRegistered && !isIncomplete 
                        ? '0 0 12px rgba(30, 58, 138, 0.2)' 
                        : 'none'
                }}
            >
                {isRegistered ? (
                    <svg width="12" height="10" viewBox="0 0 11 9" fill="none" className="transform scale-110">
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
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-500 border-2 border-white shadow-sm ring-2 ring-amber-500/20" />
            )}
        </label>
    );
}
