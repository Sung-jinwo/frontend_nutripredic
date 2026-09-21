import { api } from "./api";

export type MomentoComida = "DESAYUNO" | "MEDIA_MANANA" | "ALMUERZO" | "MERIENDA" | "CENA" | "OTRO";

export interface AlimentoUsda {
  fdcId: number;
  nombre: string;
  proteinaG: number;
  carbohidratosG: number;
  grasasG: number;
  fuente: string;
}
interface ConsumoUsda { fdcId: number; gramos: number; momentoComida: MomentoComida }

export interface AlimentoCatalogoResponse {
  id: number;
  nombre: string;
  categoria: string;
  unidadBase: string | null;
  activo: boolean;
  cantidadReferencia: number | null;
  unidadReferencia: string | null;
  kcal: number | null;
  proteinaG: number | null;
  carbohidratosG: number | null;
  grasasG: number | null;
  fibraG: number | null;
  azucarG: number | null;
  sodioMg: number | null;
  porcionReferencia?: string | null;
}

export interface RegistroAlimentoRequest {
  alimentoId: number | null;
  nombreAlimento: string;
  cantidad: number;
  unidadCodigo: string;
  momentoComida: MomentoComida;
  proteinaG: number;
  carbohidratosG: number;
  grasasG: number;
}

export interface RegistroAlimentoResponse {
  id: number;
  registroHabitoId: number;
  alimentoId: number | null;
  nombre: string;
  categoria: string;
  cantidad: number;
  unidad: string;
  momentoComida: MomentoComida;
  kcal: number;
  proteinaG: number;
  carbohidratosG: number;
  grasasG: number;
}

export interface AlimentoUsoResponse {
  alimentoId: number | null;
  nombre: string;
  categoria: string;
  ultimaCantidad: number;
  ultimaUnidad: string;
  ultimoMomento: MomentoComida;
  ultimaFecha: string;
  vecesUtilizado: number;
  ultimaProteinaG?: number | null;
  ultimosCarbohidratosG?: number | null;
  ultimasGrasasG?: number | null;
}

export const alimentacionService = {
  searchUsda: (query: string) => api.get<AlimentoUsda[]>(`/api/alimentos/usda/buscar?query=${encodeURIComponent(query)}`, { silentStatuses: [404, 429, 500, 503] }),
  addUsda: (habitId: number, data: ConsumoUsda) => api.post<RegistroAlimentoResponse>(`/api/habitos/${habitId}/alimentos/usda`, data),
  updateUsda: (habitId: number, id: number, data: ConsumoUsda) => api.put<RegistroAlimentoResponse>(`/api/habitos/${habitId}/alimentos/${id}/usda`, data),
  catalog: () => api.get<AlimentoCatalogoResponse[]>("/api/alimentos"),
  detail: (alimentoId: number) => api.get<AlimentoCatalogoResponse>(`/api/alimentos/${alimentoId}`),
  listByHabit: (habitId: number) => api.get<RegistroAlimentoResponse[]>(`/api/habitos/${habitId}/alimentos`),
  addToHabit: (habitId: number, data: RegistroAlimentoRequest) => api.post<RegistroAlimentoResponse>(`/api/habitos/${habitId}/alimentos`, data),
  updateInHabit: (habitId: number, id: number, data: RegistroAlimentoRequest) => api.put<RegistroAlimentoResponse>(`/api/habitos/${habitId}/alimentos/${id}`, data),
  removeFromHabit: (habitId: number, id: number) => api.delete(`/api/habitos/${habitId}/alimentos/${id}`),
  recent: (clientId: number) => api.get<AlimentoUsoResponse[]>(`/api/clientes/${clientId}/alimentos/recientes`),
  frequent: (clientId: number) => api.get<AlimentoUsoResponse[]>(`/api/clientes/${clientId}/alimentos/frecuentes`),
};
