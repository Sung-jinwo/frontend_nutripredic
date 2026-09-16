import { api } from "./api";

export type EstadoDisponibilidad = "DISPONIBLE" | "NO_DISPONIBLE";

export interface PccIndicatorResponse {
  porcentajePcc: number | null;
  totalEvaluadosValidos: number;
  totalBajoConocimiento: number;
  estadoDisponibilidad: EstadoDisponibilidad;
  motivoNoDisponible: string | null;
}

export interface PcsIndicatorResponse {
  porcentajePcs: number | null;
  totalEvaluadosValidos: number;
  totalAltoConsumo: number;
  estadoDisponibilidad: EstadoDisponibilidad;
  motivoNoDisponible: string | null;
}

export interface TppIndicatorResponse {
  promedioTppMs: number | null;
  totalAnalisisValidos: number;
  totalAnalisisExcluidos: number;
  estadoDisponibilidad: EstadoDisponibilidad;
  motivoNoDisponible: string | null;
  exclusiones: Record<string, number>;
}

export interface DashboardResponse {
  totalClientes: number;
  totalPrediccionesV5: number;
  pcc: PccIndicatorResponse;
  pcs: PcsIndicatorResponse;
  tpp: TppIndicatorResponse;
  porcentajeNivelConsumoOperativo: number | null;
  modeloActivo: { id: number; nombre: string; version: string } | null;
}

export const indicadoresService = {
  demoStatus: () => api.get<{ enabled: boolean; demoUsers: number; state: string; completedCycles: number; message: string }>("/api/admin/demo-data/status", { silentStatuses: [404] }),
  pcc: () => api.get<PccIndicatorResponse>("/api/admin/indicadores/pcc"),
  pcs: () => api.get<PcsIndicatorResponse>("/api/admin/indicadores/pcs"),
  tpp: () => api.get<TppIndicatorResponse>("/api/admin/indicadores/tpp"),
  dashboard: () => api.get<DashboardResponse>("/api/admin/dashboard"),
};
