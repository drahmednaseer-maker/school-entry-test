'use client';

import { startTest } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BookOpen } from 'lucide-react';

export default function Home() {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const res = await startTest(accessCode);

    if (res.success && res.sessionId) {
      router.push(`/test/${res.sessionId}`);
    } else {
      setError(res.error || 'Failed to start test');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-blue-600">
            <BookOpen size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">School Entry Test</h1>
          <p className="text-gray-500 mt-2">Enter your access code to begin</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Access Code
            </label>
            <input
              type="text"
              id="code"
              required
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center text-2xl tracking-widest uppercase font-mono"
              placeholder="123456"
              maxLength={6}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-transform active:scale-95"
          >
            Start Test
          </button>
        </form>

        <div className="text-center text-xs text-gray-400">
          <p>Mardan School System &copy; {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}
