export type PropertyStatus = 'Disponible' | 'Reservado' | 'No disponible';
export type OperationType = 'Venta' | 'Alquiler';
export type PropertyType = 'Departamento' | 'Casa' | 'Oficina' | 'Terreno' | 'Local';

export interface Property {
  id: string; // internal_id in sheets
  operacion: OperationType;
  tipo: PropertyType;
  propietario_nombre: string;
  propietario_celular: string;
  distrito: string;
  direccion: string;
  referencia?: string;
  area_m2: number;
  precio_soles: number;
  precio_usd_ref: number;
  disponibilidad: PropertyStatus;
  amoblado: boolean;
  tags: string[];
  descripcion: string;
  image_url?: string;
  version: number;
  updated_at: string;
}

export type AppointmentStatus = 'Pendiente' | 'Confirmada' | 'Cancelada' | 'Realizada';

export interface Appointment {
  id: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:mm
  estado: AppointmentStatus;
  interesado_nombre: string;
  interesado_celular: string;
  propiedad_id: string;
  propiedad_titulo?: string; // Hydrated
  nota?: string;
  notificado: boolean;
  notificado_at?: string;
  version: number;
}

export type LeadStatus = 'Nuevo' | 'Contactado' | 'Caliente' | 'Cerrado';
export type LeadInterest = 'Comprar' | 'Alquilar';

export interface Lead {
  id: string;
  nombre: string;
  celular: string;
  interes: LeadInterest;
  presupuesto: string;
  estado: LeadStatus;
  nota?: string;
  version: number;
  created_at: string;
}

export interface MetaData {
  last_change_ts: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  meta?: MetaData;
}