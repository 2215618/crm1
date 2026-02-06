"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";

type AnyObj = Record<string, any>;

async function safeFetchArray(url: string): Promise<AnyObj[]> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default function ReportsPage() {
  const [properties, setProperties] = useState<AnyObj[]>([]);
  const [leads, setLeads] = useState<AnyObj[]>([]);
  const [appointments, setAppointments] = useState<AnyObj[]>([]);

  useEffect(() => {
    (async () => {
      const [p, l, a] = await Promise.all([
        safeFetchArray("/api/properties"),
        safeFetchArray("/api/leads"),
        safeFetchArray("/api/appointments"),
      ]);
      setProperties(p);
      setLeads(l);
      setAppointments(a);
    })();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const sameDay = (d: Date, x: Date) =>
      d.getFullYear() === x.getFullYear() && d.getMonth() === x.getMonth() && d.getDate() === x.getDate();

    const leadsNew = leads.length;

    // lead status might be "nuevo", "caliente", etc. Try common keys.
    const leadsHot = leads.filter((x) => {
      const s = (x.estado || x.status || "").toString().toLowerCase();
      const p = (x.prioridad || x.priority || "").toString().toLowerCase();
      return s.includes("calient") || p.includes("alta") || p.includes("hot");
    }).length;

    const citasHoy = appointments.filter((x) => {
      const raw = x.fecha || x.date || x.dia || "";
      const d = raw ? new Date(raw) : null;
      return d && !isNaN(d.getTime()) ? sameDay(d, now) : false;
    }).length;

    // very simple closure rate proxy:
    // If properties have status "sold"/"alquilado"/"cerrado" count them, else 0.
    const closed = properties.filter((x) => {
      const s = (x.status || x.estado || "").toString().toLowerCase();
      return s.includes("sold") || s.includes("vend") || s.includes("alquil") || s.includes("cerr");
    }).length;

    const total = Math.max(properties.length, 1);
    const tasaCierre = (closed / total) * 100;

    return {
      leadsNew,
      leadsHot,
      citasHoy,
      tasaCierre: isFinite(tasaCierre) ? tasaCierre : 0,
    };
  }, [leads, appointments, properties]);

  return (
    <AppShell title="Reportes & KPIs">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-xs text-slate-500">LEADS NUEVOS</div>
          <div className="text-3xl font-semibold mt-2">{stats.leadsNew}</div>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-xs text-slate-500">LEADS CALIENTES</div>
          <div className="text-3xl font-semibold mt-2">{stats.leadsHot}</div>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-xs text-slate-500">CITAS HOY</div>
          <div className="text-3xl font-semibold mt-2">{stats.citasHoy.toString().padStart(2, "0")}</div>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-xs text-slate-500">TASA CIERRE</div>
          <div className="text-3xl font-semibold mt-2">{stats.tasaCierre.toFixed(1)}%</div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border bg-white p-4 text-sm text-slate-600">
        Estos KPIs se calculan en base a lo que exista en tus pestañas de Google Sheets (Properties, Appointment, GoldLeads).
        Si una pestaña está vacía o tu formato no incluye ciertos campos, el KPI se mostrará en 0 en lugar de inventar datos.
      </div>
    </AppShell>
  );
}
