import { api } from "./api";

export interface EvaluacionConsumoResponse {
  id: number;
  clienteId: number;
  rubricaId: number | null;
  fechaInicio: string;
  fechaCorte: string;
  ventanaDias: number;
  momento: string;
  estadoClasificacion: "ALTO" | "NO_ALTO" | "NO_DETERMINADA";
  motivo: string | null;
  estadoValidez: string;
  altoConsumo: boolean | null;
  fechaEvaluacion: string;
  advertencias: string | null;
}

export interface DetalleEvaluacionConsumoResponse {
  criterioEvaluadoId: number | null;
  componente: string | null;
  fuente: "SUPLEMENTACION" | "ALIMENTACION" | "TOTAL_DIETA" | null;
  cantidadObservada: number | null;
  referenciaAplicada: number | null;
  referenciaAplicadaHasta: number | null;
  unidad: string | null;
  operador: string | null;
  resultado: "CUMPLE" | "NO_CUMPLE" | "NO_CALCULABLE";
  motivoNoCalculable: string | null;
}

export const consumoEvaluacionService = {
  evaluarDiario: (clienteId: number, fechaCorte: string) =>
    api.post<EvaluacionConsumoResponse>("/api/evaluaciones-consumo", {
      clienteId,
      fechaCorte,
      ventanaDias: 1,
      momento: "NO_DETERMINADO",
    }),
  detalles: (evaluacionId: number) =>
    api.get<DetalleEvaluacionConsumoResponse[]>(
      `/api/evaluaciones-consumo/${evaluacionId}/detalles`,
    ),
};
