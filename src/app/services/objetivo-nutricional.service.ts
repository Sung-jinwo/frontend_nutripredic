import { api, ApiError } from "./api";

export type EstadoObjetivo = "DISPONIBLE" | "NO_DISPONIBLE" | "NO_CALCULABLE";

export interface ObjetivoNutricionalResponse {
  clienteId: number;
  objetivoFisico: string | null;
  objetivoEnergetico?: string | null;
  estrategia?: string | null;
  metaKcal: number | null;
  energiaKcal?: number | null;
  proteinas: number | null;
  proteina?: number | null;
  carbohidratos: number | null;
  grasas: number | null;
  estado: EstadoObjetivo;
  motivo?: string | null;
  calculadoEn?: string | null;
  unidadEnergia?: string;
  unidadMacro?: string;
}

// Normaliza variantes de nombres que el backend pueda usar
function normalize(raw: any): ObjetivoNutricionalResponse | null {
  if (!raw || typeof raw !== "object") return null;
  // si backend envuelve en { objetivo: {...} }
  const r = raw.objetivo ?? raw.data ?? raw;
  if (!r || typeof r !== "object") return null;

  const meta =
    r.metaKcal ??
    r.kcalObjetivo ??
    r.energiaKcal ??
    r.kcal ??
    r.energia ??
    r.metaEnergia ??
    r.caloriasObjetivo ??
    null;

  const prot =
    r.proteinas ??
    r.proteinaObjetivoG ??
    r.proteina ??
    r.proteinaG ??
    r.proteinasG ??
    null;

  const carb =
    r.carbohidratos ??
    r.carbohidratosObjetivoG ??
    r.carbohidratosG ??
    r.carbo ??
    null;

  const gras =
    r.grasas ??
    r.grasasObjetivoG ??
    r.grasa ??
    r.grasasG ??
    null;

  const estado: EstadoObjetivo =
    r.estado ??
    (meta != null && prot != null ? "DISPONIBLE" : "NO_DISPONIBLE");

  return {
    clienteId: r.clienteId ?? r.id ?? 0,
    objetivoFisico: r.objetivoFisico ?? r.objetivo ?? null,
    objetivoEnergetico: r.objetivoEnergetico ?? r.estrategia ?? null,
    estrategia: r.estrategia ?? r.objetivoEnergetico ?? null,
    metaKcal: meta != null ? Number(meta) : null,
    energiaKcal: meta != null ? Number(meta) : null,
    proteinas: prot != null ? Number(prot) : null,
    proteina: prot != null ? Number(prot) : null,
    carbohidratos: carb != null ? Number(carb) : null,
    grasas: gras != null ? Number(gras) : null,
    estado,
    motivo: r.motivo ?? r.mensaje ?? r.motivoNoDisponible ?? null,
    calculadoEn: r.calculadoEn ?? r.fechaCalculo ?? r.calculado ?? null,
    unidadEnergia: r.unidadEnergia ?? "kcal",
    unidadMacro: r.unidadMacro ?? "g",
  };
}

export const objetivoNutricionalService = {
  obtener: async (clienteId: number, fecha?: string): Promise<ObjetivoNutricionalResponse | null> => {
    const f = fecha ?? new Date().toLocaleDateString("sv-SE");
    try {
      const raw = await api.get<any>(`/api/clientes/${clienteId}/objetivo-nutricional?fecha=${encodeURIComponent(f)}`);
      return normalize(raw);
    } catch (e) {
      if (e instanceof ApiError && (e.status === 404 || e.status === 400)) return null;
      throw e;
    }
  },
};
