import { api } from "./api";

export type EstadoAnalisisNutricional = "DISPONIBLE" | "NO_DISPONIBLE" | "NO_CALCULABLE";
export interface ComponenteNutricionalDiario { componente: "ENERGIA" | "PROTEINA" | "CARBOHIDRATOS" | "GRASAS"; objetivo: number | null; consumido: number | null; diferencia: number | null; porcentajeCumplimiento?: number | null; estado: EstadoAnalisisNutricional; motivo?: string | null; unidad: string; }
export interface AnalisisNutricionalDiarioResponse { fecha: string; estado: EstadoAnalisisNutricional; motivo?: string | null; componentes: ComponenteNutricionalDiario[]; }

function componente(
  nombre: ComponenteNutricionalDiario["componente"],
  valor: any,
  unidad: string,
): ComponenteNutricionalDiario {
  return {
    componente: nombre,
    objetivo: valor?.objetivo == null ? null : Number(valor.objetivo),
    consumido: valor?.consumido == null ? null : Number(valor.consumido),
    diferencia: valor?.diferencia == null ? null : Number(valor.diferencia),
    porcentajeCumplimiento: valor?.porcentajeCumplimiento == null ? null : Number(valor.porcentajeCumplimiento),
    estado: valor?.consumido == null ? "NO_CALCULABLE" : "DISPONIBLE",
    unidad,
  };
}

function normalize(raw: any): AnalisisNutricionalDiarioResponse {
  if (Array.isArray(raw?.componentes)) return raw;
  return {
    fecha: raw?.fecha ?? "",
    estado: raw?.estado ?? "NO_DISPONIBLE",
    motivo: raw?.requerimiento?.motivoNoDisponible ?? null,
    componentes: raw?.estado === "DISPONIBLE"
      ? [
          componente("ENERGIA", raw.kcal, "kcal"),
          componente("PROTEINA", raw.proteinaG, "g"),
          componente("CARBOHIDRATOS", raw.carbohidratosG, "g"),
          componente("GRASAS", raw.grasasG, "g"),
        ]
      : [],
  };
}

export const analisisNutricionalService = {
  diario: async (clienteId: number, fecha: string) => normalize(
    await api.get<any>(`/api/clientes/${clienteId}/analisis-nutricional/diario?fecha=${encodeURIComponent(fecha)}`),
  ),
};
