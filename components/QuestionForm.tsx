'use client';

import { addQuestion, updateQuestion } from '@/lib/actions';
import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

interface QuestionFormProps {
    initialData?: any;
    onCancel?: () => void;
}

export default function QuestionForm({ initialData, onCancel }: QuestionFormProps) {
    const formRef = useRef<HTMLFormElement>(null);
    const [removeImage, setRemoveImage] = useState(false);

    useEffect(() => {
        if (initialData && formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [initialData]);

    async function handleSubmit(formData: FormData) {
        if (initialData) {
            formData.append('id', initialData.id.toString());
            if (removeImage) formData.append('remove_image', 'true');
            const res = await updateQuestion(formData);
            if (res.success) {
                alert('Question updated successfully!');
                if (onCancel) onCancel();
            } else {
                alert('Error updating question');
            }
        } else {
            const res = await addQuestion(formData);
            if (res.success) {
                alert('Question added successfully!');
                formRef.current?.reset();
            } else {
                alert('Error adding question');
            }
        }
    }

    const options = initialData ? JSON.parse(initialData.options) : ['', '', '', ''];

    return (
        <form ref={formRef} action={handleSubmit} className="bg-white p-6 rounded-xl shadow-md space-y-4 border-2 border-transparent focus-within:border-blue-100 transition-all">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{initialData ? 'Edit Question' : 'Add New Question'}</h3>
                {initialData && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600 p-1"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <select name="subject" defaultValue={initialData?.subject || 'English'} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                        <option value="English">English</option>
                        <option value="Urdu">Urdu</option>
                        <option value="Math">Math</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                    <select name="difficulty" defaultValue={initialData?.difficulty || 'Easy'} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Class Level</label>
                    <select name="class_level" defaultValue={initialData?.class_level || 'Grade 1'} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                        <option value="PlayGroup">PlayGroup</option>
                        <option value="KG 1">KG 1</option>
                        <option value="KG 2">KG 2</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                            <option key={i} value={`Grade ${i}`}>Grade {i}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Image (Optional)</label>
                    <input type="file" name="image" accept="image/*" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                </div>
            </div>

            {initialData?.image_path && !removeImage && (
                <div className="flex items-center gap-4 p-2 bg-gray-50 rounded-lg">
                    <div className="relative w-16 h-16 border rounded overflow-hidden">
                        <Image src={initialData.image_path} alt="Current" fill className="object-cover" />
                    </div>
                    <button
                        type="button"
                        onClick={() => setRemoveImage(true)}
                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                    >
                        Remove current image
                    </button>
                </div>
            )}

            {removeImage && (
                <div className="text-xs text-amber-600 font-medium flex items-center gap-1">
                    Image will be removed on update.
                    <button type="button" onClick={() => setRemoveImage(false)} className="underline">Undo</button>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700">Question Text</label>
                <textarea name="question_text" defaultValue={initialData?.question_text || ''} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                {[0, 1, 2, 3].map((i) => (
                    <div key={i}>
                        <label className="block text-sm font-medium text-gray-700">Option {i + 1}</label>
                        <input type="text" name={`option_${i}`} defaultValue={options[i] || ''} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                    </div>
                ))}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Correct Option</label>
                <select name="correct_option" defaultValue={initialData?.correct_option || '0'} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                    <option value="0">Option 1</option>
                    <option value="1">Option 2</option>
                    <option value="2">Option 3</option>
                    <option value="3">Option 4</option>
                </select>
            </div>

            <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-semibold shadow-sm">
                    {initialData ? 'Update Question' : 'Add Question'}
                </button>
                {initialData && (
                    <button type="button" onClick={onCancel} className="bg-gray-100 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-200 transition-colors font-medium">
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}
