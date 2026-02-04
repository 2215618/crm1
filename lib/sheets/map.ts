import type { Appointment, Lead, Property } from '@/types';

const clean = (v: unknown) => String(v ?? '').trim();

const toNumber = (v: unknown): number => {
  const s = clean(v)
    .replace(/S\//gi, '')
    .replace(/usd/gi, '')
    .replace(/,/g, '')
    .replace(/\s/g, '');
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};

const parseUsdRef = (v: unknown): number => {
  const raw = clean(v).toLowerCase();
  if (!raw) return 0;
  const withDots = raw.replace(/,/g, '').replace(/\s+/g, '');
  const milMatch = withDots.match(/^([0-9]+(?:\.[0-9]+)?)mil$/);
  if (milMatch) return Math.round(Number(milMatch[1]) * 1000);
  const n = Number(withDots);
  return Number.isFinite(n) ? n : 0;
};

const deriveStatus = (estado: string): Property['disponibilidad'] => {
  const s = estado.toLowerCase();
  if (s.includes('reserv')) return 'Reservado';
  if (s.includes('no')) return 'No disponible';
  return 'Disponible';
};

export function mapRowsToProperties(rows: any[][]): Property[] {
  if (!Array.isArray(rows) || rows.length < 2) return [];
  const data = rows.slice(1);

  return data.map((row, i) => {
    const propietario_nombre = clean(row[0]);
    const tipo = clean(row[1]) as any;
    const direccion = clean(row[2]);
    const distrito = clean(row[3]);
    const frente = toNumber(row[4]);
    const fondo = toNumber(row[5]);
    const area_m2 = toNumber(row[6]);
    const descripcion = clean(row[7]);
    const precio_soles = toNumber(row[8]);
    const estadoRaw = clean(row[10]);
    const disponibilidad = deriveStatus(estadoRaw);
    const amoblado = estadoRaw.toLowerCase().includes('amobl');
    const operacion = clean(row[12]) === 'VENTA' ? 'Venta' : 'Alquiler';
    const precio_usd_ref = parseUsdRef(row[14]);

    const id = clean(row[11]) || `PROP-${String(i + 1).padStart(3, '0')}`;

    return {
      id,
      operacion,
      tipo,
      propietario_nombre,
      propietario_celular: '',
      distrito,
      direccion,
      area_m2,
      precio_soles,
      precio_usd_ref,
      disponibilidad,
      amoblado,
      tags: [],
      descripcion,
      version: 1,
      updated_at: new Date().toISOString()
    };
  });
}

export function mapRowsToAppointments(rows: any[][]): Appointment[] {
  if (!Array.isArray(rows) || rows.length < 2) return [];
  return rows.slice(1).map((r, i) => ({
    id: clean(r[0]) || `CITA-${i + 1}`,
    fecha: clean(r[1]),
    hora: clean(r[2]),
    estado: clean(r[3]) as any,
    interesado_nombre: clean(r[4]),
    interesado_celular: clean(r[5]),
    propiedad_id: clean(r[6]),
    nota: clean(r[7]),
    notificado: clean(r[8]).toLowerCase() === 'si',
    notificado_at: clean(r[9]),
    version: 1
  }));
}

export function mapRowsToLeads(rows: any[][]): Lead[] {
  if (!Array.isArray(rows) || rows.length < 2) return [];
  return rows.slice(1).map((r, i) => ({
    id: clean(r[0]) || `LEAD-${i + 1}`,
    nombre: clean(r[1]),
    celular: clean(r[2]),
    interes: clean(r[3]) as any,
    presupuesto: clean(r[4]),
    estado: clean(r[5]) as any,
    nota: clean(r[6]),
    version: 1,
    created_at: new Date().toISOString()
  }));
}
