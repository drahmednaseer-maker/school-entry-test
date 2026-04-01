'use client';

import { useState, useRef, useEffect } from 'react';
import { Maximize, Minimize } from 'lucide-react';

export default function ResultFullscreenWrapper({ children }: { children: React.ReactNode }) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch((err) => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    return (
        <div ref={containerRef} className="relative flex-1 flex flex-col min-h-0" style={{ backgroundColor: 'var(--bg-page)' }}>
            <button
                onClick={toggleFullscreen}
                className="fixed bottom-6 right-6 z-[60] p-4 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 font-bold text-sm"
                style={{ 
                    background: isFullscreen ? 'var(--bg-surface)' : 'var(--primary)', 
                    color: isFullscreen ? 'var(--primary)' : 'white',
                    border: isFullscreen ? '2px solid var(--primary)' : 'none'
                }}
            >
                {isFullscreen ? (
                    <>
                        <Minimize size={20} />
                        Exit Full Screen
                    </>
                ) : (
                    <>
                        <Maximize size={20} />
                        View Full Screen
                    </>
                )}
            </button>
            <div className={isFullscreen ? "overflow-y-auto p-8 h-full" : ""}>
                {children}
            </div>
        </div>
    );
}
