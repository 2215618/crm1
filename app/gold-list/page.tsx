"use client";

import { useEffect, useMemo, useState } from "react";

type Lead = {
  id: string;
  nombre?: string;
  telefono?: string;
  celular?: string;
  estado?: string;
  prioridad?: string;
  fuente?: string;
  fecha?: string;
  notas?: string;
};

async function safeFetchArray<T>(url: string): Promise<T[]> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json().catch(() => null);

    // Si el API falla o devuelve algo raro, SIEMPRE devolvemos []
    if (!res.ok) return [];
    if (Array.isArray(data)) return data as T[];
    if (data && Array.isArray((data as any).data)) return (data as any).data as T[];
    return [];
  } catch {
    return [];
  }
}

export default function GoldListPage() {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const arr = await safeFetchArray<Lead>("/api/leads");
      if (alive) {
        setLeads(Array.isArray(arr) ? arr : []);
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const goldLeads = useMemo(() => {
    const query = q.trim().toLowerCase();
    const base = Array.isArray(leads) ? leads : [];

    const onlyGold = base.filter((l) => {
      const st = (l.estado || "").toLowerCase();
      return st === "dorado" || st === "gold" || st === "lista dorada";
    });

    if (!query) return onlyGold;

    return onlyGold.filter((l) => {
      const nombre = (l.nombre || "").toLowerCase();
      const tel = (l.telefono || l.celular || "").toLowerCase();
      const notas = (l.notas || "").toLowerCase();
      return nombre.includes(query) || tel.includes(query) || notas.includes(query);
    });
  }, [leads, q]);

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Lista Dorada</h1>
          <p className="text-sm text-slate-500">
            Esta vista ya no se cae aunque el API falle. Si no ves datos, revisa tu Google Sheet.
          </p>
        </div>

        <div className="w-full sm:w-[360px]">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre / teléfono / notas..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="text-slate-500">Cargando leads...</div>
        ) : goldLeads.length === 0 ? (
          <div className="rounded-xl border border-slate-200 p-4 text-slate-600">
            No hay leads en <b>estado = Dorado</b> (o el Sheet aún no está conectado).<br />
            Prueba abrir: <code className="text-xs">/api/health</code> para validar conexión.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {goldLeads.map((l) => (
              <div key={l.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{l.nombre || "Sin nombre"}</div>
                    <div className="text-sm text-slate-600 truncate">
                      {(l.telefono || l.celular) ? `📞 ${l.telefono || l.celular}` : "📞 (sin teléfono)"}
                    </div>
                  </div>
                  <span className="text-xs rounded-full bg-amber-100 text-amber-800 px-2 py-1">
                    {l.estado || "Dorado"}
                  </span>
                </div>

                <div className="mt-3 text-sm text-slate-700 space-y-1">
                  <div><b>Prioridad:</b> {l.prioridad || "Media"}</div>
                  <div><b>Fuente:</b> {l.fuente || "Sheets"}</div>
                  {l.fecha ? <div><b>Fecha:</b> {l.fecha}</div> : null}
                </div>

                {l.notas ? (
                  <div className="mt-3 text-sm text-slate-600 line-clamp-3">
                    <b>Notas:</b> {l.notas}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
