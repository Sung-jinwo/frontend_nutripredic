import { api } from "./api";

export interface PlanDiarioResponse {
  id: number | null;
  clienteId: number;
  fecha: string;
  estado: string;
  objetivos?: string[];
  descripcion?: string;
  // backend may return different shape; keep permissive
  [key: string]: unknown;
}

export interface CumplimientoDiarioResponse {
  id: number | null;
  clienteId: number;
  fecha: string;
  estado: string;
  planId?: number | null;
  [key: string]: unknown;
}

export const planDiarioService = {
  inicializar: (clienteId: number, fecha: string) =>
    api.post<PlanDiarioResponse>(`/api/clientes/${clienteId}/plan-diario/inicial?fecha=${fecha}`, {}),
  siguiente: (clienteId: number, fechaCorte: string) =>
    api.get<PlanDiarioResponse>(`/api/clientes/${clienteId}/plan-diario/siguiente?fechaCorte=${fechaCorte}`),
  historial: (clienteId: number, desde: string, hasta: string) =>
    api.get<PlanDiarioResponse[]>(`/api/clientes/${clienteId}/planes-diarios?desde=${desde}&hasta=${hasta}`),
  cumplimiento: (clienteId: number, fecha: string) =>
    api.get<CumplimientoDiarioResponse>(`/api/clientes/${clienteId}/cumplimiento-diario?fecha=${fecha}`),
  historialCumplimientos: (clienteId: number, desde: string, hasta: string) =>
    api.get<CumplimientoDiarioResponse[]>(`/api/clientes/${clienteId}/cumplimientos-diarios?desde=${desde}&hasta=${hasta}`),
};
