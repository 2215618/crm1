"use client";

import React from 'react';
import AppShell from "@/components/AppShell";
import TopHeader from "@/components/TopHeader";
import { useQuery } from "@tanstack/react-query";
import { Lead } from "@/types";
import { safeFetchArray } from "@/lib/api/safeFetch";

export default function GoldListPage() {
  const { data: leads } = useQuery<Lead[]>({
    queryKey: ["leads"],
    queryFn: () => safeFetchArray<Lead>("/api/leads"),
    initialData: [] 
  });

  const columns = [
    { title: 'Nuevo', color: 'bg-blue-500', status: 'Nuevo' },
    { title: 'Contactado', color: 'bg-yellow-400', status: 'Contactado' },
    { title: 'Caliente', color: 'bg-orange-500', status: 'Caliente' },
    { title: 'Cerrado', color: 'bg-green-500', status: 'Cerrado' }
  ];

  // Double safety check
  const safeLeads = Array.isArray(leads) ? leads : [];

  return (
    <AppShell>
      <TopHeader title="Lista Dorada" />
      <div className="flex-1 overflow-x-auto kanban-scroll p-6 bg-background-light dark:bg-background-dark">
        <div className="flex h-full gap-6 min-w-full">
          {columns.map((col, i) => {
             const colLeads = safeLeads.filter(l => l.estado === col.status);
             return (
              <div key={i} className="flex flex-col w-[320px] shrink-0">
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2">
                    <div className={`size-2 rounded-full ${col.color}`}></div>
                    <h3 className="font-bold">{col.title}</h3>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold px-2 py-0.5 rounded-full">{colLeads.length}</span>
                  </div>
                  <button className="text-slate-400 hover:text-primary"><span className="material-symbols-outlined">add</span></button>
                </div>
                <div className="flex-1 flex flex-col gap-3">
                  {colLeads.map((card) => (
                    <div key={card.id} className="group relative flex flex-col bg-white dark:bg-[#1a2234] rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                           <div className="size-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs">{card.nombre.charAt(0)}</div>
                          <div>
                            <h4 className="text-sm font-bold leading-tight">{card.nombre}</h4>
                            <p className="text-[10px] text-slate-400 font-medium">{card.celular}</p>
                          </div>
                        </div>
                        <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase">{card.interes}</span>
                      </div>
                      <p className="font-bold text-sm mb-1">{card.presupuesto}</p>
                      <button className="w-full py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg transition-colors mt-2">WhatsApp</button>
                    </div>
                  ))}
                  {colLeads.length === 0 && (
                    <div className="flex flex-col items-center justify-center text-center p-8 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 h-48 opacity-50">
                      <span className="material-symbols-outlined text-slate-400 mb-2">inbox</span>
                      <p className="text-xs">Sin registros</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}