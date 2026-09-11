import { api } from "./api";

export interface HistorialDia {
  fecha: string;
  resumen: {
    estado: string;
    motivo?: string | null;
    consumido: {
      registrosAlimento: number;
      registrosSuplemento: number;
      total: { kcal: number | null; proteinaG: number | null; carbohidratosG: number | null; grasasG: number | null };
    };
  };
}

export interface HistorialIntegradoResponse {
  clienteId: number;
  desde: string;
  hasta: string;
  dias: HistorialDia[];
  predicciones: unknown[];
  tests: unknown[];
}

export const historialIntegradoService = {
  obtener: (clienteId: number, desde: string, hasta: string) =>
    api.get<HistorialIntegradoResponse>(
      `/api/clientes/${clienteId}/historial-integrado?desde=${encodeURIComponent(desde)}&hasta=${encodeURIComponent(hasta)}`,
    ),
};
