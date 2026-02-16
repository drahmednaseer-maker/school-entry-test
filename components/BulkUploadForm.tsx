'use client';

import { uploadBulkQuestions } from '@/lib/actions';
import { useRef, useState } from 'react';
import { Upload, Download, AlertCircle, CheckCircle } from 'lucide-react';

export default function BulkUploadForm() {
    const formRef = useRef<HTMLFormElement>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsUploading(true);
        setMessage(null);

        // Server action handles file upload
        const res = await uploadBulkQuestions(formData);

        setIsUploading(false);
        if (res.success) {
            setMessage({ type: 'success', text: `Successfully uploaded ${res.count} questions!` });
            formRef.current?.reset();
        } else {
            setMessage({ type: 'error', text: res.error as string || 'Failed to upload questions' });
        }
    }

    function handleDownloadTemplate() {
        const templateContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Question Template</title></head>
      <body>
      <table border="1">
        <thead>
          <tr>
            <th>Subject</th>
            <th>Difficulty</th>
            <th>Question</th>
            <th>Option 1</th>
            <th>Option 2</th>
            <th>Option 3</th>
            <th>Option 4</th>
            <th>Correct Option (1-4)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>English</td>
            <td>Easy</td>
            <td>Example Question?</td>
            <td>Opt A</td>
            <td>Opt B</td>
            <td>Opt C</td>
            <td>Opt D</td>
            <td>1</td>
          </tr>
        </tbody>
      </table>
      </body></html>
    `;

        const blob = new Blob([templateContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Question_Template.doc';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Bulk Upload</h3>
                <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                >
                    <Download size={16} />
                    <span>Download Template</span>
                </button>
            </div>

            <form ref={formRef} action={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Target Class</label>
                    <select name="class_level" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                        <option value="PlayGroup">PlayGroup</option>
                        <option value="KG 1">KG 1</option>
                        <option value="KG 2">KG 2</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                            <option key={i} value={`Grade ${i}`}>Grade {i}</option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500">All questions in the file will be assigned to this class.</p>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                    <label className="flex flex-col items-center cursor-pointer">
                        <Upload className="h-12 w-12 text-gray-400" />
                        <span className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500">Select Word File</span>
                        <input name="file" type="file" className="hidden" accept=".docx,.doc" required />
                        <span className="text-xs text-gray-500 mt-1">.docx only</span>
                    </label>
                </div>

                {message && (
                    <div className={`p-3 rounded-md flex items-center space-x-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        <span className="text-sm">{message.text}</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isUploading}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                    {isUploading ? 'Uploading...' : 'Upload Questions'}
                </button>
            </form>

            <div className="bg-gray-50 p-3 rounded-md text-xs text-gray-500">
                <p className="font-semibold mb-1">Format Guide:</p>
                <p>Ensure your Word document contains a table with 8 columns: Subject, Difficulty, Question, Options 1-4, Correct Answer (Number).</p>
            </div>
        </div>
    );
}
