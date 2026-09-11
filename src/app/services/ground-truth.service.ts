import { api } from "./api";

export interface EvidenciaV6Response {
  clienteId: number;
  fechaCorte: string;
  criterios: Array<{
    codigo: string;
    tipoEvaluacion: string;
    estado: string;
    puntosMaximos: number;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

export interface CrearEvaluacionV6Request {
  criteriosManuales: Array<{ codigoCriterio: string; puntosObtenidos: number; observacion: string }>;
  observacion: string;
}

export const groundTruthService = {
  evidencia: (clienteId: number, fechaCorte: string) =>
    api.get<EvidenciaV6Response>(`/api/admin/evaluaciones-perfil/candidata-v6/clientes/${clienteId}/evidencia?fechaCorte=${fechaCorte}`),
  crear: (clienteId: number, fechaCorte: string, body: CrearEvaluacionV6Request) =>
    api.post(`/api/admin/evaluaciones-perfil/candidata-v6/clientes/${clienteId}?fechaCorte=${fechaCorte}`, body),
  detalle: (id: number) => api.get(`/api/admin/evaluaciones-perfil/${id}/detalle`),
};
