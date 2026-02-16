'use client';

import { generateStudentCode } from '@/lib/actions';
import { useRef, useState } from 'react';

export default function StudentForm() {
    const formRef = useRef<HTMLFormElement>(null);
    const [lastCode, setLastCode] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        const name = formData.get('name') as string;
        const fatherName = formData.get('father_name') as string;
        const classLevel = formData.get('class_level') as string;

        const res = await generateStudentCode(name, fatherName, classLevel);

        if (res.success && res.code) {
            setLastCode(res.code);
            formRef.current?.reset();
        } else {
            alert('Error generating code');
        }
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <h3 className="text-xl font-bold mb-4">Generate Student Code</h3>

            <form ref={formRef} action={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Student Name</label>
                    <input type="text" name="name" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Father's Name</label>
                    <input type="text" name="father_name" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Class / Grade</label>
                    <select name="class_level" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                        <option value="PlayGroup">PlayGroup</option>
                        <option value="Nursery">Nursery</option>
                        <option value="Prep">Prep</option>
                        <option value="Grade 1">Grade 1</option>
                        <option value="Grade 2">Grade 2</option>
                        <option value="Grade 3">Grade 3</option>
                        <option value="Grade 4">Grade 4</option>
                        <option value="Grade 5">Grade 5</option>
                        <option value="Grade 6">Grade 6</option>
                        <option value="Grade 7">Grade 7</option>
                        <option value="Grade 8">Grade 8</option>
                        <option value="Grade 9">Grade 9</option>
                        <option value="Grade 10">Grade 10</option>
                    </select>
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                    Generate Code
                </button>
            </form>

            {lastCode && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md text-center">
                    <p className="text-sm text-green-800">Code Generated Successfully:</p>
                    <p className="text-3xl font-mono font-bold text-green-900 tracking-wider type-all-small-caps">{lastCode}</p>
                </div>
            )}
        </div>
    );
}
