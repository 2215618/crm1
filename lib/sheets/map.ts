import type { Appointment, Lead, Property, PropertyType } from '@/types';

type AnyRow = Record<string, unknown>;

function s(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v.trim();
  return String(v).trim();
}

function pick(row: AnyRow, keys: string[], fallback = ''): string {
  for (const k of keys) {
    const val = s(row[k]);
    if (val) return val;
  }
  return fallback;
}

function parseNumberLoose(v: unknown): number {
  const raw = s(v);
  if (!raw) return 0;
  // keep digits, comma, dot, minus
  let t = raw.replace(/[^0-9,.-]+/g, '');
  if (!t) return 0;

  const lastComma = t.lastIndexOf(',');
  const lastDot = t.lastIndexOf('.');
  if (lastComma !== -1 && lastDot !== -1) {
    // both present -> decide decimal separator by the last occurrence
    if (lastDot > lastComma) {
      // dot is decimal -> remove commas (thousands)
      t = t.replace(/,/g, '');
    } else {
      // comma is decimal -> remove dots (thousands), comma -> dot
      t = t.replace(/\./g, '').replace(/,/g, '.');
    }
  } else if (lastComma !== -1) {
    // comma only -> treat as decimal
    t = t.replace(/,/g, '.');
  }

  const n = Number.parseFloat(t);
  return Number.isFinite(n) ? n : 0;
}

function parseIntLoose(v: unknown): number {
  const n = Math.trunc(parseNumberLoose(v));
  return Number.isFinite(n) ? n : 0;
}

function inferOperacion(row: AnyRow, descripcion: string): 'Venta' | 'Alquiler' {
  const opRaw = pick(row, ['operacion', 'tipo_operacion', 'operacion_inmueble', 'venta_o_alquiler']);
  const op = opRaw.toLowerCase();
  if (op.includes('venta')) return 'Venta';
  if (op.includes('alquiler') || op.includes('renta') || op.includes('arrend')) return 'Alquiler';

  const desc = (descripcion || '').toLowerCase();
  if (desc.includes('[venta]') || desc.includes('venta')) return 'Venta';
  return 'Alquiler';
}

function inferPropertyType(raw: string): PropertyType {
  const t = raw.toLowerCase();
  if (t.includes('terreno') || t.includes('lote')) return 'Terreno';
  if (t.includes('depart') || t.includes('dpto') || t.includes('mono')) return 'Departamento';
  if (t.includes('local') || t.includes('comercial') || t.includes('tienda')) return 'Local';
  if (t.includes('casa')) return 'Casa';
  // fallback
  return 'Casa';
}

function inferDisponibilidad(row: AnyRow): Property['disponibilidad'] {
  const raw = pick(row, ['disponibilidad', 'estado', 'status', 'situacion'], 'Disponible');
  const v = raw.toLowerCase();
  if (v.includes('ocup')) return 'Ocupado';
  if (v.includes('reser')) return 'Reservado';
  if (v.includes('manten') || v.includes('repar')) return 'En mantenimiento';
  return 'Disponible';
}

function parseVentaPriceFromDescripcion(descripcion: string): number {
  const d = (descripcion || '').replace(/\s+/g, ' ');
  // Try PEN first
  const pen = d.match(/S\s*\/\s*([0-9.,]+)/i);
  if (pen?.[1]) return parseNumberLoose(pen[1]);
  // Try USD
  const usd = d.match(/US\$\s*([0-9.,]+)/i);
  if (usd?.[1]) return 0; // keep as 0 (we store USD separately, but we don't want to guess FX)
  return 0;
}

