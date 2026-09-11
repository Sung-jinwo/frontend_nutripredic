import { api } from "./api";

export interface SuplementoCatalogo {
  id: number;
  nombre: string;
  tipo: string | null;
  descripcion: string | null;
  beneficios: string | null;
  recomendaciones: string | null;
  marca: string | null;
  presentacion: string | null;
  unidadPresentacion: string | null;
  activo: boolean | null;
}

export interface SuplementoClienteResponse {
  id: number;
  clienteId: number;
  suplementoId: number;
  nombre: string;
  marca: string | null;
  tipo: string | null;
  presentacion: string | null;
  cantidad: number;
  unidad: string;
  frecuencia: string | null;
  tiempoUso: string | null;
  activo: boolean;
  fechaInicio: string;
  fechaFin: string | null;
  cantidadPorToma: number | null;
  unidadCodigo: string | null;
  tomasPorPeriodo: number | null;
  periodoFrecuencia: PeriodoFrecuencia | null;
  frecuenciaEstructuradaCompleta: boolean;
  componentesDeclarados: string | null;
  energiaKcalPorToma: number | null;
  proteinaGPorToma: number | null;
  carbohidratosGPorToma: number | null;
  grasasGPorToma: number | null;
  creatinaGPorToma: number | null;
  cafeinaMgPorToma: number | null;
  sodioMgPorToma: number | null;
}

export type PeriodoFrecuencia = "DIA" | "SEMANA" | "MES" | "OTRO";

export interface RegistroConsumoSuplementoRequest {
  suplementoClienteId: number;
  cantidadConsumida: number;
  unidadCodigo: string;
  numeroTomas: number | null;
  observacion: string | null;
}

export interface RegistroConsumoSuplementoResponse {
  id: number;
  registroHabitoId: number;
  fecha: string;
  suplementoClienteId: number;
  suplementoCatalogoId: number;
  nombre: string;
  marca: string | null;
  tipo: string | null;
  presentacion: string | null;
  cantidadConsumida: number;
  unidad: string;
  numeroTomas: number | null;
  observacion: string | null;
  creadoEn: string;
}

export interface ResumenSuplementacionDiario {
  fecha: string;
  proteinaSuplementariaG: number | null;
  creatinaG: number | null;
  cafeinaMg: number | null;
  carbohidratosSuplementariosG: number | null;
  grasasSuplementariasG: number | null;
  sodioMg: number | null;
  registrosConsumoTotal: number;
  registrosCalculables: number;
  registrosNoCalculables: number;
  porcentajeCobertura: number | null;
}

export interface ResumenSuplementacionResponse {
  fechaCorte: string;
  resumenDiario: ResumenSuplementacionDiario[];
}

export interface SuplementoAsignacionRequest {
  suplementoId: number | null;
  nombreSuplemento: string;
  cantidad: number;
  unidad: string;
  frecuencia: string | null;
  tiempoUso: string;
  activo: boolean;
  fechaInicio: string;
  fechaFin: string | null;
  cantidadPorToma: number | null;
  unidadCodigo: string | null;
  tomasPorPeriodo: number | null;
  periodoFrecuencia: PeriodoFrecuencia | null;
  componentesDeclarados: string | null;
  energiaKcalPorToma: number | null;
  proteinaGPorToma: number | null;
  carbohidratosGPorToma: number | null;
  grasasGPorToma: number | null;
  creatinaGPorToma: number | null;
  cafeinaMgPorToma: number | null;
  sodioMgPorToma: number | null;
}

export interface SuplementoActualizacionRequest extends Omit<SuplementoAsignacionRequest, "suplementoId"> {}

export const suplementosService = {
  catalog: () => api.get<SuplementoCatalogo[]>("/api/suplementos"),
  listByCliente: (clienteId: number) =>
    api.get<SuplementoClienteResponse[]>(`/api/clientes/${clienteId}/suplementos`),
  create: (clienteId: number, data: SuplementoAsignacionRequest) =>
    api.post<SuplementoClienteResponse>(`/api/clientes/${clienteId}/suplementos`, data),
  update: (clienteId: number, suplementoId: number, data: SuplementoActualizacionRequest) =>
    api.put<SuplementoClienteResponse>(`/api/clientes/${clienteId}/suplementos/${suplementoId}`, data),
  delete: (clienteId: number, suplementoId: number) =>
    api.delete(`/api/clientes/${clienteId}/suplementos/${suplementoId}`),
  habituals: (clienteId: number, fecha: string) =>
    api.get<SuplementoClienteResponse[]>(`/api/clientes/${clienteId}/suplementos/habituales?fecha=${encodeURIComponent(fecha)}`),
  dailyConsumptions: (habitoId: number) =>
    api.get<RegistroConsumoSuplementoResponse[]>(`/api/habitos/${habitoId}/consumos-suplementos`),
  createDailyConsumption: (habitoId: number, data: RegistroConsumoSuplementoRequest) =>
    api.post<RegistroConsumoSuplementoResponse>(`/api/habitos/${habitoId}/consumos-suplementos`, data),
  updateDailyConsumption: (habitoId: number, id: number, data: RegistroConsumoSuplementoRequest) =>
    api.put<RegistroConsumoSuplementoResponse>(`/api/habitos/${habitoId}/consumos-suplementos/${id}`, data),
  deleteDailyConsumption: (habitoId: number, id: number) =>
    api.delete(`/api/habitos/${habitoId}/consumos-suplementos/${id}`),
  dailySummary: (clienteId: number, fechaCorte: string) =>
    api.get<ResumenSuplementacionResponse>(`/api/clientes/${clienteId}/suplementacion/resumen?fechaCorte=${fechaCorte}`),
};
