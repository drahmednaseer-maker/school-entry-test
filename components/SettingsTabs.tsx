'use client';

import { useState } from 'react';
import { AISettingsForm, SystemSettingsForm, Settings } from './GeneralSettingsForm';
import UserManagement from './UserManagement';
import { LayoutGrid, Cpu, UserCog } from 'lucide-react';
import clsx from 'clsx';

interface SettingsTabsProps {
    settings: Settings;
    users: any[];
    currentUser: any;
}

export default function SettingsTabs({ settings, users, currentUser }: SettingsTabsProps) {
    const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'users'>('general');

    const tabs = [
        { id: 'general', label: 'General Configuration', icon: LayoutGrid, description: 'School identity & test parameters' },
        { id: 'ai', label: 'AI Intelligence', icon: Cpu, description: 'Model selection & API orchestration' },
        { id: 'users', label: 'Security & Access', icon: UserCog, description: 'Administrative account management' },
    ];

    return (
        <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-72 shrink-0 space-y-2">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={clsx(
                                "w-full text-left p-4 rounded-2xl transition-all duration-200 border-2 flex items-center gap-4 group",
                                isActive 
                                    ? "st-surface border-blue-500 shadow-md ring-4 ring-blue-50 dark:ring-blue-900/20" 
                                    : "border-transparent hover:bg-white/50 dark:hover:bg-white/5"
                            )}
                        >
                            <div className={clsx(
                                "p-2.5 rounded-xl transition-colors shrink-0",
                                isActive ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white"
                            )}>
                                <Icon size={20} />
                            </div>
                            <div className="min-w-0">
                                <p className={clsx("text-sm font-black truncate", isActive ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200")}>{tab.label}</p>
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 truncate uppercase tracking-tighter">{tab.description}</p>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="flex-1 w-full min-w-0">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeTab === 'general' && <SystemSettingsForm initialSettings={settings} />}
                    {activeTab === 'ai' && <AISettingsForm initialSettings={settings} />}
                    {activeTab === 'users' && <UserManagement users={users} currentUsername={currentUser?.username || null} />}
                </div>
            </div>
        </div>
    );
}