export function mapRowsToProperties(rows: AnyRow[]): Property[] {
  return (rows || []).map((row, idx) => {
    const descripcion = pick(row, ['descripcion', 'caracteristicas', 'caracteristicas_descr', 'detalle', 'observaciones', 'notas']);

    const tipoRaw = pick(row, ['tipo', 'tipo_de_inmueble', 'tipo_inmueble', 'tipo_propiedad']);
    const tipo = inferPropertyType(tipoRaw);

    const direccion = pick(row, ['direccion', 'direccion_del_inmueble', 'direccion_inmueble', 'ubicacion', 'direccion_propiedad']);
    const distrito = pick(row, ['distrito', 'zona_distrito', 'zona', 'zona_o_distrito']);

    const operacion = inferOperacion(row, descripcion);

    // Precio: prefer explicit column; if venta and price missing, try parse from description.
    let precioSoles = parseNumberLoose(
      pick(row, ['precio_soles', 'precio', 'precio_alquiler_s', 'precio_alquiler', 'precio_alquiler_soles', 'precio_alquiler_s_'])
    );
    if (operacion === 'Venta' && !precioSoles) {
      precioSoles = parseVentaPriceFromDescripcion(descripcion);
    }

    const areaM2 = parseNumberLoose(pick(row, ['area_m2', 'area', 'area_total', 'area_metros', 'area_m']));
    const dormitorios = parseIntLoose(pick(row, ['dormitorios', 'habitaciones', 'n_habitaciones', 'hab']));
    const banos = parseIntLoose(pick(row, ['banos', 'banos_totales', 'bano', 'n_banos']));
    const estacionamientos = parseIntLoose(pick(row, ['estacionamientos', 'cocheras', 'parking']));

    const propietarioNombre = pick(row, ['propietario_nombre', 'nombre_del_propietario', 'propietario', 'dueno', 'owner_name']);
    const propietarioCelular = pick(row, ['propietario_celular', 'celular_propietario', 'telefono_propietario', 'owner_phone']);

    const titulo = pick(row, ['titulo', 'title'], tipoRaw ? tipoRaw : (direccion ? `${tipo} - ${direccion}` : `${tipo} en ${distrito || 'Iquitos'}`));

    const imagenUrl = pick(row, ['imagen_url', 'image_url', 'foto', 'imagen', 'url_imagen']);

    const id = pick(row, ['id', 'codigo', 'property_id', 'id_propiedad'], `prop_${idx + 2}`);
    const updatedAt = pick(row, ['updated_at', 'actualizado', 'fecha_actualizacion'], new Date().toISOString());
    const notas = pick(row, ['notas', 'nota', 'observacion', 'comentarios'], '');

    const tags: string[] = [];
    if (tipoRaw) tags.push(tipoRaw);
    if (distrito) tags.push(distrito);
    if (operacion) tags.push(operacion);

    return {
      id,
      titulo,
      direccion,
      distrito,
      operacion,
      tipo,
      precio_soles: precioSoles,
      precio_usd_ref: parseNumberLoose(pick(row, ['precio_usd_ref', 'precio_usd', 'usd_ref', 'precio_referencia_usd'])),
      area_m2: areaM2,
      dormitorios,
      banos,
      estacionamientos,
      amoblado: String(pick(row, ['amoblado'], 'false')).toLowerCase() === 'true',
      disponibilidad: inferDisponibilidad(row),
      propietario_nombre: propietarioNombre,
      propietario_celular: propietarioCelular,
      updated_at: updatedAt,
      notas,
      tags,
      descripcion,
      imagen_url: imagenUrl,
      version: parseIntLoose(pick(row, ['version'], '1')) || 1,
    };
  });
}

export function mapRowsToLeads(rows: AnyRow[]): Lead[] {
  return (rows || []).map((row, idx) => {
    const id = pick(row, ['id', 'lead_id', 'codigo'], `lead_${idx + 2}`);
    const nombre = pick(row, ['nombre', 'name', 'cliente', 'prospecto', 'full_name']);
    const telefono = pick(row, ['telefono', 'celular', 'whatsapp', 'contacto', 'phone']);
    const interes = pick(row, ['interes', 'interesado_en', 'producto', 'propiedad', 'requerimiento']);
    const operacion = pick(row, ['operacion', 'tipo_operacion', 'venta_o_alquiler'], '');
    const origen = pick(row, ['origen', 'fuente', 'canal', 'source'], '');
    const score = parseIntLoose(pick(row, ['score', 'puntuacion', 'calificacion'], 0));
    const estado = pick(row, ['estado', 'status', 'etapa'], 'Nuevo');
    const nota = pick(row, ['nota', 'notas', 'comentario', 'observaciones'], '');
    const createdAt = pick(row, ['created_at', 'fecha', 'fecha_registro', 'registrado_el'], new Date().toISOString());
    return {
      id,
      nombre,
      telefono,
      interes,
      operacion,
      origen,
      score,
      estado,
      nota,
      created_at: createdAt,
    };
  });
}

export function mapRowsToAppointments(rows: AnyRow[]): Appointment[] {
  return (rows || []).map((row, idx) => {
    const id = pick(row, ['id', 'appointment_id', 'cita_id', 'codigo'], `appt_${idx + 2}`);
    const fecha = pick(row, ['fecha', 'date', 'dia', 'fecha_cita', 'fecha_de_cita']);
    const hora = pick(row, ['hora', 'time', 'hora_cita']);
    const cliente = pick(row, ['cliente', 'nombre', 'nombre_cliente', 'full_name']);
    const contacto = pick(row, ['contacto', 'telefono', 'celular', 'whatsapp', 'phone']);
    const propiedad = pick(row, ['propiedad', 'inmueble', 'direccion', 'direccion_del_inmueble', 'propiedad_titulo']);
    const canal = pick(row, ['canal', 'origen', 'fuente', 'source'], '');
    const estado = pick(row, ['estado', 'status'], 'Pendiente');
    const notas = pick(row, ['notas', 'nota', 'comentarios', 'observaciones'], '');
    return {
      id,
      fecha,
      hora,
      cliente,
      contacto,
      propiedad,
      canal,
      estado,
      notas,
    };
  });
}
