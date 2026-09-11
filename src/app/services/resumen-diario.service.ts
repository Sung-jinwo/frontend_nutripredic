import { api, ApiError } from "./api";

/**
 * SSOT para Mi alimentación — GET /api/clientes/{id}/resumen-diario?fecha=YYYY-MM-DD
 * Conceptualmente backend devuelve:
 * {
 *   fecha: string,
 *   objetivo: { estado: "DISPONIBLE"|"NO_DISPONIBLE", kcal, proteina, carbohidratos, grasas, motivo, fuente, version },
 *   consumido: { kcal, proteina, carbohidratos, grasas, fibra, alimentosKcal, suplementosKcal, totalRegistros },
 *   agua: { consumidoMl, objetivoMl },
 *   registros?: [...],
 *   diferencia, porcentaje ...
 * }
 * Mientras el endpoint no exista se hace fallback a analisis-nutricional/diario (no cálculo local).
 */

export type EstadoObjetivo = "DISPONIBLE" | "PENDIENTE_MODELO" | "NO_DISPONIBLE" | "NO_CALCULABLE";

export interface ResumenDiarioObjetivo {
  estado: EstadoObjetivo;
  kcal: number | null;
  proteina: number | null;
  carbohidratos: number | null;
  grasas: number | null;
  fibra?: number | null;
  motivo?: string | null;
  fuente?: string | null;
}

export interface ResumenDiarioConsumido {
  kcal: number | null;
  proteina: number | null;
  carbohidratos: number | null;
  grasas: number | null;
  fibra?: number | null;
  alimentosKcal?: number | null;
  suplementosKcal?: number | null;
}

export interface ResumenDiarioResponse {
  fecha: string;
  objetivo: ResumenDiarioObjetivo;
  consumido: ResumenDiarioConsumido;
  agua: { consumidoMl: number | null; objetivoMl?: number | null };
  estado?: string;
  motivo?: string | null;
  diferenciaKcal?: number | null;
  porcentajeKcal?: number | null;
  raw?: any;
}

function normalize(raw: any, fecha: string): ResumenDiarioResponse | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw.resumen ?? raw.data ?? raw;

  // Soporte para forma nueva y para forma antigua analisis-nutricional
  if (r.componentes && Array.isArray(r.componentes)) {
    // es respuesta de /analisis-nutricional/diario -> adaptar
    const find = (c: string) => r.componentes.find((x: any) => x.componente === c);
    const energia = find("ENERGIA");
    const prot = find("PROTEINA");
    const carb = find("CARBOHIDRATOS");
    const gras = find("GRASAS");
    const aguaComp = r.componentes.find((x: any) => x.componente === "AGUA");
    return {
      fecha: r.fecha ?? fecha,
      objetivo: {
        estado: r.estado ?? "DISPONIBLE",
        kcal: energia?.objetivo ?? null,
        proteina: prot?.objetivo ?? null,
        carbohidratos: carb?.objetivo ?? null,
        grasas: gras?.objetivo ?? null,
        motivo: r.motivo ?? energia?.motivo ?? null,
      },
      consumido: {
        kcal: energia?.consumido ?? null,
        proteina: prot?.consumido ?? null,
        carbohidratos: carb?.consumido ?? null,
        grasas: gras?.consumido ?? null,
        fibra: null,
      },
      agua: { consumidoMl: aguaComp?.consumido ?? null, objetivoMl: aguaComp?.objetivo ?? null },
      estado: r.estado,
      motivo: r.motivo,
      porcentajeKcal: energia?.porcentajeCumplimiento ?? null,
      diferenciaKcal: energia?.diferencia ?? null,
      raw: r,
    };
  }

  const objetivoRaw = r.objetivo ?? {};
  const consumidoContenedor = r.consumido ?? {};
  const consumidoRaw = consumidoContenedor.total ?? consumidoContenedor;
  const aguaRaw = r.agua ?? {};

  // El estado general puede indicar que el consumo es visible aunque falte una meta.
  // Para pintar las barras manda exclusivamente el estado del objetivo.
  const estado: EstadoObjetivo = objetivoRaw.estado ?? (objetivoRaw.kcal != null ? "DISPONIBLE" : "NO_DISPONIBLE");

  return {
    fecha: r.fecha ?? fecha,
    objetivo: {
      estado,
      kcal: objetivoRaw.kcal ?? objetivoRaw.energiaKcal ?? objetivoRaw.calorias ?? null,
      proteina: objetivoRaw.proteinaG ?? objetivoRaw.proteina ?? objetivoRaw.proteinas ?? null,
      carbohidratos: objetivoRaw.carbohidratosG ?? objetivoRaw.carbohidratos ?? null,
      grasas: objetivoRaw.grasasG ?? objetivoRaw.grasas ?? null,
      fibra: objetivoRaw.fibra ?? null,
      motivo: objetivoRaw.motivo ?? r.motivo ?? null,
      fuente: objetivoRaw.fuenteReferencia ?? objetivoRaw.fuente ?? null,
    },
    consumido: {
      kcal: consumidoRaw.kcal ?? consumidoRaw.energiaKcal ?? consumidoRaw.calorias ?? null,
      proteina: consumidoRaw.proteinaG ?? consumidoRaw.proteina ?? consumidoRaw.proteinas ?? null,
      carbohidratos: consumidoRaw.carbohidratosG ?? consumidoRaw.carbohidratos ?? null,
      grasas: consumidoRaw.grasasG ?? consumidoRaw.grasas ?? null,
      fibra: consumidoRaw.fibraG ?? consumidoRaw.fibra ?? null,
      alimentosKcal: consumidoContenedor.alimentos?.kcal ?? null,
      suplementosKcal: consumidoContenedor.suplementos?.kcal ?? null,
    },
    agua: {
      consumidoMl: aguaRaw.consumidoMl ?? aguaRaw.consumido ?? aguaRaw.ml ?? null,
      objetivoMl: aguaRaw.objetivoMl ?? aguaRaw.objetivo ?? null,
    },
    estado,
    motivo: r.motivo ?? objetivoRaw.motivo ?? null,
    diferenciaKcal: r.diferenciaKcal ?? r.diferencia?.kcal ?? null,
    porcentajeKcal: r.porcentajeKcal ?? r.porcentajeCumplimiento?.kcal ?? r.porcentaje?.kcal ?? null,
    raw: r,
  };
}

