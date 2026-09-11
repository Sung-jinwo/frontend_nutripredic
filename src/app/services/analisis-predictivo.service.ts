import { api } from "./api";

export type MomentoEvaluacion = "BASAL" | "FINAL" | "NO_DETERMINADO";
export type ClasificacionPredictiva = "ADECUADO" | "MEJORABLE" | "CRITICO";
export type OrigenResultado = "GENERADO" | "REUTILIZADO";
export type EstadoPccIaPostAnalisis = "GENERADA" | "PENDIENTE" | "NO_DISPONIBLE" | "IA_NO_DISPONIBLE" | "RESPONDIDA";
export type EstadoPcsPostAnalisis = "ALTO" | "NO_ALTO" | "NO_DETERMINADA";

export interface AnalisisPredictivoRequest {
  clienteId: number;
  fechaCorte: string;
  participacionEstudioId: number | null;
  momento: MomentoEvaluacion;
}

export interface AnalisisPredictivoResponse {
  prediccionId: number;
  eventoAnalisisId: number;
  fechaCorte: string;
  momento: MomentoEvaluacion;
  clasificacion: ClasificacionPredictiva;
  probabilidades: Record<ClasificacionPredictiva, number>;
  modelVersion: string;
  schemaVersion: string;
  inferenceMs: number;
  inferredAt: string;
  modelType?: string;
  trainingDataType?: string;
  thesisFinalModel?: boolean;
  featureCount?: number;
  kcal: number;
  proteinaG: number;
  carbohidratosG: number;
  grasasG: number;
  aguaMl: number;
  formulaNutricionalVersion: string;
  fuenteFormulaNutricional: string;
  origenResultado: OrigenResultado;
  estado: "VALIDA";
  analisisIniciadoEn: string;
  resultadoDisponibleEn: string;
  estadoPccIa: EstadoPccIaPostAnalisis;
  estadoPcs: EstadoPcsPostAnalisis;
}

export interface DominioPreparacion {
  estado: "COMPLETO" | "INCOMPLETO";
  diasCompletos: number;
  diasRequeridos: number;
}

export interface PreparacionAnalisisResponse {
  clienteId: number;
  fechaCorte: string;
  puedeAnalizar: boolean;
  diasCompletos: number;
  diasRequeridos: number;
  dominios: Record<string, DominioPreparacion>;
  perfilHistoricoDisponible: boolean;
  xDisponibles: number;
  xTotal: number;
  datosFaltantes: string[];
}

export interface PrediccionModeloHistorialResponse {
  id?: number;
  prediccionId?: number;
  fechaCorte: string;
  momento?: string;
  clasificacion: ClasificacionPredictiva;
  probabilidades?: Record<ClasificacionPredictiva, number>;
  probAdecuado?: number;
  probMejorable?: number;
  probCritico?: number;
  modelVersion: string;
  schemaVersion?: string;
  fechaPrediccion?: string;
  inferredAt?: string;
  inferenceMs?: number;
  modelType?: string;
  trainingDataType?: string;
  thesisFinalModel?: boolean;
  featureCount?: number;
  kcal?: number;
  proteinaG?: number;
  carbohidratosG?: number;
  grasasG?: number;
  aguaMl?: number;
  formulaNutricionalVersion?: string;
  fuenteFormulaNutricional?: string;
  estado?: string;
  origenResultado?: OrigenResultado;
  estadoPccIa?: EstadoPccIaPostAnalisis;
  estadoPcs?: EstadoPcsPostAnalisis;
}

function normalizeHistorial(raw: PrediccionModeloHistorialResponse): PrediccionModeloHistorialResponse {
  const id = raw.prediccionId ?? raw.id ?? 0;
  let probs = raw.probabilidades;
  if (!probs && raw.probAdecuado !== undefined) {
    probs = {
      ADECUADO: raw.probAdecuado ?? 0,
      MEJORABLE: raw.probMejorable ?? 0,
      CRITICO: raw.probCritico ?? 0,
    };
  }
  return { ...raw, prediccionId: id, probabilidades: probs as Record<ClasificacionPredictiva, number> };
}

export const analisisPredictivoService = {
  ejecutar: (request: AnalisisPredictivoRequest) =>
    api.post<AnalisisPredictivoResponse>("/api/analisis-predictivo", request),
  preparacion: (clienteId: number, fechaCorte: string) =>
    api.get<PreparacionAnalisisResponse>(`/api/clientes/${clienteId}/analisis-predictivo/preparacion?fechaCorte=${fechaCorte}`),
  listByCliente: async (clienteId: number) => {
    const raw = await api.get<PrediccionModeloHistorialResponse[]>(`/api/clientes/${clienteId}/predicciones-modelo`);
    return raw.map(normalizeHistorial);
  },
};
