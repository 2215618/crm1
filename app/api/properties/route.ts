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
    
    const newProperty = {
      id: `PROP-${Date.now()}`,
      operacion: body.operacion,
      tipo: body.tipo,
      propietario_nombre: body.propietario_nombre,
      propietario_celular: body.propietario_celular,
      distrito: body.distrito,
      direccion: body.direccion,
      area_m2: body.area_m2,
      precio_soles: body.precio_soles,
      precio_usd_ref: body.precio_usd_ref,
      disponibilidad: 'Disponible',
      amoblado: body.amoblado ? 'TRUE' : 'FALSE',
      tags: body.tags, 
      descripcion: body.descripcion,
      image_url: body.image_url || 'https://picsum.photos/400/300',
      version: 1,
      updated_at: new Date().toISOString()
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