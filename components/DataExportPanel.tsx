'use client';

import { useState } from 'react';
import { Download, Database, Image, FileJson, CheckCircle2, Loader2, AlertCircle, Package } from 'lucide-react';

const EXPORT_ITEMS = [
  { icon: FileJson, label: 'Questions Bank', desc: 'All MCQs with options, difficulty & class levels', color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20' },
  { icon: Database, label: 'Student Records', desc: 'Names, access codes, scores & admission data', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { icon: Database, label: 'Test Sessions', desc: 'All test attempts with answers & timestamps', color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
  { icon: Database, label: 'Sessions & Seats', desc: 'Academic sessions and seat allocations', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { icon: Database, label: 'SLC Records', desc: 'School Leaving Certificates issued', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  { icon: Database, label: 'System Settings', desc: 'School name, test parameters & AI config', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
  { icon: Image, label: 'Student Photos & Images', desc: 'All uploaded images and question media', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
];

type ExportStatus = 'idle' | 'loading' | 'success' | 'error';

export default function DataExportPanel() {
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [progress, setProgress] = useState('');

  const handleExport = async () => {
    setStatus('loading');
    setProgress('Preparing export...');
    setErrorMsg('');

    try {
      setProgress('Collecting database records...');
      const res = await fetch('/api/export');
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(data.error || `Server error ${res.status}`);
      }

      setProgress('Compressing files...');
      const blob = await res.blob();

      // Extract filename from Content-Disposition header
      const disposition = res.headers.get('Content-Disposition') || '';
      const match = disposition.match(/filename="(.+?)"/);
      const filename = match ? match[1] : 'snap-test-export.zip';

      setProgress('Downloading...');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setStatus('success');
      setTimeout(() => setStatus('idle'), 4000);
    } catch (err: any) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="st-surface rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-blue-600 text-white shrink-0">
            <Package size={24} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Full System Export</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Downloads a single <span className="font-bold text-slate-700 dark:text-slate-300">.zip</span> archive containing all your data and uploaded files — ready for backup or migration. User accounts are excluded for security.
            </p>
          </div>
        </div>
      </div>

      {/* What's included */}
      <div className="st-surface rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 pt-5 pb-3 border-b border-gray-100 dark:border-slate-700">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">What's Included</p>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-slate-800">
          {EXPORT_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className={`p-2 rounded-lg ${item.bg} shrink-0`}>
                  <Icon size={16} className={item.color} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.label}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{item.desc}</p>
                </div>
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 ml-auto" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Status messages */}
      {status === 'success' && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-5 py-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Export downloaded successfully! Check your downloads folder.</p>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-5 py-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <AlertCircle size={20} className="text-red-600 dark:text-red-400 shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-700 dark:text-red-300">Export failed</p>
            <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Export button */}
      <button
        id="export-all-data-btn"
        onClick={handleExport}
        disabled={status === 'loading'}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black text-base shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-[0.98] transition-all duration-200 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            <span>{progress}</span>
          </>
        ) : (
          <>
            <Download size={20} />
            <span>Export All Data as ZIP</span>
          </>
        )}
      </button>

      <p className="text-center text-xs text-slate-400 dark:text-slate-500">
        Large exports may take a few seconds. Do not close the browser tab during export.
      </p>
    </div>
  );
}
