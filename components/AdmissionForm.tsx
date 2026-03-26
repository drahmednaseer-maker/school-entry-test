'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveAdmissionForm, createFullStudent } from '@/lib/actions';
import { 
    Save, ArrowLeft, Camera, Upload, Phone, Calendar, User, Printer, CheckCircle2, XCircle, Loader2, MapPin, Ticket
} from 'lucide-react';
import { PAKISTAN_GEO, COUNTRIES } from '@/lib/pakistan-geo';
import WebcamCapture from './WebcamCapture';

interface Student {
    id: number;
    name: string;
    father_name: string;
    father_mobile: string;
    class_level: string;
    gender: string;
    photo?: string;
    dob?: string;
    guardian_name?: string;
    father_cnic?: string;
    previous_school?: string;
    previous_class?: string;
    slc_no?: string;
    slc_date?: string;
    reason_for_leaving?: string;
    admission_class?: string;
    occupation?: string;
    country?: string;
    province?: string;
    district?: string;
    tehsil?: string;
    city?: string;
    street_address?: string;
    contact1_name?: string;
    contact1_phone?: string;
    contact1_whatsapp?: number;
    contact2_name?: string;
    contact2_phone?: string;
    contact2_whatsapp?: number;
    contact3_name?: string;
    contact3_phone?: string;
    contact3_whatsapp?: number;
    reg_no?: string;
    date_of_test?: string;
    date_of_admission?: string;
    status?: string;
    score?: number;
    admitted_class?: string;
    system_test_date?: string;
    // International WhatsApp support
    is_intl_wa?: boolean;
    intl_wa_name?: string;
    intl_wa_phone?: string;
    intl_wa_country?: string;
    intl_wa_verified?: number;
    admin_notes?: string;
}

const CLASSES = ['PlayGroup', 'KG 1', 'KG 2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];

// --- Basic Country Code Map ---
const COUNTRY_CODES: { [key: string]: string } = {
    '1': 'United States / Canada',
    '44': 'United Kingdom',
    '971': 'United Arab Emirates',
    '966': 'Saudi Arabia',
    '9af': 'Afghanistan',
    '91': 'India',
    '880': 'Bangladesh',
    '86': 'China',
    '90': 'Turkey',
    '49': 'Germany',
    '33': 'France',
    '61': 'Australia',
    '60': 'Malaysia',
    '65': 'Singapore',
    '92': 'Pakistan'
};

// --- Helper: Format CNIC (XXXXX-XXXXXXX-X) ---
function formatCnic(value: string): string {
    const digits = value.replace(/\D/g, '');
    let formatted = '';
    for (let i = 0; i < digits.length && i < 13; i++) {
        if (i === 5 || i === 12) formatted += '-';
        formatted += digits[i];
    }
    return formatted;
}

// --- Helper: Format Phone (03XX XXXXXXX) ---
function formatPhone(value: string): string {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 4) return digits;
    return `${digits.slice(0, 4)} ${digits.slice(4, 11)}`;
}

// --- Helper: Date to Words ---
function dateToWords(dateStr: string): string {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '';

        const days = [
            '', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth',
            'Eleventh', 'Twelfth', 'Thirteenth', 'Fourteenth', 'Fifteenth', 'Sixteenth', 'Seventeenth', 'Eighteenth', 'Nineteenth', 'Twentieth',
            'Twenty First', 'Twenty Second', 'Twenty Third', 'Twenty Fourth', 'Twenty Fifth', 'Twenty Sixth', 'Twenty Seventh', 'Twenty Eighth', 'Twenty Ninth', 'Thirtieth', 'Thirty First'
        ];

        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const numToWords = (num: number): string => {
            const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
            const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
            const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

            if (num < 10) return ones[num];
            if (num < 20) return teens[num - 10];
            if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
            
            if (num < 1000) {
                return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' and ' + numToWords(num % 100) : '');
            }

            if (num < 1000000) {
                return numToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + numToWords(num % 1000) : '');
            }

            return num.toString();
        };

        const day = days[date.getDate()];
        const month = months[date.getMonth()];
        const year = numToWords(date.getFullYear());

        return `${day} ${month} ${year}`;
    } catch {
        return '';
    }
}

