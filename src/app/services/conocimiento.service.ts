import { api } from "./api";

export type OpcionPregunta = "A" | "B" | "C" | "D";

export interface PreguntaConocimiento {
  id: number;
  enunciado: string;
  opcionA: string;
  opcionB: string;
  opcionC: string;
  opcionD: string;
  categoria: string;
  dificultad: string;
}
export interface InstrumentoConocimientoPublico { id: number; codigo: string; version: number; nombre: string; preguntas: Array<PreguntaConocimiento & { orden: number; puntuacion: number; subtema: string }>; }

export interface Respuesta {
  preguntaId: number;
  opcion: OpcionPregunta;
}

export interface ResponderTestRequest {
  clienteId: number;
  respuestas: Respuesta[];
}

export interface ResultadoTestResponse {
  id: number;
  clienteId: number;
  total: number;
  correctas: number;
  porcentaje: number;
  nivel: string;
  fecha: string;
  resultadosPorTema: ResultadoTemaResponse[];
  respuestas: RespuestaHistoricaResponse[];
}

export interface ResultadoTemaResponse {
  tema: string;
  correctas: number;
  total: number;
  porcentaje: number;
}

export interface RespuestaHistoricaResponse {
  preguntaVersionId: number;
  grupoVersion: string;
  version: number;
  texto: string;
  tema: string;
  respuesta: string;
  respuestaCorrecta: string;
  correcta: boolean;
}

export const conocimientoService = {
  instrument: () => api.get<InstrumentoConocimientoPublico>("/api/tests/instrumento-activo"),
  questions: () => api.get<PreguntaConocimiento[]>("/api/preguntas"),
  submit: (data: ResponderTestRequest) =>
    api.post<ResultadoTestResponse>("/api/tests/respuestas", data),
  history: (clienteId: number) =>
    api.get<ResultadoTestResponse[]>(`/api/clientes/${clienteId}/tests`),
};
