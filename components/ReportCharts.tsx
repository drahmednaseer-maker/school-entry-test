'use client';

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer
} from 'recharts';

interface Props {
    classData: { class_level: string; count: number; granted: number; not_granted: number }[];
    pieData: { name: string; value: number; color: string }[];
    genderData: { name: string; Male: number; Female: number }[];
    timeData: { date: string; count: number }[];
}

const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#d97706', '#7c3aed', '#0891b2', '#db2777'];

export default function ReportCharts({ classData, pieData, genderData, timeData }: Props) {
    return (
        <div className="space-y-8">
            {/* Row 1: Tests per class + Admission pie */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Bar: Tests per class */}
                <div className="lg:col-span-3 rounded-2xl p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                    <p className="font-bold text-sm mb-5" style={{ color: 'var(--text-primary)' }}>Tests Taken per Class</p>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={classData} margin={{ top: 4, right: 8, left: -20, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="class_level" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} angle={-35} textAnchor="end" interval={0} />
                            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                                labelStyle={{ color: 'var(--text-primary)', fontWeight: 700 }}
                            />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Bar dataKey="count" name="Total Tests" fill="#2563eb" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="granted" name="Granted" fill="#16a34a" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie: Admission status */}
                <div className="lg:col-span-2 rounded-2xl p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                    <p className="font-bold text-sm mb-5" style={{ color: 'var(--text-primary)' }}>Admission Outcomes</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-3 mt-2 justify-center">
                        {pieData.map(d => (
                            <div key={d.name} className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: d.color }} />
                                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{d.name}: <strong style={{ color: 'var(--text-primary)' }}>{d.value}</strong></span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Row 2:  Male/Female + Time line */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gender bar */}
                <div className="rounded-2xl p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                    <p className="font-bold text-sm mb-5" style={{ color: 'var(--text-primary)' }}>Male / Female Applicants</p>
                    {genderData[0]?.Male === 0 && genderData[0]?.Female === 0 ? (
                        <div className="flex items-center justify-center h-40 text-sm" style={{ color: 'var(--text-muted)' }}>Gender data not collected yet</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={genderData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} allowDecimals={false} />
                                <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Bar dataKey="Male" fill="#2563eb" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Female" fill="#db2777" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Time line */}
                <div className="rounded-2xl p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                    <p className="font-bold text-sm mb-5" style={{ color: 'var(--text-primary)' }}>Tests Over Active Session</p>
                    {timeData.length === 0 ? (
                        <div className="flex items-center justify-center h-40 text-sm" style={{ color: 'var(--text-muted)' }}>No data yet</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={timeData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} angle={-30} textAnchor="end" height={45} />
                                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} allowDecimals={false} />
                                <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                                <Line type="monotone" dataKey="count" name="Tests" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}
