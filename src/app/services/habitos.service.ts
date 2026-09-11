import { api } from "./api";

export interface HabitoRequest {
  clienteId: number;
  fecha: string;
  cantidadComidas: number | null;
  consumoAgua: number | null;
  proteinas: number | null;
  tipoAlimentacion: string | null;
  nivelOrganizacion: string | null;
  desayuno: boolean | null;
  snacks: boolean | null;
  alimentos: string | null;
  comidasCocinadas: number | null;
  restricciones: string | null;
  consumeSuplementos: boolean | null;
}

export interface HabitoUpdateRequest extends Omit<HabitoRequest, "clienteId"> {}

export interface HabitoResponse extends HabitoRequest {
  id: number;
}

export const habitosService = {
  listByCliente: (clienteId: number) =>
    api.get<HabitoResponse[]>(`/api/habitos/cliente/${clienteId}`),
  create: (data: HabitoRequest) => api.post<HabitoResponse>("/api/habitos", data),
  update: (id: number, data: HabitoUpdateRequest) =>
    api.put<HabitoResponse>(`/api/habitos/${id}`, data),
  delete: (id: number) => api.delete(`/api/habitos/${id}`),
};
