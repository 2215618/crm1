"use client";

import React from 'react';
import AppShell from "@/components/AppShell";
import TopHeader from "@/components/TopHeader";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Appointment } from "@/types";
import { safeFetchArray } from "@/lib/api/safeFetch";
import clsx from "clsx";

export default function AppointmentsPage() {
  const [selectedCita, setSelectedCita] = useState<Appointment | null>(null);

  const { data: appointments } = useQuery<Appointment[]>({
    queryKey: ["appointments"],
    queryFn: () => safeFetchArray<Appointment>("/api/appointments"),
    initialData: []
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmada': return 'bg-green-100 text-green-700';
      case 'Pendiente': return 'bg-yellow-100 text-yellow-700';
      case 'Cancelada': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const safeAppointments = Array.isArray(appointments) ? appointments : [];

  return (
    <AppShell>
      <TopHeader title="Agenda de Citas" />
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6">
          <div className="max-w-7xl mx-auto flex flex-col gap-3">
            <div className="flex items-center gap-4 py-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Próximas Citas</span>
              <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1"></div>
            </div>
            
            {safeAppointments.map(item => (
              <div key={item.id} onClick={() => setSelectedCita(item)} className="group relative flex items-center gap-4 p-4 bg-white dark:bg-[#1a2230] rounded-lg shadow-sm border border-transparent hover:border-primary/20 cursor-pointer transition-all">
                <div className="flex flex-col items-center justify-center w-20 shrink-0 border-r border-gray-100 dark:border-gray-800 pr-4">
                  <span className="text-base font-bold text-[#111318] dark:text-white">{item.hora}</span>
                </div>
                <div className="flex flex-1 items-start gap-4 overflow-hidden">
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                    {item.interesado_nombre.charAt(0)}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-[#111318] dark:text-white truncate">{item.interesado_nombre}</h3>
                      <span className={clsx("inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold", getStatusColor(item.estado))}>
                        {item.estado}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="material-symbols-outlined text-[16px] text-primary">apartment</span>
                      <span className="text-xs font-medium text-primary hover:underline truncate">{item.propiedad_id}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {safeAppointments.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-sm">No hay citas programadas o no hay conexión.</div>
            )}
          </div>
        </main>
        
        {selectedCita && (
          <div className="relative w-[400px] bg-white dark:bg-[#1a2230] border-l border-gray-200 dark:border-gray-800 h-full shadow-drawer shrink-0 flex flex-col z-30">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold">Editar Cita</h2>
              <button onClick={() => setSelectedCita(null)} className="p-1 rounded-full hover:bg-gray-100"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">{selectedCita.interesado_nombre.charAt(0)}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{selectedCita.interesado_nombre}</p>
                  <p className="text-xs text-gray-500">{selectedCita.interesado_celular}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fecha</label>
                  <input className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:bg-[#252b36]" value={selectedCita.fecha} readOnly />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hora</label>
                  <input className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:bg-[#252b36]" value={selectedCita.hora} readOnly />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}