export default function AdmissionForm({ student }: { student?: Student }) {
    const router = useRouter();
    const [formData, setFormData] = useState<Partial<Student>>(() => {
        if (!student) return { country: 'Pakistan', reg_no: '000000' };
        
        const initial = { ...student };
        if (student.system_test_date && !initial.date_of_test) {
            const dateOnly = student.system_test_date.includes('T') 
                ? student.system_test_date.split('T')[0] 
                : student.system_test_date.split(' ')[0];
            initial.date_of_test = dateOnly;
        }
        if (!initial.admission_class) {
            initial.admission_class = student.class_level;
        }
        if (!initial.reg_no) {
            initial.reg_no = '000000';
        }
        return initial;
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [showWebcam, setShowWebcam] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);


    // Form Initialization logic
    useEffect(() => {
        // Any required side effects
    }, []);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Student) => {
        const formatted = formatPhone(e.target.value);
        setFormData(prev => ({ ...prev, [field]: formatted }));
    };

    const handleIntlPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^\d+]/g, '');
        setFormData(prev => ({ ...prev, intl_wa_phone: raw }));
        
        // Detect country
        if (raw.startsWith('+')) {
            const code = raw.slice(1, 4);
            const found = Object.keys(COUNTRY_CODES).find(c => code.startsWith(c));
            if (found) {
                setFormData(prev => ({ ...prev, intl_wa_country: COUNTRY_CODES[found] }));
            } else {
                 setFormData(prev => ({ ...prev, intl_wa_country: 'Unknown' }));
            }
        } else {
            setFormData(prev => ({ ...prev, intl_wa_country: undefined }));
        }
    };

    // Cascading options
    const provinces = Object.keys(PAKISTAN_GEO);
    const districts = formData.province ? Object.keys(PAKISTAN_GEO[formData.province]?.districts || {}) : [];
    const tehsils = (formData.province && formData.district) ? PAKISTAN_GEO[formData.province].districts[formData.district]?.tehsils || [] : [];


    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, photo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus('idle');
        setGeneratedCode(null);
        try {
            if (student?.id) {
                // Update mode
                const res = await saveAdmissionForm(student.id, formData);
                if (res.success) {
                    setSaveStatus('success');
                    setTimeout(() => router.push('/admin/students'), 1500);
                } else {
                    setSaveStatus('error');
                }
            } else {
                // Create mode
                const res = await createFullStudent(formData);
                if (res.success) {
                    setSaveStatus('success');
                    setGeneratedCode(res.code || null);
                    // Stay on page to show code or redirect later
                    setTimeout(() => router.push('/admin/students'), 3000);
                } else {
                    setSaveStatus('error');
                }
            }
        } catch {
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-2 md:p-4 space-y-3 pb-8">
            <PrintTemplate formData={formData} dateToWords={dateToWords} />
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => router.back()}
                        className="p-2 rounded-xl bg-white border border-gray-100 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <h1 className="text-base font-black text-blue-900 leading-tight">
                            {student ? 'Digital Admission Form' : 'New Student Admission'}
                        </h1>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter leading-none mt-0.5">
                            {student ? `Student ID: ${student.id}` : 'Registration Process'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto print-hidden">
                    <button
                        onClick={handlePrint}
                        className="flex-1 md:flex-none st-btn-ghost flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-200 bg-white"
                    >
                        <Printer size={18} />
                        Print Form
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 md:flex-none st-btn-primary flex items-center justify-center gap-2 px-8 py-2.5"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {isSaving ? 'Saving...' : 'Save Admission Form'}
                    </button>
                </div>
            </div>

            {/* Success/Error Toast */}
            {saveStatus === 'success' && (
                <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 size={20} /> 
                        <span>
                            {generatedCode 
                                ? `Success! Student registered. Access Code: ${generatedCode}`
                                : 'Admission form saved successfully! Redirecting...'}
                        </span>
                    </div>
                    {generatedCode && (
                         <div className="flex items-center gap-2 bg-green-200/50 px-3 py-1 rounded-lg">
                            <Ticket size={14} className="text-green-800" />
                            <span className="font-mono font-black text-lg text-green-900 tracking-wider">
                                {generatedCode}
                            </span>
                        </div>
                    )}
                </div>
            )}
            {saveStatus === 'error' && (
                <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <XCircle size={20} /> Error saving form. Please check your connection.
                </div>
            )}

            {/* Form Container */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden" 
                 style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                {/* Visual Header */}
                <div className="p-4 md:p-6 border-b relative" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        {/* Logo Wrapper */}
                        <div className="w-16 h-16 bg-transparent flex items-center justify-center shrink-0">
                            <img src="/logo.png" alt="MYA Logo" className="w-full h-full object-contain" />
                        </div>
                        
                        {/* Title Section */}
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>
                                Admission Form
                            </h1>
                            <div className="h-1 w-12 bg-blue-600 rounded-full mx-auto md:mx-0 my-1"></div>
                            <p className="text-lg font-bold text-blue-800">MARDAN YOUTH’S ACADEMY</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold opacity-70">Opposite Abdul Wali Khan University, Garden Campus, Toru Road, Mardan</p>
                        </div>

                        {/* Reg No Field */}
                        <div className="w-full md:w-40 space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Reg No.</label>
                            <input 
                                type="text"
                                value={formData.reg_no || ''}
                                onChange={e => setFormData(prev => ({ ...prev, reg_no: e.target.value }))}
                                className="w-full st-input font-mono font-bold text-center text-base py-2 border-2"
                                placeholder="000000"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4 md:p-6 space-y-8">
                    {/* TOP SECTION: Photo & Dates */}
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Photo Column */}
                        <div className="w-full lg:w-1/4 flex flex-col items-center gap-4">
                            <div className="relative group">
                                <div className="w-40 h-48 border-4 border-dashed border-gray-200 rounded-2xl overflow-hidden flex items-center justify-center bg-gray-50 relative transition-all group-hover:border-blue-400">
                                    {formData.photo ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={formData.photo} alt="Student" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center p-4">
                                            <User size={48} className="text-gray-300 mx-auto mb-2" />
                                            <p className="text-xs font-bold text-gray-400">No Photo Available</p>
                                        </div>
                                    )}
                                    
                                    {/* Photo Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <button 
                                            onClick={() => setShowWebcam(true)}
                                            className="p-3 bg-white rounded-full text-blue-600 hover:scale-110 transition-transform shadow-lg"
                                            title="Take Photo"
                                        >
                                            <Camera size={20} />
                                        </button>
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-3 bg-white rounded-full text-blue-600 hover:scale-110 transition-transform shadow-lg"
                                            title="Upload Photo"
                                        >
                                            <Upload size={20} />
                                        </button>
                                    </div>
                                </div>
                                <div className="absolute -bottom-3 -right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-lg">
                                    Student Photo
                                </div>
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handlePhotoUpload} 
                            />
                            <p className="text-[10px] text-gray-400 uppercase font-black text-center leading-tight">
                                Max size 5MB. Support JPG, PNG.
                            </p>
                        </div>

                        {/* Entry Dates Column */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                            <div className="space-y-1">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 leading-none">
                                    <Calendar size={12} className="text-blue-500" /> Date on which tested
                                </label>
                                <input 
                                    type="date" 
                                    value={formData.date_of_test || ''}
                                    onChange={e => setFormData(prev => ({ ...prev, date_of_test: e.target.value }))}
                                    readOnly={!!student?.system_test_date}
                                    className={`w-full st-input !py-1.5 text-xs ${student?.system_test_date ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`} 
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 leading-none">
                                    <Calendar size={12} className="text-blue-500" /> Date of Admission
                                </label>
                                <input
                                    type="date"
                                    value={formData.date_of_admission || ''}
                                    onChange={e => setFormData(prev => ({ ...prev, date_of_admission: e.target.value }))}
                                    className="w-full st-input !py-1.5 text-xs"
                                />
                            </div>
                            <div className="md:col-span-2 p-3 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                    <CheckCircle2 size={16} />
                                </div>
                                <div className="leading-tight">
                                    <p className="text-[9px] font-black text-blue-900 uppercase">Test Status</p>
                                    <p className="text-xs font-bold text-blue-700">
                                        {student?.status === 'completed' ? `Score: ${student.score}/30` : student ? 'Pending' : 'N/A (New)'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 1: Personal Details */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">01. Personal Information</h3>
                            <div className="flex-1 h-px bg-gray-100"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            <div className="space-y-2 lg:col-span-1">
                                <label className="form-label-premium">Student Name</label>
                                <input 
                                    type="text" 
                                    value={formData.name || ''} 
                                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full st-input font-bold" 
                                />
                            </div>
                            <div className="space-y-2 lg:col-span-1">
                                <label className="form-label-premium">Father&apos;s Name</label>
                                <input 
                                    type="text" 
                                    value={formData.father_name || ''} 
                                    onChange={e => setFormData(prev => ({ ...prev, father_name: e.target.value }))}
                                    className="w-full st-input font-bold" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="form-label-premium">Father&apos;s CNIC Number</label>
                                <input 
                                    type="text" 
                                    placeholder="00000-0000000-0"
                                    maxLength={15}
                                    value={formData.father_cnic || ''} 
                                    onChange={e => setFormData(prev => ({ ...prev, father_cnic: formatCnic(e.target.value) }))}
                                    className="w-full st-input font-mono" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="form-label-premium">Guardian&apos;s Name</label>
                                <input 
                                    type="text" 
                                    value={formData.guardian_name || ''} 
                                    onChange={e => setFormData(prev => ({ ...prev, guardian_name: e.target.value }))}
                                    className="w-full st-input" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="form-label-premium">Father/Guardian&apos;s Occupation</label>
                                <input 
                                    type="text" 
                                    value={formData.occupation || ''} 
                                    onChange={e => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                                    className="w-full st-input" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="form-label-premium">Gender</label>
                                <select 
                                    value={formData.gender || ''} 
                                    onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                                    className="w-full st-input"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                        </div>

                        {/* Date of Birth Smart Section */}
                        <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="form-label-premium">Date of Birth <span className="text-gray-400">(Figures)</span></label>
                                <input 
                                    type="date" 
                                    value={formData.dob || ''}
                                    onChange={e => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                                    className="w-full st-input bg-white !py-2" 
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="form-label-premium">In Words</label>
                                <div className="w-full h-[40px] flex items-center px-4 bg-white border border-gray-200 rounded-xl text-xs font-black text-blue-700 italic leading-none">
                                    {dateToWords(formData.dob || '') || 'Select a date above...'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Academic History */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <h3 className="text-sm font-black uppercase tracking-widest text-blue-600">02. Academic History</h3>
                            <div className="flex-1 h-px bg-gray-100"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2 lg:col-span-2">
                                <label className="form-label-premium">Name of Previous School</label>
                                <input 
                                    type="text" 
                                    value={formData.previous_school || ''} 
                                    onChange={e => setFormData(prev => ({ ...prev, previous_school: e.target.value }))}
                                    className="w-full st-input" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="form-label-premium">Class reading in</label>
                                <select 
                                    value={formData.previous_class || ''} 
                                    onChange={e => setFormData(prev => ({ ...prev, previous_class: e.target.value }))}
                                    className="w-full st-input"
                                >
                                    <option value="">Select Class</option>
                                    {CLASSES.map(cl => <option key={cl} value={cl}>{cl}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="form-label-premium">S.L.C No. <span className="text-gray-400">(If any)</span></label>
                                <input 
                                    type="text" 
                                    value={formData.slc_no || ''} 
                                    onChange={e => setFormData(prev => ({ ...prev, slc_no: e.target.value }))}
                                    className="w-full st-input" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="form-label-premium">Date of Issue</label>
                                <input 
                                    type="date" 
                                    value={formData.slc_date || ''} 
                                    onChange={e => setFormData(prev => ({ ...prev, slc_date: e.target.value }))}
                                    className="w-full st-input" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="form-label-premium">Reason for leaving</label>
                                <input 
                                    type="text" 
                                    value={formData.reason_for_leaving || ''} 
                                    onChange={e => setFormData(prev => ({ ...prev, reason_for_leaving: e.target.value }))}
                                    className="w-full st-input" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="form-label-premium">Class to which seeking admission</label>
                                <select 
                                    value={formData.admission_class || ''} 
                                    onChange={e => setFormData(prev => ({ ...prev, admission_class: e.target.value }))}
                                    disabled={!!student?.class_level}
                                    className={`w-full st-input ${student?.class_level ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'border-blue-200 bg-blue-50/20'}`}
                                >
                                    <option value="">Select Class</option>
                                    {CLASSES.map(cl => <option key={cl} value={cl}>{cl}</option>)}
                                </select>
                                {student?.class_level && <p className="text-[9px] font-bold text-blue-600 mt-1 uppercase tracking-tighter italic px-1">Calculated from system test record</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="form-label-premium">Admission allowed to class</label>
                                <select 
                                    value={formData.admitted_class || ''} 
                                    onChange={e => setFormData(prev => ({ ...prev, admitted_class: e.target.value }))}
                                    className="w-full st-input font-black text-blue-700"
                                >
                                    <option value="">Pending Decision</option>
                                    {CLASSES.map(cl => <option key={cl} value={cl}>{cl}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: Smart Address */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <h3 className="text-sm font-black uppercase tracking-widest text-blue-600">03. Address Information</h3>
                            <div className="flex-1 h-px bg-gray-100"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8 bg-gray-50/30 rounded-3xl border border-gray-100">
                            <div className="space-y-2">
                                <label className="form-label-premium">Country</label>
                                <select 
                                    value={formData.country || 'Pakistan'} 
                                    onChange={e => setFormData(prev => ({ ...prev, country: e.target.value }))}
                                    className="w-full st-input bg-white"
                                >
                                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            
                            {formData.country === 'Pakistan' ? (
                                <>
                                    <div className="space-y-2">
                                        <label className="form-label-premium">Province</label>
                                        <select 
                                            value={formData.province || ''} 
                                            onChange={e => setFormData(prev => ({ ...prev, province: e.target.value, district: '', tehsil: '', city: '' }))}
                                            className="w-full st-input bg-white"
                                        >
                                            <option value="">Select Province</option>
                                            {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="form-label-premium">District</label>
                                        <select 
                                            value={formData.district || ''} 
                                            disabled={!formData.province}
                                            onChange={e => setFormData(prev => ({ ...prev, district: e.target.value, tehsil: '', city: '' }))}
                                            className="w-full st-input bg-white disabled:opacity-50"
                                        >
                                            <option value="">Select District</option>
                                            {districts.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="form-label-premium">Tehsil</label>
                                        <select 
                                            value={formData.tehsil || ''} 
                                            disabled={!formData.district}
                                            onChange={e => setFormData(prev => ({ ...prev, tehsil: e.target.value, city: '' }))}
                                            className="w-full st-input bg-white disabled:opacity-50"
                                        >
                                            <option value="">Select Tehsil</option>
                                            {tehsils.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="form-label-premium">City / Town</label>
                                        <input 
                                            type="text" 
                                            value={formData.city || ''} 
                                            onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                            className="w-full st-input bg-white" 
                                            placeholder="Enter city"
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-2 lg:col-span-2">
                                    <label className="form-label-premium">State / Province / City</label>
                                    <input 
                                        type="text" 
                                        placeholder="Region, Province, City Name"
                                        value={formData.city || ''} 
                                        onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                        className="w-full st-input bg-white" 
                                    />
                                </div>
                            )}
                            
                            <div className="space-y-2 lg:col-span-3">
                                <label className="form-label-premium">Permanent Address <span className="text-gray-400">(House, Street, Road Details)</span></label>
                                <textarea 
                                    rows={2}
                                    value={formData.street_address || ''} 
                                    onChange={e => setFormData(prev => ({ ...prev, street_address: e.target.value }))}
                                    className="w-full st-input bg-white resize-none" 
                                    placeholder="Enter full address details here..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: Authorized Persons */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <h3 className="text-sm font-black uppercase tracking-widest text-blue-600">04. Authorized Persons / Emergency Contacts</h3>
                            <div className="flex-1 h-px bg-gray-100"></div>
                        </div>

                        <div className="space-y-4">
                            {/* Header row */}
                            <div className="hidden md:grid grid-cols-11 gap-4 px-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                                <div className="col-span-1">No.</div>
                                <div className="col-span-5">Contact Name</div>
                                <div className="col-span-5">Phone Number</div>
                            </div>

                            {/* Row 1 - WhatsApp Integrated */}
                            <div className="grid grid-cols-1 md:grid-cols-11 gap-4 p-4 md:p-1 bg-white md:bg-transparent rounded-2xl border md:border-0">
                                <div className="md:col-span-1 flex items-center justify-center md:h-[46px]">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">1</div>
                                </div>
                                <div className="md:col-span-5">
                                    <input 
                                        type="text" 
                                        placeholder="Full Name"
                                        value={formData.contact1_name || ''} 
                                        onChange={e => setFormData(prev => ({ ...prev, contact1_name: e.target.value }))}
                                        className="w-full st-input" 
                                    />
                                </div>
                                <div className="md:col-span-5">
                                    <div className="relative">
                                        <input 
                                            type="tel" 
                                            placeholder="03XX XXXXXXX"
                                            maxLength={12}
                                            value={formData.contact1_phone || ''} 
                                            onChange={e => handlePhoneChange(e, 'contact1_phone')}
                                            className="w-full st-input !pl-14 font-mono tracking-tight" 
                                        />
                                        <Phone size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                                    </div>
                                    
                                    {/* Manual Whatsapp Checkbox */}
                                    <div className="mt-2 flex items-center gap-2 px-2 print:hidden">
                                        <input 
                                            type="checkbox" 
                                            id="c1_wa"
                                            checked={!!formData.contact1_whatsapp}
                                            onChange={e => setFormData(prev => ({ ...prev, contact1_whatsapp: e.target.checked ? 1 : 0 }))}
                                            className="w-3 h-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor="c1_wa" className="text-[10px] font-bold uppercase text-gray-500 cursor-pointer">On WhatsApp</label>
                                    </div>
                                    
                                    {/* International Toggle */}
                                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">International WhatsApp?</span>
                                        <button 
                                            onClick={() => setFormData(prev => ({ ...prev, is_intl_wa: !prev.is_intl_wa }))}
                                            className={`w-10 h-5 rounded-full relative transition-colors ${formData.is_intl_wa ? 'bg-blue-600' : 'bg-gray-200'}`}
                                        >
                                            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${formData.is_intl_wa ? 'left-6' : 'left-1'}`}></div>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* International WhatsApp Row - Print Hidden */}
                            {formData.is_intl_wa && (
                                <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 space-y-4 print:hidden animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-11 gap-4 p-4 md:p-1 items-start">
                                        <div className="md:col-span-1 flex items-center justify-center md:h-[46px]">
                                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shadow-md ring-4 ring-blue-50">2</div>
                                        </div>
                                        <div className="md:col-span-10">
                                            <h4 className="text-xs font-black uppercase text-blue-900 leading-none">International WhatsApp Contact</h4>
                                            <p className="text-[10px] font-bold text-blue-600/60 uppercase tracking-tight mt-1">Dedicated row for international verification</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-11 gap-4 mt-2">
                                        <div className="md:col-span-1" />
                                        <div className="md:col-span-10">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider px-1">Full Name</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Guardian's Name"
                                                        value={formData.intl_wa_name || ''} 
                                                        onChange={e => setFormData(prev => ({ ...prev, intl_wa_name: e.target.value }))}
                                                        className="w-full st-input bg-white" 
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider px-1">International Number</label>
                                                    <div className="relative">
                                                        <input 
                                                            type="tel" 
                                                            placeholder="+CountryCode Number"
                                                            value={formData.intl_wa_phone || ''} 
                                                            onChange={handleIntlPhoneChange}
                                                            className="w-full st-input bg-white !pl-12 font-mono" 
                                                        />
                                                        <Phone size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-400" />
                                                    </div>
                                                    
                                                    {/* Live Country Label */}
                                                    <div className="mt-3 space-y-2">
                                                        {formData.intl_wa_phone && (
                                                            <div className="flex flex-col gap-1.5 px-1 animate-in slide-in-from-left-2 duration-300">
                                                                <span className="text-[9px] font-black uppercase text-gray-400 tracking-tighter">Country of Origin</span>
                                                                <p className="text-[11px] font-bold text-blue-800 bg-white border border-blue-100 shadow-sm px-3 py-1.5 rounded-xl inline-flex items-center gap-2 self-start ring-4 ring-blue-50/50">
                                                                    <MapPin size={12} className="text-blue-500" /> {formData.intl_wa_country || 'Detecting...'}
                                                                </p>
                                                                
                                                                {/* Manual Whatsapp Checkbox */}
                                                                <div className="mt-2 flex items-center gap-2 px-1 print:hidden">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        id="intl_wa"
                                                                        checked={!!formData.intl_wa_verified}
                                                                        onChange={e => setFormData(prev => ({ ...prev, intl_wa_verified: e.target.checked ? 1 : 0 }))}
                                                                        className="w-3 h-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                    />
                                                                    <label htmlFor="intl_wa" className="text-[10px] font-bold uppercase text-blue-600 cursor-pointer">On WhatsApp</label>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Row 2 */}
                            <div className="grid grid-cols-1 md:grid-cols-11 gap-4 p-4 md:p-1 bg-white md:bg-transparent rounded-2xl border md:border-0 border-gray-100">
                                <div className="md:col-span-1 flex items-center justify-center md:h-[46px]">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 font-black text-xs flex items-center justify-center">
                                        {formData.is_intl_wa ? '3' : '2'}
                                    </div>
                                </div>
                                <div className="md:col-span-5">
                                    <input 
                                        type="text" 
                                        placeholder="Full Name"
                                        value={formData.contact2_name || ''} 
                                        onChange={e => setFormData(prev => ({ ...prev, contact2_name: e.target.value }))}
                                        className="w-full st-input" 
                                    />
                                </div>
                                <div className="md:col-span-5">
                                    <div className="relative">
                                        <input 
                                            type="tel" 
                                            placeholder="03XX XXXXXXX"
                                            maxLength={12}
                                            value={formData.contact2_phone || ''} 
                                            onChange={e => handlePhoneChange(e, 'contact2_phone')}
                                            className="w-full st-input !pl-14 font-mono" 
                                        />
                                        <Phone size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                                    </div>
                                    {/* Manual Whatsapp Checkbox */}
                                    <div className="mt-2 flex items-center gap-2 px-2 print:hidden">
                                        <input 
                                            type="checkbox" 
                                            id="c2_wa"
                                            checked={!!formData.contact2_whatsapp}
                                            onChange={e => setFormData(prev => ({ ...prev, contact2_whatsapp: e.target.checked ? 1 : 0 }))}
                                            className="w-3 h-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor="c2_wa" className="text-[10px] font-bold uppercase text-gray-500 cursor-pointer">On WhatsApp</label>
                                    </div>
                                </div>
                            </div>

                            {/* Row 3 */}
                            <div className="grid grid-cols-1 md:grid-cols-11 gap-4 p-4 md:p-1 bg-white md:bg-transparent rounded-2xl border md:border-0 border-gray-100">
                                <div className="md:col-span-1 flex items-center justify-center md:h-[46px]">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 font-black text-xs flex items-center justify-center">
                                        {formData.is_intl_wa ? '4' : '3'}
                                    </div>
                                </div>
                                <div className="md:col-span-5">
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            placeholder="Contact Person 3 Name"
                                            value={formData.contact3_name || ''} 
                                            onChange={e => setFormData(prev => ({ ...prev, contact3_name: e.target.value }))}
                                            className="w-full st-input !pl-12" 
                                        />
                                        <User size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                                    </div>
                                </div>
                                <div className="md:col-span-5">
                                    <div className="relative">
                                        <input 
                                            type="tel" 
                                            placeholder="Contact 3 Phone"
                                            maxLength={12} 
                                            value={formData.contact3_phone || ''} 
                                            onChange={e => handlePhoneChange(e, 'contact3_phone')}
                                            className="w-full st-input !pl-12 font-mono" 
                                        />
                                        <Phone size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                                    </div>
                                    {/* Manual Whatsapp Checkbox */}
                                    <div className="mt-2 flex items-center gap-2 px-2 print:hidden">
                                        <input 
                                            type="checkbox" 
                                            id="c3_wa"
                                            checked={!!formData.contact3_whatsapp}
                                            onChange={e => setFormData(prev => ({ ...prev, contact3_whatsapp: e.target.checked ? 1 : 0 }))}
                                            className="w-3 h-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor="c3_wa" className="text-[10px] font-bold uppercase text-gray-500 cursor-pointer">On WhatsApp</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 05. NOTES TO ADMIN (Digital View) */}
                <div className="p-8 pb-0 animate-in fade-in duration-700">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                        <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] whitespace-nowrap px-4">05. NOTES TO ADMIN</h3>
                        <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                    </div>

                    <div className="bg-gray-50/50 rounded-[32px] border-2 border-dashed border-gray-200/60 p-8 min-h-[140px] relative group transition-all hover:bg-white hover:border-blue-200/50 hover:shadow-xl hover:shadow-blue-500/5">
                        <div className="absolute -top-3 left-8 bg-blue-600 text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                             Administrative Feedback Loop
                        </div>
                        
                        {formData.admin_notes ? (
                            <div className="relative">
                                <span className="absolute -top-2 -left-2 text-4xl text-blue-200/30 font-serif opacity-50">&quot;</span>
                                <p className="text-base font-medium text-gray-700 leading-relaxed italic whitespace-pre-wrap px-4 py-2 relative z-10 selection:bg-blue-100">
                                    {formData.admin_notes}
                                </p>
                                <span className="absolute -bottom-6 -right-2 text-4xl text-blue-200/30 font-serif opacity-50">&quot;</span>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center py-6">
                                <div className="p-4 rounded-3xl bg-white border border-gray-100 shadow-sm mb-4">
                                     <User size={28} className="text-gray-200" />
                                </div>
                                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 text-center max-w-[200px] leading-relaxed">No specific instructions provided from the administrator portal</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Section - Design Polish */}
                <div className="p-8 bg-blue-900 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-white space-y-1 text-center md:text-left">
                        <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Document Status</p>
                        <p className="text-sm font-bold">In-Progress Admission Portal • Mardan Youth&apos;s Academy</p>
                    </div>
                    
                    <div className="flex bg-white/10 p-1.5 rounded-2xl border border-white/20">
                         <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-white text-blue-900 px-10 py-3 rounded-xl font-black uppercase tracking-tighter text-sm flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-xl disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                            {isSaving ? 'Finalizing...' : 'Save & Finalize'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Premium Styles */}
            <style jsx global>{`
                .form-label-premium {
                    display: block;
                    font-size: 11px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--text-muted);
                    margin-bottom: 0.5rem;
                }
                @media print {
                    @page {
                        margin: 0;
                        size: auto;
                    }
                    /* NUCLEAR HIDE - Hide all major layout elements globally */
                    html, body {
                        background: white !important;
                        overflow: visible !important;
                        height: auto !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }

                    /* Targeted global selectors for AdminLayout components */
                    aside, header, nav, footer, .print-hidden, 
                    [class*="md:hidden shrink-0 flex"], 
                    .md\:hidden.shrink-0.flex, .w-64.hidden.md\:flex,
                    #sidebar,
                    button, .st-btn-ghost, .st-btn-primary, svg, .ThemeToggle, [role="navigation"] {
                        display: none !important;
                        visibility: hidden !important;
                        opacity: 0 !important;
                        height: 0 !important;
                        width: 0 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        position: absolute !important;
                        top: -9999px !important;
                    }

                    /* Override container restrictions safely */
                    .flex.fixed.inset-0, div[class*="AdminLayout"], div[class*="fixed"], .fixed.inset-0 {
                        position: static !important;
                        display: block !important;
                        overflow: visible !important;
                        width: auto !important;
                        height: auto !important;
                        background: white !important;
                        background-color: white !important;
                    }

                    .flex-1.flex.flex-col, main, .max-w-5xl {
                        display: block !important;
                        position: static !important;
                        overflow: visible !important;
                        width: 100% !important;
                        max-width: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }

                    /* Hide the actual interactive form container */
                    .bg-white.rounded-3xl.shadow-xl, .st-card {
                        display: none !important;
                    }

                    /* Show our specialized template */
                    #admission-print-template {
                        display: block !important;
                        visibility: visible !important;
                        padding: 1.5cm !important;
                        background: white !important;
                        background-color: white !important;
                        position: relative !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 100% !important;
                    }
                    
                    #admission-print-template * {
                        visibility: visible !important;
                    }
                }
            `}</style>

            {/* Webcam Modal */}
            {showWebcam && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-xl w-full">
                        <WebcamCapture 
                            onCapture={(img) => {
                                setFormData(prev => ({ ...prev, photo: img }));
                                setShowWebcam(false);
                            }} 
                            onClear={() => {
                                setFormData(prev => ({ ...prev, photo: undefined }));
                            }}
                            capturedPhoto={formData.photo || null}
                        />
                        <div className="p-4 border-t flex justify-end">
                            <button 
                                onClick={() => setShowWebcam(false)}
                                className="st-btn-ghost text-sm px-6 py-2"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function PrintTemplate({ formData, dateToWords }: { formData: any, dateToWords: (d: string) => string }) {
    return (
        <div id="admission-print-template" className="hidden print:block font-serif text-black p-6 bg-white min-h-[29.7cm] w-full text-[9px] relative overflow-visible">
            {/* Header Section: Reg(L), Identity(C), Admin/Photo(R) */}
            <div className="grid grid-cols-12 gap-2 mb-6 items-start min-h-[155px]">
                {/* Left: Reg No */}
                <div className="col-span-3 pt-2">
                    <div className="flex items-center">
                        <span className="font-bold mr-2 text-[10px]">Reg No.</span>
                        <div className="border border-black px-2 py-0.5 inline-block min-w-[100px] h-7 text-center font-bold text-sm tracking-widest">{formData.reg_no}</div>
                    </div>
                </div>
                
                {/* Center: Title + School Identity */}
                <div className="col-span-6 flex flex-col items-center text-center">
                    <div className="border-[2px] border-blue-900 px-8 py-1 inline-block font-black text-xl text-blue-900 tracking-widest bg-white mb-2">
                        ADMISSION FORM
                    </div>
                    <div className="space-y-0.5">
                        <h2 className="text-3xl font-serif font-black text-blue-900 tracking-tight leading-none" style={{ fontFamily: 'Georgia, serif' }}>
                            Mardan Youth&apos;s Academy
                        </h2>
                        <p className="text-[8px] uppercase font-bold text-gray-500">
                            Opposite Abdul Wali Khan University, Garden Campus, Toru Road, Mardan
                        </p>
                        <div className="w-12 h-12 pt-1 mx-auto flex justify-center">
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain filter grayscale opacity-90" />
                        </div>
                    </div>
                </div>

                {/* Right: Admin No + Photo (Centered with each other) */}
                <div className="col-span-3 flex flex-col items-center gap-1.5 pt-1">
                    <div className="flex items-center w-full justify-end">
                        <span className="font-bold mr-2 text-[10px]">Admin No.</span>
                        <div className="border border-black px-2 py-0.5 inline-block min-w-[100px] h-7"></div>
                    </div>
                    <div className="border border-black w-24 h-32 flex items-center justify-center overflow-hidden bg-gray-50 shrink-0">
                        {formData.photo ? (
                            <img src={formData.photo} alt="Student" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-[7px] text-gray-400 font-bold uppercase p-2 text-center">Photograph</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Form Table - Compacted for 1-page limit */}
            <div className="border border-black border-b-0">
                <div className="flex border-b border-black">
                    <div className="flex-1 p-2 border-r border-black flex items-end">
                        <span className="font-bold min-w-[120px]">Date on which tested</span>
                        <span className="flex-1 border-b border-dotted border-gray-400 pb-0.5 px-2 font-bold text-xs">{formData.date_of_test}</span>
                    </div>
                    <div className="flex-1 p-2 flex items-end">
                        <span className="font-bold min-w-[100px]">Date of Admission</span>
                        <span className="flex-1 border-b border-dotted border-gray-400 pb-0.5 px-2 font-bold text-xs">{formData.date_of_admission}</span>
                    </div>
                </div>

                <div className="p-2 border-b border-black flex items-end">
                    <span className="font-bold min-w-[150px]">Student Name <span className="text-[8px] font-normal italic">(block letters)</span></span>
                    <span className="flex-1 border-b border-dotted border-gray-400 pb-0.5 px-4 font-bold text-xs tracking-widest">{formData.name}</span>
                </div>

                <div className="p-2 border-b border-black flex items-end">
                    <span className="font-bold min-w-[150px]">Father&apos;s Name <span className="text-[8px] font-normal italic">(block letters)</span></span>
                    <span className="flex-1 border-b border-dotted border-gray-400 pb-0.5 px-4 font-bold text-xs tracking-widest">{formData.father_name}</span>
                </div>

                <div className="p-2 border-b border-black flex items-end">
                    <span className="font-bold min-w-[150px]">Father&apos;s CNIC Number</span>
                    <span className="flex-1 border-b border-dotted border-gray-400 pb-0.5 px-4 font-mono font-bold text-xs tracking-widest">{formData.father_cnic}</span>
                </div>

                <div className="p-2 border-b border-black flex items-end">
                    <span className="font-bold min-w-[150px]">Guardian&apos;s Name</span>
                    <span className="flex-1 border-b border-dotted border-gray-400 pb-0.5 px-4 font-bold text-xs">{formData.guardian_name}</span>
                </div>

                <div className="flex border-b border-black">
                    <div className="flex-1 p-2 border-r border-black flex items-end">
                        <span className="font-bold min-w-[120px]">Date of birth <span className="text-[8px] font-normal italic">(in figure)</span></span>
                        <span className="flex-1 border-b border-dotted border-gray-400 pb-0.5 px-2 font-bold text-xs">{formData.dob}</span>
                    </div>
                    <div className="flex-1 p-2 flex items-end">
                        <span className="font-bold min-w-[60px] text-[8px] italic">(in words)</span>
                        <span className="flex-1 border-b border-dotted border-gray-400 pb-0.5 px-2 text-[10px] font-bold leading-none">{dateToWords(formData.dob || '')}</span>
                    </div>
                </div>

                <div className="p-2 border-b border-black flex items-end">
                    <span className="font-bold min-w-[150px]">Name of Previous School</span>
                    <span className="flex-1 border-b border-dotted border-gray-400 pb-0.5 px-4 font-bold text-xs">{formData.previous_school}</span>
                </div>

                <div className="grid grid-cols-12 border-b border-black">
                    <div className="col-span-5 p-2 border-r border-black flex items-end">
                        <span className="font-bold text-[8px] leading-tight mr-2">Class in which he/she was reading</span>
                        <span className="flex-1 border-b border-dotted border-gray-400 pb-0.5 px-2 font-bold text-xs">{formData.previous_class}</span>
                    </div>
                    <div className="col-span-3 p-2 border-r border-black flex items-end">
                        <span className="font-bold text-[8px] mr-2">S.L.C. No.</span>
                        <span className="flex-1 border-b border-dotted border-gray-400 pb-0.5 px-2 font-bold text-xs">{formData.slc_no}</span>
                    </div>
                    <div className="col-span-4 p-2 flex items-end">
                        <span className="font-bold text-[8px] mr-2">Date of Issue</span>
                        <span className="flex-1 border-b border-dotted border-gray-400 pb-0.5 px-2 font-bold text-xs">{formData.slc_date}</span>
                    </div>
                </div>

                <div className="p-2 border-b border-black flex items-end">
                    <span className="font-bold min-w-[180px]">Reason for leaving that school</span>
                    <span className="flex-1 border-b border-dotted border-gray-400 pb-0.5 px-4 font-bold text-xs">{formData.reason_for_leaving}</span>
                </div>

                <div className="flex border-b border-black">
                    <div className="flex-1 p-2 border-r border-black flex items-end">
                        <span className="font-bold min-w-[180px] text-[9px]">Class to which seeking admission</span>
                        <span className="flex-1 border-b border-dotted border-gray-400 pb-0.5 px-2 font-bold text-xs">{formData.admission_class}</span>
                    </div>
                    <div className="flex-1 p-2 flex items-end">
                        <span className="font-bold min-w-[150px] text-[9px]">Admission allowed to class</span>
                        <span className="flex-1 border-b border-dotted border-gray-400 pb-0.5 px-2 font-bold text-xs text-center underline underline-offset-4">{formData.admitted_class}</span>
                    </div>
                </div>

                <div className="p-2 border-b border-black flex items-end">
                    <span className="font-bold min-w-[180px]">Father&apos;s/Guardian&apos;s Occupation</span>
                    <span className="flex-1 border-b border-dotted border-gray-400 pb-0.5 px-4 font-bold text-xs">{formData.occupation}</span>
                </div>

                <div className="p-1.5 border-b border-black flex items-start min-h-[40px]">
                    <span className="font-bold min-w-[80px] pt-0.5">Address</span>
                    <div className="flex-1 border-b border-dotted border-gray-400 pb-0.5 px-4 font-bold text-xs leading-normal">
                        {formData.street_address}, {formData.city}, {formData.tehsil}, {formData.district}, {formData.province}
                    </div>
                </div>

                <div className="grid grid-cols-12 border-b border-black">
                    <div className="col-span-4 p-2 border-r border-black flex flex-col justify-center">
                        <p className="font-black text-[10px] uppercase">Authorized Persons</p>
                        <p className="text-[8px] font-bold text-gray-600 leading-tight">to discuss / Visit / take leave</p>
                    </div>
                    <div className="col-span-8 flex flex-col">
                        {(() => {
                            const contacts = [];
                            contacts.push({ name: formData.contact1_name, phone: formData.contact1_phone });
                            if (formData.is_intl_wa) {
                                contacts.push({ name: formData.intl_wa_name, phone: formData.intl_wa_phone, isIntl: true });
                            }
                            contacts.push({ name: formData.contact2_name, phone: formData.contact2_phone });
                            contacts.push({ name: formData.contact3_name, phone: formData.contact3_phone });
                            
                            // Take only up to 4 if intl, or 3 if not
                            const displayContacts = contacts.slice(0, formData.is_intl_wa ? 4 : 3);

                            return displayContacts.map((c, idx) => (
                                <div key={idx} className="flex flex-1 border-b border-black last:border-0 h-9 items-center px-4">
                                    <span className="w-6 font-serif italic text-xs">{idx + 1}</span>
                                    <span className="flex-1 border-b border-dotted border-gray-300 mx-2 h-5 font-bold text-xs overflow-hidden">
                                        {c.name} {c.isIntl && <span className="text-[7px] font-black uppercase text-blue-800 ml-2">(Intl WhatsApp)</span>}
                                    </span>
                                    <span className="text-[9px] font-bold ml-2 mr-1">Tel:</span>
                                    <span className="w-32 border-b border-dotted border-gray-300 font-mono text-xs font-bold h-5 flex items-center">
                                        {c.phone}
                                    </span>
                                </div>
                            ));
                        })()}
                    </div>
                </div>
            </div>

            {/* 05. NOTES TO ADMIN (for physical form) */}
            <div className="mt-4 border border-black mb-4">
                <div className="bg-gray-100 p-1.5 border-b border-black text-center">
                    <span className="font-black text-[10px] tracking-widest uppercase">05. NOTES TO ADMIN (Internal)</span>
                </div>
                <div className="p-3 min-h-[60px] animate-in fade-in duration-500">
                    {formData.admin_notes ? (
                        <p className="text-[11px] font-medium leading-relaxed italic whitespace-pre-wrap">
                            "{formData.admin_notes}"
                        </p>
                    ) : (
                        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest text-center mt-4">No additional notes provided.</p>
                    )}
                </div>
            </div>

            {/* Bottom Signature placeholders */}
            <div className="mt-4 flex justify-between px-8">
                <div className="text-center pt-6 border-t border-black min-w-[200px]">
                    <p className="text-[9px] font-bold uppercase">Parent/Guardian Signature</p>
                </div>
                <div className="text-center pt-6 border-t border-black min-w-[200px]">
                    <p className="text-[9px] font-bold uppercase">Authorized Officer Signature</p>
                </div>
            </div>
        </div>
    );
}
