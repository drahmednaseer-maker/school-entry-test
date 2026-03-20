'use client';

import React from 'react';
import { Printer, X, FileText, CheckCircle2 } from 'lucide-react';

interface AIAssessmentReportProps {
  studentName: string;
  classLevel: string;
  assessmentText: string;
  onClose: () => void;
}

export default function AIAssessmentReport({ studentName, classLevel, assessmentText, onClose }: AIAssessmentReportProps) {
  const handlePrint = () => {
    const printContent = document.getElementById('printable-report')?.innerHTML;
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(style => style.outerHTML)
      .join('\n');
      
    const printWindow = window.open('', '_blank');
    if (printWindow && printContent) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>AI Assessment Report - ${studentName}</title>
            ${styles}
            <style>
              body { background: white !important; margin: 0; padding: 20px; }
              @page { margin: 20mm; }
            </style>
          </head>
          <body onload="setTimeout(() => { window.print(); window.close(); }, 500)">
            <div class="max-w-4xl mx-auto bg-white p-8">
              ${printContent}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Parse sections from the markdown-like text
  // Looking for #### SECTION NAME: or similar
  const sections = assessmentText.split(/####\s*([\w\s]+):/i).filter(Boolean);
  
  const reportData: Record<string, string> = {};
  if (sections.length >= 2) {
    for (let i = 0; i < sections.length; i += 2) {
      const key = sections[i].toUpperCase().trim();
      const value = sections[i + 1]?.trim() || '';
      reportData[key] = value;
    }
  } else {
    // Fallback: If no sections found, treat whole text as General Discussion or just raw content
    reportData['ASSESSMENT DETAIL'] = assessmentText.replace(/####/g, '').trim();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">AI Academic Assessment</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Printer size={16} /> Print Report
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
          <div className="bg-white p-8 shadow-sm border border-gray-100 rounded-xl max-w-[800px] mx-auto" id="printable-report">
            {/* School Logo/Name placeholder */}
            <div className="text-center mb-6 border-b pb-4 border-gray-100">
              <h1 className="text-2xl font-black text-blue-900 tracking-tight">STUDENT PERFORMANCE EVALUATION</h1>
              <p className="text-sm text-gray-400 mt-1 uppercase font-bold tracking-widest leading-relaxed">Confidential Academic Assessment Report</p>
            </div>

            {/* Student Info Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-8 bg-gray-50/50 p-5 rounded-xl border border-gray-100">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Student Name</p>
                <p className="text-lg font-bold text-gray-900">{studentName}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Class Sought</p>
                <p className="text-lg font-bold text-gray-900">{classLevel}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Assessment Date</p>
                <p className="text-lg font-bold text-gray-900">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            {/* Assessment Sections */}
            <div className="space-y-6">
              {Object.entries(reportData).map(([title, content]) => (
                <section key={title} className="animate-in slide-in-from-bottom-2 duration-500" style={{ pageBreakInside: 'avoid' }}>
                  <h4 className="text-base font-black text-gray-900 border-b-2 border-blue-600 pb-2 mb-4 tracking-wide uppercase">
                    {title}
                  </h4>
                  <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {content}
                  </div>
                </section>
              ))}
            </div>

            {/* Footer Signatures */}
            <div className="mt-20 pt-10 border-t border-gray-100 grid grid-cols-2 gap-20" style={{ pageBreakInside: 'avoid' }}>
              <div className="text-center">
                <div className="w-full border-b border-gray-300 mb-2 h-10"></div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Exam Coordinator</p>
              </div>
              <div className="text-center">
                <div className="w-full border-b border-gray-300 mb-2 h-10"></div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Principal / Head Office</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
