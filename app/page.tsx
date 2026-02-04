"use client";

import AppShell from "@/components/AppShell";
import TopHeader from "@/components/TopHeader";
import { useQuery } from "@tanstack/react-query";
import { Property, Appointment, Lead } from "@/types";

async function fetchArray<T>(url: string): Promise<T[]> {
  const res = await fetch(url);
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error((json as any)?.error || `Request failed: ${res.status}`);
  }
  if (Array.isArray(json)) return json as T[];
  if (Array.isArray((json as any)?.items)) return (json as any).items as T[];
  return [];
}

export default function DashboardPage() {
  const { data: propertiesRaw, isError: propertiesError } = useQuery<Property[]>({
    queryKey: ["properties"],
    queryFn: () => fetchArray<Property>("/api/properties"),
    retry: 1,
    staleTime: 30_000
  });

  const { data: appointmentsRaw, isError: appointmentsError } = useQuery<Appointment[]>({
    queryKey: ["appointments"],
    queryFn: () => fetchArray<Appointment>("/api/appointments"),
    retry: 1,
    staleTime: 30_000
  });

  const { data: leadsRaw, isError: leadsError } = useQuery<Lead[]>({
    queryKey: ["leads"],
    queryFn: () => fetchArray<Lead>("/api/leads"),
    retry: 1,
    staleTime: 30_000
  });

  const properties = Array.isArray(propertiesRaw) ? propertiesRaw : [];
  const appointments = Array.isArray(appointmentsRaw) ? appointmentsRaw : [];
  const leads = Array.isArray(leadsRaw) ? leadsRaw : [];

  const disponibles = properties.filter(p => p.disponibilidad === "Disponible").length;
  const reservadas = properties.filter(p => p.disponibilidad === "Reservado").length;

  const citasHoy = appointments.length;

  const leadsCalientes = leads.filter(l => l.estado === "Caliente").length;

  return (
    <AppShell>
      <TopHeader title="Dashboard Action Center" />

      {(propertiesError || appointmentsError || leadsError) && (
        <div className="mx-6 mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          No se pudo cargar data desde Google Sheets (API falló). Configura las variables en Vercel.
        </div>
      )}

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow border">
          <h3 className="font-semibold">Estado de Inventario</h3>
          <p className="text-sm text-gray-500">{properties.length} propiedades totales</p>
          <div className="mt-4 text-sm">
            <div className="flex justify-between">
              <span>Disponibles</span>
              <b>{disponibles}</b>
            </div>
            <div className="flex justify-between">
              <span>Reservadas</span>
              <b>{reservadas}</b>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow border">
          <h3 className="font-semibold">Agenda de Hoy</h3>
          <p className="text-4xl font-bold mt-3">{citasHoy}</p>
          <p className="text-sm text-gray-500">Citas programadas</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow border">
          <h3 className="font-semibold">Leads Calientes</h3>
          <p className="text-4xl font-bold mt-3">{leadsCalientes}</p>
          <p className="text-sm text-gray-500">en seguimiento</p>
        </div>
      </div>
    </AppShell>
  );
}
