import { api } from "./api";

export interface UnidadMedidaResponse {
  id: number;
  codigo: string;
  nombre: string;
}

export const unidadesService = {
  list: () => api.get<UnidadMedidaResponse[]>("/api/unidades"),
};
