import { api } from "./api";

export type OpcionAdaptativa = "A" | "B" | "C" | "D";
export type EstadoSesionAdaptativa = "GENERADA" | "PENDIENTE" | "RESPONDIDA" | "IA_NO_DISPONIBLE" | "NO_DISPONIBLE";

export interface GenerarConocimientoIaRequest {
  temasPermitidos: string[];
  dificultadPermitida: string;
  cantidadPreguntas: number;
}

export interface InstrumentoPublicoResponse {
  id: number;
  codigo: string;
  version: number;
  nombre: string;
  preguntas: Array<{
    id: number;
    orden: number;
    puntuacion: number;
    enunciado: string;
    tema: string;
    subtema: string;
    dificultad: string;
    opcionA: string;
    opcionB: string;
    opcionC: string;
    opcionD: string;
  }>;
}

export interface PreguntaAdaptativa {
  id: number;
  orden: number;
  origen: "ADAPTATIVA_IA";
  tema: string;
  subtema: string;
  dificultad: string;
  enunciado: string;
  opciones: Array<{ codigo: OpcionAdaptativa; texto: string }>;
}

export interface ResultadoRespuestaAdaptativa {
  preguntaId: number;
  opcionSeleccionada: OpcionAdaptativa;
  correcta: boolean;
  respuestaCorrecta: OpcionAdaptativa;
  explicacion: string;
}

export interface ResultadoAdaptativoResponse {
  sesionId: number;
  totalPreguntas: number;
  totalRespondidas: number;
  correctas: number;
  porcentajeAdaptativo: number;
  puntajeObtenido: number;
  puntajeMaximo: number;
  nivel: "BAJO" | "INTERMEDIO" | "ALTO";
  estado: "RESPONDIDA";
  respondidaEn: string;
  respuestas: ResultadoRespuestaAdaptativa[];
}

export interface SesionConocimientoResponse {
  sesionId: number;
  estadoAdaptativo: EstadoSesionAdaptativa;
  fechaEvaluacion: string;
  objetivoCliente: string;
  clasificacionPredictiva: string | null;
  metaNutricional: {
    planDiarioId: number | null;
    fechaObjetivo: string | null;
    kcal: number | null;
    proteinaG: number | null;
    carbohidratosG: number | null;
    grasasG: number | null;
    aguaMl: number | null;
  } | null;
  motivoNoDisponible?: string | null;
  instrumento: InstrumentoPublicoResponse;
  preguntasAdaptativas: PreguntaAdaptativa[];
  resultadoAdaptativo: ResultadoAdaptativoResponse | null;
}

export interface ResponderConocimientoIaRequest {
  respuestas: Array<{
    preguntaId: number;
    opcionSeleccionada: OpcionAdaptativa;
  }>;
}

export const conocimientoIaService = {
  inicial: (clienteId: number) => api.post<SesionConocimientoResponse>(`/api/clientes/${clienteId}/conocimiento/inicial/asegurar`, {}, { notifySuccess: false }),
  generar: (clienteId: number, request: GenerarConocimientoIaRequest) =>
    api.post<SesionConocimientoResponse>(
      `/api/clientes/${clienteId}/conocimiento/post-modelo/generar`,
      request,
    ),
  obtener: (clienteId: number, fecha?: string) =>
    api.get<SesionConocimientoResponse>(`/api/clientes/${clienteId}/conocimiento/post-modelo${fecha ? `?fecha=${encodeURIComponent(fecha)}` : ""}`, { silentStatuses: [404] }),
  responder: (clienteId: number, sesionId: number, request: ResponderConocimientoIaRequest) =>
    api.post<ResultadoAdaptativoResponse>(
      `/api/clientes/${clienteId}/conocimiento/post-modelo/${sesionId}/respuestas`,
      request,
    ),
};
