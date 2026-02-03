"use client";
import React from 'react';
import AppShell from "@/components/AppShell";
import TopHeader from "@/components/TopHeader";

export default function ReportsPage() {
    return (
        <AppShell>
            <TopHeader title="Reportes & KPIs" />
            <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-background-light dark:bg-background-dark">
                <div className="max-w-[1600px] mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: 'Leads Nuevos', val: '45', trend: '+12%', color: 'text-emerald-600', icon: 'person_add' },
                            { label: 'Leads Calientes', val: '12', trend: '-5%', color: 'text-rose-600', icon: 'local_fire_department' },
                            { label: 'Citas Hoy', val: '04', trend: '+3%', color: 'text-emerald-600', icon: 'calendar_month' },
                            { label: 'Tasa Cierre', val: '4.2%', trend: 'Goal: 5%', color: 'text-slate-500', icon: 'analytics' }
                        ].map((kpi, i) => (
                            <div key={i} className="bg-white dark:bg-[#1a2230] p-5 rounded-2xl shadow-soft border border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <span className="material-symbols-outlined text-[20px]">{kpi.icon}</span>
                                        <span className="text-xs font-bold uppercase tracking-wider">{kpi.label}</span>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${kpi.color} bg-opacity-10 bg-current`}>{kpi.trend}</span>
                                </div>
                                <p className="text-3xl font-bold">{kpi.val}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </AppShell>
    );
}