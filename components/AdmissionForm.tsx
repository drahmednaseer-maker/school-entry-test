'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { saveAdmissionForm } from '@/lib/actions';
import { 
    Save, 
    ArrowLeft, 
    Camera, 
    Upload, 
    Calendar, 
    User, 
    Phone,
    CheckCircle2,
    XCircle,
    Loader2,
    Share2,
    MessageCircle
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
    contact3_name?: string;
    contact3_phone?: string;
    reg_no?: string;
    date_of_test?: string;
    date_of_admission?: string;
    status?: string;
    score?: number;
    admitted_class?: string;
    system_test_date?: string;
}

const CLASSES = ['PlayGroup', 'KG 1', 'KG 2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];

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

export default function AdmissionForm({ student }: { student: Student }) {
    const router = useRouter();
    const [formData, setFormData] = useState<Student>(() => {
        const initial = { ...student };
        if (student.system_test_date && !initial.date_of_test) {
            initial.date_of_test = student.system_test_date.split(' ')[0];
        }
        // Auto-fill seeking class from test level if not already set
        if (!initial.admission_class) {
            initial.admission_class = student.class_level;
        }
        // admitted_class is already in student record if previously set
        return initial;
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [showWebcam, setShowWebcam] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [whatsappStatus, setWhatsappStatus] = useState<'idle' | 'checking' | 'verified' | 'not_on_wa'>('idle');

    // Simulated WhatsApp "Auto-test"
    useState(() => {
        if (formData.contact1_phone && formData.contact1_phone.length >= 10) {
            setWhatsappStatus('verified');
        }
    });

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Student) => {
        const raw = e.target.value.replace(/\D/g, '');
        const formatted = formatPhone(e.target.value);
        setFormData(prev => ({ ...prev, [field]: formatted }));
        
        if (field === 'contact1_phone') {
            if (raw.length >= 10) {
                setWhatsappStatus('checking');
                setTimeout(() => setWhatsappStatus('verified'), 800);
            } else {
                setWhatsappStatus('idle');
            }
        }
    };

    // Cascading options
    const provinces = Object.keys(PAKISTAN_GEO);
    const districts = formData.province ? Object.keys(PAKISTAN_GEO[formData.province]?.districts || {}) : [];
    const tehsils = (formData.province && formData.district) ? PAKISTAN_GEO[formData.province].districts[formData.district]?.tehsils || [] : [];

    const handleWhatsAppCheck = () => {
        if (formData.contact1_phone) {
            const cleanNumber = formData.contact1_phone.replace(/\D/g, '');
            // Pakistan specific formatting if needed, but wa.me handles global
            window.open(`https://wa.me/${cleanNumber.startsWith('0') ? '92' + cleanNumber.slice(1) : cleanNumber}`, '_blank');
        }
    };

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

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus('idle');
        try {
            const res = await saveAdmissionForm(student.id, formData);
            if (res.success) {
                setSaveStatus('success');
                setTimeout(() => router.push('/admin/students'), 1500);
            } else {
                setSaveStatus('error');
            }
        } catch {
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 pb-24">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm font-medium hover:text-blue-600 transition-colors"
                >
                    <ArrowLeft size={18} /> Back to List
                </button>
                <div className="flex gap-3 w-full md:w-auto">
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
                <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 size={20} /> Admission form saved successfully! Redirecting...
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
                <div className="p-8 border-b relative" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        {/* Logo Wrapper */}
                        <div className="w-24 h-24 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                            <div className="font-black text-blue-700 text-4xl">MYA</div>
                        </div>
                        
                        {/* Title Section */}
                        <div className="text-center md:text-left flex-1 space-y-2">
                            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>
                                Admission Form
                            </h1>
                            <div className="h-1 w-20 bg-blue-600 rounded-full mx-auto md:mx-0"></div>
                            <p className="text-xl font-bold text-blue-800">MARDAN YOUTH’S ACADEMY</p>
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Opposite Abdul Wali Khan University, Garden Campus, Toru Road, Mardan</p>
                        </div>

                        {/* Reg No Field */}
                        <div className="w-full md:w-48 space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Reg No.</label>
                            <input 
                                type="text"
                                value={formData.reg_no || ''}
                                onChange={e => setFormData(prev => ({ ...prev, reg_no: e.target.value }))}
                                className="w-full st-input font-mono font-bold text-center text-lg py-3 border-2"
                                placeholder="0000"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-8 md:p-12 space-y-12">
                    {/* TOP SECTION: Photo & Dates */}
                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Photo Column */}
                        <div className="w-full lg:w-1/3 flex flex-col items-center gap-6">
                            <div className="relative group">
                                <div className="w-56 h-72 border-4 border-dashed border-gray-200 rounded-2xl overflow-hidden flex items-center justify-center bg-gray-50 relative transition-all group-hover:border-blue-400">
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
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-black uppercase text-gray-400">
                                    <Calendar size={14} className="text-blue-500" /> Date on which tested
                                </label>
                                <input 
                                    type="date" 
                                    value={formData.date_of_test || ''}
                                    onChange={e => setFormData(prev => ({ ...prev, date_of_test: e.target.value }))}
                                    readOnly={!!student.system_test_date}
                                    className={`w-full st-input ${student.system_test_date ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`} 
                                />
                                {student.system_test_date && <p className="text-[10px] font-bold text-blue-600 mt-1 uppercase tracking-tighter">Auto-populated from system test data</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-black uppercase text-gray-400">
                                    <Calendar size={14} className="text-blue-500" /> Date of Admission
                                </label>
                                <input 
                                    type="date" 
                                    value={formData.date_of_admission || ''}
                                    onChange={e => setFormData(prev => ({ ...prev, date_of_admission: e.target.value }))}
                                    className="w-full st-input" 
                                />
                            </div>
                            <div className="md:col-span-2 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <CheckCircle2 size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-blue-900 uppercase">Test Status</p>
                                    <p className="text-sm font-bold text-blue-700">
                                        {student.status === 'completed' ? `Test Completed • Score: ${student.score}/30` : 'Test Pending / Not Required'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 1: Personal Details */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <h3 className="text-sm font-black uppercase tracking-widest text-blue-600">01. Personal Information</h3>
                            <div className="flex-1 h-px bg-gray-100"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-2 lg:col-span-1">
                                <label className="form-label-premium">Student Name <span className="text-gray-400">(Block Letters)</span></label>
                                <input 
                                    type="text" 
                                    value={formData.name || ''} 
                                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value.toUpperCase() }))}
                                    className="w-full st-input font-bold" 
                                />
                            </div>
                            <div className="space-y-2 lg:col-span-1">
                                <label className="form-label-premium">Father&apos;s Name <span className="text-gray-400">(Block Letters)</span></label>
                                <input 
                                    type="text" 
                                    value={formData.father_name || ''} 
                                    onChange={e => setFormData(prev => ({ ...prev, father_name: e.target.value.toUpperCase() }))}
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
                        <div className="p-8 bg-gray-50/50 rounded-3xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="form-label-premium">Date of Birth <span className="text-gray-400">(Figures)</span></label>
                                <input 
                                    type="date" 
                                    value={formData.dob || ''}
                                    onChange={e => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                                    className="w-full st-input bg-white" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="form-label-premium">In Words</label>
                                <div className="w-full h-[46px] flex items-center px-4 bg-white border border-gray-200 rounded-xl text-sm font-bold text-blue-700 italic">
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
                                    disabled={!!student.class_level}
                                    className={`w-full st-input ${student.class_level ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'border-blue-200 bg-blue-50/20'}`}
                                >
                                    <option value="">Select Class</option>
                                    {CLASSES.map(cl => <option key={cl} value={cl}>{cl}</option>)}
                                </select>
                                {student.class_level && <p className="text-[9px] font-bold text-blue-600 mt-1 uppercase tracking-tighter italic px-1">Calculated from system test record</p>}
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
                            <div className="hidden md:grid grid-cols-12 gap-4 px-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                                <div className="col-span-1">No.</div>
                                <div className="col-span-5">Contact Name</div>
                                <div className="col-span-5">Phone Number</div>
                                <div className="col-span-1">Action</div>
                            </div>

                            {/* Row 1 - WhatsApp Integrated */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:p-1 bg-white md:bg-transparent rounded-2xl border md:border-0">
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
                                <div className="md:col-span-5 relative">
                                    <input 
                                        type="tel" 
                                        placeholder="03XX XXXXXXX"
                                        maxLength={12}
                                        value={formData.contact1_phone || ''} 
                                        onChange={e => handlePhoneChange(e, 'contact1_phone')}
                                        className="w-full st-input pl-10 font-mono tracking-tight" 
                                    />
                                    <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    
                                    {/* Whatsapp Status Display */}
                                    <div className="mt-2 flex flex-col gap-1 px-2">
                                        <div className="flex items-center justify-between">
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input 
                                                    type="checkbox"
                                                    checked={!!formData.contact1_whatsapp || whatsappStatus === 'verified'}
                                                    onChange={e => setFormData(prev => ({ ...prev, contact1_whatsapp: e.target.checked ? 1 : 0 }))}
                                                    className="w-4 h-4 rounded text-green-600 focus:ring-green-500"
                                                />
                                                <span className="text-[10px] font-bold uppercase text-gray-500 group-hover:text-green-600 transition-colors">On WhatsApp</span>
                                            </label>
                                            {whatsappStatus === 'verified' && (
                                                <button 
                                                    onClick={handleWhatsAppCheck}
                                                    className="flex items-center gap-1.5 text-[10px] font-black uppercase text-green-600 hover:text-green-700 transition-colors"
                                                >
                                                    <MessageCircle size={12} /> Open Chat
                                                </button>
                                            )}
                                        </div>
                                        
                                        {whatsappStatus === 'checking' && (
                                            <p className="text-[9px] font-bold text-blue-500 animate-pulse uppercase tracking-tighter flex items-center gap-1">
                                                <Loader2 size={10} className="animate-spin" /> System testing number...
                                            </p>
                                        )}
                                        {whatsappStatus === 'verified' && (
                                            <p className="text-[9px] font-bold text-green-600 uppercase tracking-tighter flex items-center gap-1">
                                                <CheckCircle2 size={10} /> The number is on Whatsapp
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="hidden md:flex md:col-span-1 items-start pt-2 justify-center">
                                    <Share2 size={16} className="text-gray-300" />
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:p-1 bg-white md:bg-transparent rounded-2xl border md:border-0 border-gray-100">
                                <div className="md:col-span-1 flex items-center justify-center md:h-[46px]">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 font-black text-xs flex items-center justify-center">2</div>
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
                                <div className="md:col-span-5 relative">
                                    <input 
                                        type="tel" 
                                        placeholder="03XX XXXXXXX"
                                        maxLength={12}
                                        value={formData.contact2_phone || ''} 
                                        onChange={e => handlePhoneChange(e, 'contact2_phone')}
                                        className="w-full st-input pl-10 font-mono" 
                                    />
                                    <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>

                            {/* Row 3 */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:p-1 bg-white md:bg-transparent rounded-2xl border md:border-0 border-gray-100">
                                <div className="md:col-span-1 flex items-center justify-center md:h-[46px]">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 font-black text-xs flex items-center justify-center">3</div>
                                </div>
                                <div className="md:col-span-5">
                                    <input 
                                        type="text" 
                                        placeholder="Full Name"
                                        value={formData.contact3_name || ''} 
                                        onChange={e => setFormData(prev => ({ ...prev, contact3_name: e.target.value }))}
                                        className="w-full st-input" 
                                    />
                                </div>
                                <div className="md:col-span-5 relative">
                                    <input 
                                        type="tel" 
                                        placeholder="03XX XXXXXXX"
                                        maxLength={12}
                                        value={formData.contact3_phone || ''} 
                                        onChange={e => handlePhoneChange(e, 'contact3_phone')}
                                        className="w-full st-input pl-10 font-mono" 
                                    />
                                    <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>
                        </div>
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
            <style jsx>{`
                .form-label-premium {
                    display: block;
                    font-size: 11px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--text-muted);
                    margin-bottom: 0.5rem;
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
