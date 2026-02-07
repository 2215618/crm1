"use client";
import React from 'react';
import AppShell from "@/components/AppShell";
import TopHeader from "@/components/TopHeader";
import { useQuery } from "@tanstack/react-query";
import { Lead, Appointment, Property } from "@/types";
import { safeFetchArray } from "@/lib/api/safeFetch";

export default function ReportsPage() {
    const { data: leads } = useQuery<Lead[]>({
        queryKey: ["leads"],
        queryFn: () => safeFetchArray<Lead>("/api/leads"),
        initialData: []
    });

    const { data: appointments } = useQuery<Appointment[]>({
        queryKey: ["appointments"],
        queryFn: () => safeFetchArray<Appointment>("/api/appointments"),
        initialData: []
    });

    // --- CALCULATE REAL KPIS ---
    const leadsNuevos = leads?.filter(l => l.estado === 'Nuevo').length || 0;
    const leadsCalientes = leads?.filter(l => l.estado === 'Caliente').length || 0;
    
    // Check against local date string to match "today"
    const todayStr = new Date().toISOString().split('T')[0];
    const citasHoy = appointments?.filter(a => a.fecha === todayStr).length || 0;

    const totalLeads = leads?.length || 1; // avoid division by zero
    const leadsCerrados = leads?.filter(l => l.estado === 'Cerrado').length || 0;
    const tasaCierre = Math.round((leadsCerrados / totalLeads) * 100);

    return (
        <AppShell>
            <TopHeader title="Reportes & KPIs" />
            <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-background-light dark:bg-background-dark">
                <div className="max-w-[1600px] mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: 'Leads Nuevos', val: leadsNuevos, trend: 'Pipeline', color: 'text-emerald-600', icon: 'person_add' },
                            { label: 'Leads Calientes', val: leadsCalientes, trend: 'Prioridad', color: 'text-rose-600', icon: 'local_fire_department' },
                            { label: 'Citas Hoy', val: citasHoy, trend: todayStr, color: 'text-emerald-600', icon: 'calendar_month' },
                            { label: 'Tasa Cierre', val: `${tasaCierre}%`, trend: `Goal: 10%`, color: 'text-slate-500', icon: 'analytics' }
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

                    <div className="bg-white dark:bg-[#1a2230] p-6 rounded-2xl shadow-soft border border-slate-100 dark:border-slate-800 h-96 flex items-center justify-center text-slate-400">
                        <div className="text-center">
                            <span className="material-symbols-outlined text-4xl mb-2">bar_chart</span>
                            <p>Gráficos detallados próximamente...</p>
                        </div>
                    </div>
                </div>
            </main>
        </AppShell>
    );
}