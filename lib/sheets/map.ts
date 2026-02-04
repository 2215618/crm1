import type {
  Appointment,
  AppointmentStatus,
  Lead,
  LeadSource,
  LeadStage,
  Property,
  PropertyOperation,
  PropertyStatus,
  PropertyType,
} from "@/types";

type Row = any[];

const s = (v: any) => (v ?? "").toString().trim();

const slugify = (input: string) =>
  input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const parseNumber = (v: any): number | undefined => {
  const str = s(v)
    .replace(/,/g, ".")
    .replace(/\s+/g, " ")
    .replace(/[^0-9.\-]/g, "");
  if (!str) return undefined;
  const n = Number(str);
  return Number.isFinite(n) ? n : undefined;
};

const parseMoney = (v: any): number | undefined => {
  const raw = s(v).toLowerCase();
  if (!raw) return undefined;

  let mult = 1;
  if (raw.includes("mil")) mult = 1000;
  if (raw.includes("mill")) mult = 1_000_000;

  const cleaned = raw
    .replace(/s\//g, "")
    .replace(/usd/g, "")
    .replace(/\$/g, "")
    .replace(/,/g, "")
    .replace(/[^0-9.\-]/g, "");

  if (!cleaned) return undefined;
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return undefined;
  return n * mult;
};

const mapOperation = (raw: string): PropertyOperation => {
  const v = raw.toLowerCase();
  if (v.includes("alquiler") || v.includes("rent")) return "Alquiler";
  if (v.includes("venta") || v.includes("sell")) return "Venta";
  return "Alquiler";
};

const mapType = (raw: string): PropertyType => {
  const v = raw.toLowerCase();
  if (v.includes("depa")) return "Departamento";
  if (v.includes("mono")) return "Departamento";
  if (v.includes("casa")) return "Casa";
  if (v.includes("ofic")) return "Oficina";
  if (v.includes("terreno") || v.includes("lote")) return "Terreno";
  if (v.includes("local")) return "Local";
  return "Casa";
};

const mapStatus = (raw: string): PropertyStatus => {
  const v = raw.toLowerCase();
  if (v.includes("reserv")) return "Reservado";
  if (v.includes("no disp") || v.includes("vendid") || v.includes("ocup"))
    return "No disponible";
  // En tu base real aparece "Sin amoblar / Amoblado" en estado: eso NO es disponibilidad
  return "Disponible";
};

const mapLeadStage = (raw: string): LeadStage => {
  const v = raw.toLowerCase();
  if (v.includes("contact")) return "Contactado";
  if (v.includes("calient")) return "Caliente";
  if (v.includes("cerr")) return "Cerrado";
  return "Nuevo";
};

const mapLeadSource = (raw: string): LeadSource => {
  const v = raw.toLowerCase();
  if (v.includes("whats")) return "WhatsApp";
  if (v.includes("web")) return "Web";
  if (v.includes("ref")) return "Referencia";
  return "Facebook";
};

const mapAppointmentStatus = (raw: string): AppointmentStatus => {
  const v = raw.toLowerCase();
  if (v.includes("confirm")) return "Confirmada";
  if (v.includes("cancel")) return "Cancelada";
  if (v.includes("reprog")) return "Reprogramada";
  return "Pendiente";
};

/**
 * PROPERTIES (tu formato real)
 * A propietario | B tipo | C dirección | D zona | E frente | F fondo | G área | H características |
 * I precio S/ | J garantía | K estado | L partida | M operación | N moneda | O precio USD ref |
 * P ID interno | Q created_at | R updated_at
 */
export function mapRowsToProperties(rows: Row[]): Property[] {
  return rows
    .filter((r) => Array.isArray(r) && r.some((c) => s(c) !== ""))
    .map((row, idx): Property => {
      const tipoRaw = s(row[1]);
      const direccion = s(row[2]);
      const zona = s(row[3]);

      const area = parseNumber(row[6]);
      const descripcion = s(row[7]);

      const precioSoles = parseMoney(row[8]);
      const monedaRaw = s(row[13]);
      const precioUsdRef = parseMoney(row[14]);

      const operacion = mapOperation(s(row[12]));
      const status = mapStatus(s(row[10]));

      const idInterno = s(row[15]);
      const id = idInterno || slugify(`${direccion}-${idx + 2}`) || `prop-${idx + 2}`;

      const currency: "PEN" | "USD" =
        monedaRaw.toUpperCase().includes("USD") || monedaRaw === "$" ? "USD" : "PEN";

      const price =
        currency === "USD"
          ? precioUsdRef ?? precioSoles ?? 0
          : precioSoles ?? precioUsdRef ?? 0;

      const title = `${tipoRaw || "Inmueble"} ${
        operacion === "Alquiler" ? "en Alquiler" : "en Venta"
      }${zona ? ` - ${zona}` : ""}`;

      const tags = [operacion, status, zona].filter(Boolean).slice(0, 6) as string[];

      return {
        id,
        title,
        type: mapType(tipoRaw),
        operation: operacion,
        price,
        currency,
        status,
        location: zona || "Iquitos",
        address: direccion,
        area,
        bedrooms: undefined,
        bathrooms: undefined,
        agent: "LG Inmobiliaria",
        tags,
        description: descripcion || undefined,
        images: [],
      };
    });
}

/**
 * LEADS (flexible)
 * GoldLeads!A2:H
 */
export function mapRowsToLeads(rows: Row[]): Lead[] {
  return rows
    .filter((r) => Array.isArray(r) && r.some((c) => s(c) !== ""))
    .map((row, idx): Lead => {
      const id = s(row[0]) || `lead-${idx + 2}`;
      return {
        id,
        name: s(row[1]) || "Sin nombre",
        phone: s(row[2]) || "",
        email: s(row[3]) || undefined,
        source: mapLeadSource(s(row[4])),
        stage: mapLeadStage(s(row[5])),
        propertyId: s(row[6]) || undefined,
        notes: s(row[7]) || undefined,
        createdAt: new Date().toISOString(),
      };
    });
}

/**
 * APPOINTMENTS (flexible)
 * Appointments!A2:I
 */
export function mapRowsToAppointments(rows: Row[]): Appointment[] {
  return rows
    .filter((r) => Array.isArray(r) && r.some((c) => s(c) !== ""))
    .map((row, idx): Appointment => {
      const id = s(row[0]) || `apt-${idx + 2}`;
      return {
        id,
        clientName: s(row[1]) || "Cliente",
        phone: s(row[2]) || "",
        propertyId: s(row[3]) || undefined,
        date: s(row[4]) || "",
        time: s(row[5]) || "",
        status: mapAppointmentStatus(s(row[6])),
        notes: s(row[7]) || undefined,
        whatsappSent: s(row[8]).toLowerCase() === "true",
      };
    });
}
