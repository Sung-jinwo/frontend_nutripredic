import { api } from "./api";

export interface CalidadDatasetV6Response {
  totalClientes?: number;
  totalFilas?: number;
  [key: string]: unknown;
}

export interface PreparacionDatasetV6Response {
  totalClientes?: number;
  aptos?: number;
  noAptos?: number;
  [key: string]: unknown;
}

export interface PendientesEntrenamientoV6Response {
  fechaCorte: string;
  pendientes: unknown[];
  [key: string]: unknown;
}

export const adminDatasetService = {
  calidad: () => api.get<CalidadDatasetV6Response>("/api/admin/ml/dataset/v6/calidad"),
  preparacion: () => api.get<PreparacionDatasetV6Response>("/api/admin/ml/dataset/v6/preparacion"),
  pendientes: (fechaCorte: string) =>
    api.get<PendientesEntrenamientoV6Response>(`/api/admin/ml/dataset/v6/pendientes?fechaCorte=${fechaCorte}`),
  calidadV6: () => api.get<CalidadDatasetV6Response>("/api/admin/ml/dataset/v6/calidad"),
};
