'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2, AlertCircle, FileText } from 'lucide-react';
import { getAIResultAssessment } from '@/lib/actions';
import AIAssessmentReport from './AIAssessmentReport';

interface AIAssessmentProps {
  studentId: number;
  studentName: string;
  classLevel: string;
  activeProvider: string;
}

export default function AIAssessment({ studentId, studentName, classLevel, activeProvider }: AIAssessmentProps) {
  const [loading, setLoading] = useState(false);
  const [loadingMode, setLoadingMode] = useState<'standard' | 'detailed' | null>(null);
  const [assessment, setAssessment] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  const handleGenerate = async (mode: 'standard' | 'detailed' = 'standard') => {
    setLoading(true);
    setLoadingMode(mode);
    setError(null);
    try {
      const res = await getAIResultAssessment(studentId, mode);
      if (res.error) {
        setError(res.error);
      } else if (res.assessment) {
        setAssessment(res.assessment);
        setShowReport(true);
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please check your connection.');
    } finally {
      setLoading(false);
      setLoadingMode(null);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-100 shadow-sm relative overflow-hidden group">
        {/* Background spark decorative */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl group-hover:bg-blue-300/30 transition-all duration-700"></div>
        
        <div className="flex items-center gap-4 relative z-10 w-full justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Sparkles size={24} className={loading ? "animate-pulse" : ""} />
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-xl tracking-tight">{activeProvider.toUpperCase()}</h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {assessment && !loading && (
              <button 
                onClick={() => setShowReport(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm shrink-0"
              >
                <FileText size={18} /> View Last Report
              </button>
            )}
            
            <button
              onClick={() => handleGenerate('standard')}
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shrink-0 active:scale-95 ${
                loading 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200" 
                  : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200"
              }`}
            >
              {loading && loadingMode === 'standard' ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  AI Assessment
                </>
              )}
            </button>

            <button
              onClick={() => handleGenerate('detailed')}
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shrink-0 active:scale-95 ${
                loading 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200" 
                  : "bg-purple-600 text-white hover:bg-purple-700 hover:shadow-purple-200 border border-purple-500"
              }`}
            >
              {loading && loadingMode === 'detailed' ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Deep Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Detailed AI Assessment
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 w-full p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-700 text-sm font-medium animate-in slide-in-from-top-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}
      </div>

      {showReport && assessment && (
        <AIAssessmentReport 
          studentName={studentName}
          classLevel={classLevel}
          assessmentText={assessment}
          onClose={() => setShowReport(false)}
        />
      )}
    </>
  );
}
