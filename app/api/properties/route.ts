import { NextResponse } from 'next/server';
import { getSheetData, appendSheetRow } from '@/lib/sheets/client';
import { mapRowsToProperties } from '@/lib/sheets/map';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Tab Name: 'Properties'
    const rawData = await getSheetData('Properties');
    const properties = mapRowsToProperties(rawData);
    return NextResponse.json(properties);
  } catch (error) {
    console.error("API Properties GET Error:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Build a payload that can be appended whether your sheet headers are:
    // - Internal keys (id, tipo, direccion, distrito, precio_soles, ...)
    // - Human/Spanish headers ("Tipo de inmueble", "Dirección del inmueble", "Zona / Distrito", ...)
    // The sheets client normalizes headers, so we provide both sets of keys.
    const nowIso = new Date().toISOString();
    const id = body.id || `PROP-${Date.now()}`;
    const operacion = body.operacion || 'Alquiler';
    const tipo = body.tipo || '';
    const direccion = body.direccion || '';
    const distrito = body.distrito || '';
    const area_m2 = Number(body.area_m2) || 0;
    const precio_soles = Number(body.precio_soles) || 0;
    const descripcion = body.descripcion || '';
    const propietario_nombre = body.propietario_nombre || '';
    const propietario_celular = body.propietario_celular || '';
    
    const newProperty = {
      // Internal keys
      id,
      operacion,
      tipo,
      propietario_nombre,
      propietario_celular,
      distrito,
      direccion,
      area_m2,
      precio_soles,
      precio_usd_ref: Number(body.precio_usd_ref) || 0,
      disponibilidad: body.disponibilidad || 'Disponible',
      amoblado: body.amoblado ? 'TRUE' : 'FALSE',
      tags: body.tags,
      descripcion,
      image_url: body.image_url || 'https://picsum.photos/400/300',
      version: 1,
      updated_at: nowIso,

      // Spanish / human headers (normalized by the sheets client)
      nombre_del_propietario: propietario_nombre,
      tipo_de_inmueble: tipo,
      direccion_del_inmueble: direccion,
      zona_distrito: distrito,
      area_m2: area_m2,
      caracteristicas_descr: descripcion,
      precio_alquiler_s: precio_soles,
    };

    // Tab Name: 'Properties'
    await appendSheetRow('Properties', newProperty);

    return NextResponse.json({ success: true, data: newProperty });
  } catch (error) {
    console.error("API Properties POST Error:", error);
    // Return 200 with error flag to prevent generic 500 client crash, 
    // although client mutation handles 500, this is safer for debugging
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
  }
}