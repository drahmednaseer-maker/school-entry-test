'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import clsx from 'clsx';

interface ThemeToggleProps {
    className?: string;
    isPremium?: boolean;
}

export default function ThemeToggle({ className = '', isPremium = false }: ThemeToggleProps) {
    const { theme, toggle } = useTheme();

    return (
        <button
            onClick={toggle}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
            className={clsx("relative rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95", className)}
            style={isPremium ? {
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
            } : {
                background: 'var(--bg-surface-2)',
                border: '1.5px solid var(--border)',
                color: 'var(--text-secondary)',
            }}
        >
            {theme === 'dark' ? (
                <Sun size={17} strokeWidth={2.2} />
            ) : (
                <Moon size={17} strokeWidth={2.2} />
            )}
        </button>
    );
}
