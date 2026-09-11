import { api } from "./api";
import type { ClasificacionPredictiva } from "./analisis-predictivo.service";

export type EstadoComparacion = "BAJO" | "EN_RANGO" | "ALTO" | "NO_CALCULABLE";

export interface EvaluacionOrientacion {
  prediccionId: number;
  fechaEvaluada: string;
  clasificacion: ClasificacionPredictiva;
  probAdecuado: number;
  probMejorable: number;
  probCritico: number;
  modelVersion: string;
}

export interface ComparacionOrientacion {
  codigo: "KCAL" | "PROTEINA" | "CARBOHIDRATOS" | "GRASAS" | "AGUA";
  nombre: string;
  unidad: string;
  meta: number;
  consumido: number;
  porcentaje: number;
  estado: EstadoComparacion;
}

export interface PrioridadOrientacion {
  codigo: string;
  titulo: string;
  descripcion: string;
  desviacionPorcentual: number;
}

export interface RecomendacionOrientacion {
  codigo: string;
  titulo: string;
  descripcion: string;
  basadaEn: string;
}

export interface OrientacionResponse {
  personalizadaDisponible: boolean;
  mensaje: string | null;
  evaluacion: EvaluacionOrientacion | null;
  comparaciones: ComparacionOrientacion[];
  prioridades: PrioridadOrientacion[];
  recomendaciones: RecomendacionOrientacion[];
}

export const orientacionService = {
  obtener: (clienteId: number) => {
    // fechaCorte mantiene compatibilidad con una instancia anterior del backend.
    // El controlador nuevo obtiene la última evaluación guardada e ignora este parámetro adicional.
    const fechaCorte = new Date().toLocaleDateString("sv-SE");
    return api.get<OrientacionResponse>(
      `/api/clientes/${clienteId}/orientacion?fechaCorte=${encodeURIComponent(fechaCorte)}`,
    );
  },
};
