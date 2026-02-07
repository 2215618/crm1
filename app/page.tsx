"use client";

import React from 'react';
import AppShell from "@/components/AppShell";
import TopHeader from "@/components/TopHeader";
import { useQuery } from "@tanstack/react-query";
import { Property, Appointment } from "@/types";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const { data: properties } = useQuery<Property[]>({
    queryKey: ["properties"],
    queryFn: () => fetch("/api/properties").then(res => res.json())
  });

  const { data: appointments } = useQuery<Appointment[]>({
    queryKey: ["appointments"],
    queryFn: () => fetch("/api/appointments").then(res => res.json())
  });

  const available = properties?.filter(p => p.disponibilidad === 'Disponible').length || 0;
  const reserved = properties?.filter(p => p.disponibilidad === 'Reservado').length || 0;
  const total = properties?.length || 0;
  const percentage = total > 0 ? Math.round((available / total) * 100) : 0;
  
  const todayAppointments = appointments?.filter(a => a.fecha === new Date().toISOString().split('T')[0]).length || 0;

  return (
    <AppShell>
      <TopHeader title="Dashboard Action Center" showSearch={false} />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-[1920px] mx-auto pb-8">
          
          {/* Inventory Stats */}
          <div className="col-span-12 md:col-span-6 xl:col-span-4 bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-border-light dark:border-border-dark shadow-subtle flex flex-col justify-between h-48 relative overflow-hidden group">
            <div className="flex justify-between items-start z-10">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Estado de Inventario</h3>
                <p className="text-xs text-slate-500 mt-1">{total} propiedades totales</p>
              </div>
            </div>
            <div className="flex items-center gap-6 mt-2 z-10">
              <div className="relative size-20 shrink-0">
                <svg className="size-full -rotate-90 transform group-hover:scale-105 transition-transform duration-500" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" className="text-gray-100 dark:text-gray-800" stroke="currentColor" strokeWidth="4" />
                  <circle cx="18" cy="18" r="16" fill="none" className="text-primary" stroke="currentColor" strokeWidth="4" strokeDasharray={`${percentage}, 100`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-xs font-bold text-slate-400">{percentage}%</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <div className="flex justify-between items-center text-sm border-b border-dashed border-gray-100 dark:border-gray-800 pb-1">
                  <span className="text-slate-600 dark:text-slate-300 text-xs font-medium">Disponibles</span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs">{available}</span>
                </div>
                <div className="flex justify-between items-center text-sm pb-1">
                  <span className="text-slate-600 dark:text-slate-300 text-xs font-medium">Reservadas</span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs">{reserved}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Agenda Stats */}
          <div className="col-span-12 md:col-span-6 xl:col-span-4 bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-border-light dark:border-border-dark shadow-subtle flex flex-col justify-between h-48 relative overflow-hidden">
            <div className="flex justify-between items-start z-10">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">calendar_today</span>
                Agenda de Hoy
              </h3>
            </div>
            <div className="flex items-end justify-between z-10 mb-1">
              <div className="flex flex-col">
                <span className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{todayAppointments}</span>
                <span className="text-xs text-slate-500 font-medium mt-1">Citas programadas</span>
              </div>
              <button onClick={() => router.push('/appointments')} className="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 px-4 py-2 rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-slate-200 dark:shadow-none">
                Ver Agenda
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>

           {/* Quick Action - Leads */}
           <div className="col-span-12 md:col-span-12 xl:col-span-4 bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-border-light dark:border-border-dark shadow-subtle flex flex-col justify-between h-48 relative overflow-hidden">
             <div className="flex justify-between items-start z-10">
               <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                 <span className="material-symbols-outlined text-red-500 text-[18px]">local_fire_department</span>
                 Leads Calientes
               </h3>
             </div>
             <div className="flex items-center gap-4 z-10 mt-2">
               <div className="flex-1">
                 <span className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">3</span>
                 <div className="flex items-center gap-1 mt-1">
                   <span className="text-xs text-green-600 font-bold">+1 nuevo</span>
                 </div>
               </div>
               <button onClick={() => router.push('/gold-list')} className="w-full max-w-[120px] bg-primary text-white text-[12px] font-bold py-2 rounded-lg">Ver Leads</button>
             </div>
           </div>

        </div>
      </div>
    </AppShell>
  );
}