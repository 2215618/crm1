"use client";

import React from 'react';
import AppShell from "@/components/AppShell";
import TopHeader from "@/components/TopHeader";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Property } from "@/types";
import { toast } from "sonner";

export default function PropertiesPage() {
  const [view, setView] = useState<'Cards' | 'Table'>('Cards');

  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ["properties"],
    queryFn: async () => {
      const res = await fetch("/api/properties");
      if (!res.ok) throw new Error("Network error");
      return res.json();
    }
  });

  const handleCreate = () => {
    toast.info("Funcionalidad de Crear Propiedad próximamente (Requiere Modal Completo)");
  };

  return (
    <AppShell>
      <TopHeader title="Inventario de Propiedades" onNewClick={handleCreate} />
      <main className="flex-1 overflow-y-auto p-6 bg-background-light dark:bg-background-dark">
        <div className="max-w-[1440px] mx-auto">
          {/* Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              <button className="flex items-center justify-center rounded-lg h-9 px-3 bg-white dark:bg-gray-800 border border-[#e5e7eb] dark:border-gray-700 text-sm font-semibold transition-colors">
                <span className="material-symbols-outlined text-[18px] mr-2">tune</span>Filtros
              </button>
              <div className="flex gap-2">
                  <div className="flex h-8 items-center gap-x-1.5 rounded-lg bg-primary/10 pl-2 pr-3 border border-primary/20">
                      <span className="material-symbols-outlined text-[16px] text-primary cursor-pointer">close</span>
                      <p className="text-primary text-sm font-medium whitespace-nowrap">Disponible</p>
                  </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-9 items-center justify-center rounded-lg bg-[#e5e7eb] dark:bg-gray-700 p-1">
                <button onClick={() => setView('Cards')} className={`px-3 h-full rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${view === 'Cards' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary' : 'text-gray-500'}`}>
                  <span className="material-symbols-outlined text-[18px]">grid_view</span>Cards
                </button>
                <button onClick={() => setView('Table')} className={`px-3 h-full rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${view === 'Table' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary' : 'text-gray-500'}`}>
                  <span className="material-symbols-outlined text-[18px]">table_rows</span>Table
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {[1,2,3,4].map(i => (
                 <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
               ))}
             </div>
          ) : view === 'Cards' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {properties?.map((prop) => (
                <div key={prop.id} className="group flex flex-col bg-white dark:bg-[#1a202c] rounded-xl shadow-soft hover:shadow-lg overflow-hidden border border-transparent dark:border-gray-800 transition-all">
                  <div className="relative h-48 bg-cover bg-center transition-transform" style={{backgroundImage: `url('${prop.image_url || 'https://picsum.photos/400/300'}')`}}>
                    <span className={`absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-bold text-white ${prop.operacion === 'Venta' ? 'bg-blue-600' : 'bg-green-500'}`}>{prop.operacion}</span>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-lg font-bold leading-tight truncate mb-2">{prop.distrito}, {prop.direccion}</h3>
                    <div className="flex justify-between items-end mb-4">
                      <span className="text-primary text-lg font-bold">
                        {prop.operacion === 'Venta' ? `USD ${prop.precio_usd_ref.toLocaleString()}` : `S/ ${prop.precio_soles.toLocaleString()}`}
                      </span>
                      <span className="text-xs text-gray-400">{prop.area_m2} m²</span>
                    </div>
                    <button className="mt-auto w-full py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-xs font-bold rounded-lg transition-colors">Gestionar</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700">
                    <tr>
                      <th className="p-3 pl-6 text-xs font-bold uppercase text-slate-500">Tipo</th>
                      <th className="p-3 text-xs font-bold uppercase text-slate-500">Operación</th>
                      <th className="p-3 text-xs font-bold uppercase text-slate-500">Dirección</th>
                      <th className="p-3 text-xs font-bold uppercase text-slate-500">Precio</th>
                      <th className="p-3 text-xs font-bold uppercase text-slate-500">Área</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {properties?.map(prop => (
                      <tr key={prop.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <td className="p-3 pl-6 text-sm font-medium">{prop.tipo}</td>
                        <td className="p-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${prop.operacion === 'Venta' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{prop.operacion}</span></td>
                        <td className="p-3 text-sm">{prop.distrito}, {prop.direccion}</td>
                        <td className="p-3 text-sm font-bold">{prop.operacion === 'Venta' ? `$ ${prop.precio_usd_ref.toLocaleString()}` : `S/ ${prop.precio_soles.toLocaleString()}`}</td>
                        <td className="p-3 text-sm">{prop.area_m2} m²</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          )}
        </div>
      </main>
    </AppShell>
  );
}