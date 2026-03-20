'use client';

import { useState } from 'react';
import { Shield, X, Check, Loader2, AlertCircle } from 'lucide-react';
import { verifyMasterPassword } from '@/lib/actions';

interface MasterPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    title?: string;
    description?: string;
}

export default function MasterPasswordModal({ 
    isOpen, 
    onClose, 
    onSuccess, 
    title = "Authentication Required",
    description = "Please enter the master password to perform this restricted action."
}: MasterPasswordModalProps) {
    const [password, setPassword] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsVerifying(true);

        try {
            const isValid = await verifyMasterPassword(password);
            if (isValid) {
                onSuccess();
                onClose();
                setPassword('');
            } else {
                setError('Invalid master password. Please try again.');
            }
        } catch (err) {
            setError('Verification failed. Please check your connection.');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface-2)' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-500">
                            <Shield size={22} />
                        </div>
                        <div>
                            <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                            <p className="text-[10px] uppercase font-black tracking-widest opacity-50">Master Security</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-black/5 transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {description}
                    </p>

                    <div className="space-y-1.5">
                        <div className="relative">
                            <input
                                autoFocus
                                type="password"
                                placeholder="Enter master password..."
                                className={`st-input w-full py-3 text-center text-lg tracking-[0.5em] font-mono ${error ? 'border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.2)]' : ''}`}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (error) setError(null);
                                }}
                                required
                                disabled={isVerifying}
                            />
                        </div>
                        {error && (
                            <div className="flex items-center gap-1.5 text-red-500 animate-in slide-in-from-top-2 duration-200">
                                <AlertCircle size={14} />
                                <span className="text-xs font-medium">{error}</span>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="st-btn-ghost flex-1 py-3 text-sm font-bold"
                            disabled={isVerifying}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isVerifying || !password}
                            className="st-btn-primary flex-1 py-3 text-sm font-bold shadow-lg shadow-blue-500/20"
                        >
                            {isVerifying ? (
                                <Loader2 size={18} className="animate-spin mx-auto" />
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <Check size={18} />
                                    Confirm
                                </div>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
