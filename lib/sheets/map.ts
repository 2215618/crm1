import { Property, Appointment, Lead } from "../../types";

export function mapRowsToProperties(rows: any[]): Property[] {
  // Assuming strict column order for simplicity in this generated code
  // In production, we should map by header name dynamically
  // 0:id, 1:operacion, 2:tipo, 3:prop_nombre, 4:prop_cel, 5:distrito, 6:direccion, 7:area, 8:precio_s, 9:precio_d, 10:disp, 11:amob, 12:tags, 13:desc, 14:img, 15:ver, 16:updated
  return rows.map(row => ({
    id: row[0],
    operacion: row[1],
    tipo: row[2],
    propietario_nombre: row[3],
    propietario_celular: row[4],
    distrito: row[5],
    direccion: row[6],
    area_m2: Number(row[7]),
    precio_soles: Number(row[8]),
    precio_usd_ref: Number(row[9]),
    disponibilidad: row[10],
    amoblado: row[11] === 'TRUE',
    tags: row[12] ? row[12].split(',') : [],
    descripcion: row[13],
    image_url: row[14],
    version: Number(row[15]),
    updated_at: row[16]
  }));
}

export function mapRowsToAppointments(rows: any[]): Appointment[] {
  return rows.map(row => ({
    id: row[0],
    fecha: row[1],
    hora: row[2],
    estado: row[3],
    interesado_nombre: row[4],
    interesado_celular: row[5],
    propiedad_id: row[6],
    notificado: row[7] === 'TRUE',
    version: Number(row[8])
  }));
}

export function mapRowsToLeads(rows: any[]): Lead[] {
  return rows.map(row => ({
    id: row[0],
    nombre: row[1],
    celular: row[2],
    interes: row[3],
    presupuesto: row[4],
    estado: row[5],
    version: Number(row[6]),
    created_at: row[7]
  }));
}