export const resumenDiarioService = {
  get: async (clienteId: number, fecha: string): Promise<ResumenDiarioResponse | null> => {
    // SSOT principal: ResumenNutricionalDiarioService.java:16 GET /resumen-diario
    try {
      const raw = await api.get<any>(`/api/clientes/${clienteId}/resumen-diario?fecha=${encodeURIComponent(fecha)}`);
      return normalize(raw, fecha);
    } catch (e) {
      if (e instanceof ApiError && (e.status === 404 || e.status === 500)) {
        // Fallback a consumo-nutricional/diario (verificado 200 con valor null) y analisis-nutricional/diario
        try {
          const fallback = await api.get<any>(`/api/clientes/${clienteId}/consumo-nutricional/diario?fecha=${encodeURIComponent(fecha)}`);
          // consumo-nutricional devuelve {kcal:{valor}, proteinaG{valor}...} -> normalizar via componentes-like
          // Lo adaptamos a ResumenDiario usando el mismo normalize que maneja componentes
          const adapted = {
            fecha,
            // mapear consumo-nutricional a formato componentes para normalize
            componentes: [
              { componente: "ENERGIA", objetivo: null, consumido: fallback.kcal?.valor ?? null, estado: fallback.kcal?.valor != null ? "DISPONIBLE" : "NO_DISPONIBLE", unidad: "kcal" },
              { componente: "PROTEINA", objetivo: null, consumido: fallback.proteinaG?.valor ?? null, estado: "DISPONIBLE", unidad: "g" },
              { componente: "CARBOHIDRATOS", objetivo: null, consumido: fallback.carbohidratosG?.valor ?? null, estado: "DISPONIBLE", unidad: "g" },
              { componente: "GRASAS", objetivo: null, consumido: fallback.grasasG?.valor ?? null, estado: "DISPONIBLE", unidad: "g" },
            ],
            estado: "DISPONIBLE",
          };
          const norm = normalize(adapted, fecha);
          if (norm) return norm;
        } catch {}
        try {
          const fallback2 = await api.get<any>(`/api/clientes/${clienteId}/analisis-nutricional/diario?fecha=${encodeURIComponent(fecha)}`);
          return normalize(fallback2, fecha);
        } catch {
          return null;
        }
      }
      throw e;
    }
  },
};
