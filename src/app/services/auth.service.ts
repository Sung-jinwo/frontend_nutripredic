import type { Role } from "../types";
import { api } from "./api";
import type { TipoEntrenamiento, TipoObjetivoFisico } from "./client.service";

export interface User {
  id: number;
  clienteId: number;
  email: string;
  nombre: string;
  rol: Role;
  activo: boolean;
  edad: number | null;
  pesoKg: number | null;
  alturaCm: number | null;
  imc: number | null;
  objetivoFisico: string | null;
  tipoObjetivoFisico: TipoObjetivoFisico | null;
  sexo?: "MASCULINO" | "FEMENINO" | null;
  sexoBiologico?: "MASCULINO" | "FEMENINO" | null;
  realizaActividadFisica: boolean | null;
  diasEntrenamientoSemana: number | null;
  tipoActividadFisica: string | null;
  tipoEntrenamiento?: TipoEntrenamiento | null;
  duracionPromedioSesionMinutos: number | null;
  objetivoEnergetico: "DEFICIT" | "MANTENIMIENTO" | "SUPERAVIT" | null;
}

export interface LoginRequest { email: string; password: string }
export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
}
export interface AuthResponse {
  token: string;
  tokenType: "Bearer";
  usuarioId: number;
  clienteId: number;
  email: string;
  nombre: string;
  rol: Role;
}

export const authService = {
  login: (credentials: LoginRequest) =>
    api.post<AuthResponse>("/api/auth/login", credentials, { auth: false }),
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>("/api/auth/register", data, { auth: false }),
  me: () => api.get<User>("/api/usuarios/me"),
};
