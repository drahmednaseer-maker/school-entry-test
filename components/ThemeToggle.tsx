'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface ThemeToggleProps {
    className?: string;
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
    const { theme, toggle } = useTheme();

    return (
        <button
            onClick={toggle}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
            className={`relative w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${className}`}
            style={{
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
