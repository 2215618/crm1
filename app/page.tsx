// app/page.tsx
"use client";

import React from 'react';
import AppShell from "@/components/AppShell";
import { useQuery } from "@tanstack/react-query";
import { Property, Appointment } from "@/types";
import Link from "next/link";

async function safeFetchArray<T>(url: string): Promise<T[]> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export default function DashboardPage() {
  const { data: properties = [], isLoading: loadingProps } = useQuery<Property[]>({
    queryKey: ["properties"],
    queryFn: () => safeFetchArray<Property>("/api/properties"),
    staleTime: 10_000,
  });

  const { data: appointments = [], isLoading: loadingAppts } = useQuery<Appointment[]>({
    queryKey: ["appointments"],
    queryFn: () => safeFetchArray<Appointment>("/api/appointments"),
    staleTime: 10_000,
  });

  const totalCount = properties.length;
  const availableCount = properties.filter(p => (p as any).estado === "Disponible").length;
  const reservedCount = properties.filter(p => (p as any).estado === "Reservada").length;

  const todayCount = appointments.length;

  // Si todavía está cargando, igual NO debe crashear
  const loading = loadingProps || loadingAppts;

  return (
    <AppShell>
      <main className="flex-1 overflow-y-auto p-6 bg-background-light dark:bg-background-dark">
        <div className="max-w-[1440px] mx-auto">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-6">
            Dashboard Action Center
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Estado de Inventario */}
            <div className="bg-white dark:bg-[#1a202c] rounded-2xl shadow-soft p-6 border border-slate-200 dark:border-slate-700">
              <h2 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">Estado de Inventario</h2>
              <p className="text-xs text-slate-400 mb-4">{totalCount} propiedades totales</p>

              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-full border-4 border-slate-100 dark:border-slate-700 flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-500">
                    {totalCount === 0 ? "0%" : `${Math.round((availableCount / totalCount) * 100)}%`}
                  </span>
                </div>

                <div className="flex-1 text-sm">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Disponibles</span>
                    <span className="font-bold">{availableCount}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Reservadas</span>
                    <span className="font-bold">{reservedCount}</span>
                  </div>
                </div>
              </div>

              {loading && (
                <p className="mt-4 text-xs text-slate-400">Cargando datos…</p>
              )}
            </div>

            {/* Agenda de Hoy */}
            <div className="bg-white dark:bg-[#1a202c] rounded-2xl shadow-soft p-6 border border-slate-200 dark:border-slate-700 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[18px] text-primary">calendar_month</span>
                <h2 className="text-sm font-bold text-slate-600 dark:text-slate-300">Agenda de Hoy</h2>
              </div>

              <div className="flex items-end justify-between mt-auto">
                <div>
                  <div className="text-4xl font-extrabold">{todayCount}</div>
                  <p className="text-xs text-slate-400">Citas programadas</p>
                </div>
                <Link
                  href="/appointments"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-bold"
                >
                  Ver Agenda <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* Leads Calientes (placeholder visual, sin crash) */}
            <div className="bg-white dark:bg-[#1a202c] rounded-2xl shadow-soft p-6 border border-slate-200 dark:border-slate-700 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[18px] text-red-500">local_fire_department</span>
                <h2 className="text-sm font-bold text-slate-600 dark:text-slate-300">Leads Calientes</h2>
              </div>

              <div className="flex items-end justify-between mt-auto">
                <div>
                  <div className="text-4xl font-extrabold">3</div>
                  <p className="text-xs text-green-600">+1 nuevo</p>
                </div>
                <Link
                  href="/gold-list"
                  className="inline-flex items-center justify-center rounded-xl bg-primary text-white px-4 py-2 text-sm font-bold"
                >
                  Ver Leads
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 text-xs text-slate-400">
            {properties.length === 0 && (
              <p>
                Nota: si tu API falla o no devuelve un array, el Dashboard ya no se cae. (Se mostrará en 0 hasta que el API responda bien.)
              </p>
            )}
          </div>
        </div>
      </main>
    </AppShell>
  );
}
