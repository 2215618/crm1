"use client";

import { useEffect, useMemo, useState } from "react";

type Appointment = {
  id: string;
  fecha?: string;
  hora?: string;
  cliente?: string;
  telefono?: string;
  propiedad?: string;
  estado?: string;
  notas?: string;
};

async function safeFetchArray<T>(url: string): Promise<T[]> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json().catch(() => null);

    if (!res.ok) return [];
    if (Array.isArray(data)) return data as T[];
    if (data && Array.isArray((data as any).data)) return (data as any).data as T[];
    return [];
  } catch {
    return [];
  }
}

export default function AppointmentsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Appointment[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const arr = await safeFetchArray<Appointment>("/api/appointments");
      if (alive) {
        setItems(Array.isArray(arr) ? arr : []);
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const base = Array.isArray(items) ? items : [];
    if (!query) return base;

    return base.filter((a) => {
      const s =
        `${a.cliente || ""} ${a.telefono || ""} ${a.propiedad || ""} ${a.estado || ""} ${a.fecha || ""}`
          .toLowerCase();
      return s.includes(query);
    });
  }, [items, q]);

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Citas</h1>
          <p className="text-sm text-slate-500">
            Esta vista ya no se cae aunque el API falle. Si no ves citas, revisa tu hoja de Google Sheets.
          </p>
        </div>

        <div className="w-full sm:w-[360px]">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por cliente / teléfono / propiedad / estado..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="text-slate-500">Cargando citas...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-200 p-4 text-slate-600">
            No hay citas (o el Sheet aún no está conectado).<br />
            Prueba abrir: <code className="text-xs">/api/health</code>
          </div>
        ) : (
          <div className="overflow-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-[900px] w-full text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="text-left p-3">Fecha</th>
                  <th className="text-left p-3">Hora</th>
                  <th className="text-left p-3">Cliente</th>
                  <th className="text-left p-3">Teléfono</th>
                  <th className="text-left p-3">Propiedad</th>
                  <th className="text-left p-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-t border-slate-100">
                    <td className="p-3">{a.fecha || "-"}</td>
                    <td className="p-3">{a.hora || "-"}</td>
                    <td className="p-3">{a.cliente || "-"}</td>
                    <td className="p-3">{a.telefono || "-"}</td>
                    <td className="p-3">{a.propiedad || "-"}</td>
                    <td className="p-3">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                        {a.estado || "Programada"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
