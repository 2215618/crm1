import { Property, Appointment, Lead } from "../../types";

// Helper to safely parse numbers
const safeNum = (val: string | undefined) => {
  if (!val) return 0;
  // Remove currency symbols or commas if present
  const clean = val.replace(/[^0-9.-]+/g,"");
  return Number(clean) || 0;
};

export function mapRowsToProperties(rows: Record<string, string>[]): Property[] {
  if (!Array.isArray(rows)) return [];
  
  return rows.map(row => ({
    // Keys match the normalized headers in client.ts (lowercase, underscores)
    id: row['id'] || '',
    operacion: (row['operacion'] as any) || 'Venta',
    tipo: (row['tipo'] as any) || 'Departamento',
    propietario_nombre: row['propietario_nombre'] || '',
    propietario_celular: row['propietario_celular'] || '',
    distrito: row['distrito'] || '',
    direccion: row['direccion'] || '',
    area_m2: safeNum(row['area_m2']),
    precio_soles: safeNum(row['precio_soles']),
    precio_usd_ref: safeNum(row['precio_usd_ref']),
    disponibilidad: (row['disponibilidad'] as any) || 'Disponible',
    amoblado: row['amoblado'] === 'TRUE',
    tags: row['tags'] ? row['tags'].split(',') : [],
    descripcion: row['descripcion'] || '',
    image_url: row['image_url'] || '',
    version: safeNum(row['version']),
    updated_at: row['updated_at'] || new Date().toISOString()
  }));
}

export function mapRowsToAppointments(rows: Record<string, string>[]): Appointment[] {
  if (!Array.isArray(rows)) return [];

  return rows.map(row => ({
    id: row['id'] || '',
    fecha: row['fecha'] || '',
    hora: row['hora'] || '',
    estado: (row['estado'] as any) || 'Pendiente',
    interesado_nombre: row['interesado_nombre'] || '',
    interesado_celular: row['interesado_celular'] || '',
    propiedad_id: row['propiedad_id'] || '',
    notificado: row['notificado'] === 'TRUE',
    version: safeNum(row['version'])
  }));
}

export function mapRowsToLeads(rows: Record<string, string>[]): Lead[] {
  if (!Array.isArray(rows)) return [];

  return rows.map(row => ({
    id: row['id'] || '',
    nombre: row['nombre'] || '',
    celular: row['celular'] || '',
    interes: (row['interes'] as any) || 'Comprar',
    presupuesto: row['presupuesto'] || '',
    estado: (row['estado'] as any) || 'Nuevo',
    version: safeNum(row['version']),
    created_at: row['created_at'] || new Date().toISOString()
  }));
}
