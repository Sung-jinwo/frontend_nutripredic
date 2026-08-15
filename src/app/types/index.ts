export type View =
  | "login" | "register"
  | "client-home" | "client-profile" | "client-habitos" | "client-conocimiento"
  | "client-suplementos" | "client-analisis" | "client-historial"
  | "client-recomendaciones"
  | "admin-dashboard" | "admin-clientes" | "admin-conocimiento"
  | "admin-consumo" | "admin-tiempo" | "admin-modelo" | "admin-reportes"
  | "admin-usuarios";

export type Role = "client" | "admin";

export interface SupplementoRegreso {
  nombre: string;
  tipo: string;
  cantidad: string;
  unidad: string;
  frecuencia: string;
}

export interface DailyHabitRecord {
  fecha: string;
  comidas: number;
  agua: number;
  proteinas: string;
  tipoAlim: string;
  organizacion: number;
  desayuno: boolean;
  snacks: number;
  alimentos: string[];
  comidasCocinadas: string;
  restricciones: string[];
  suplementos: SupplementoRegreso[];
  nivelConsumoSupplementos: string;
  timestamp: number;
}

export interface KnowledgeTestQuestion {
  id: number;
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: number;
  categoria: string;
}

export interface TestResult {
  fecha: string;
  puntaje: number;
  totalPreguntas: number;
  porcentaje: number;
  nivel: string;
  respuestas: { preguntaId: number; respuestaUsuario: number; correcta: boolean }[];
  timestamp: number;
}

export const FONT_HEADING = { fontFamily: "'Outfit', sans-serif" };
export const FONT_MONO = { fontFamily: "'JetBrains Mono', monospace" };

export const BREADCRUMBS: Record<View, string> = {
  login: "Acceso",
  register: "Registro",
  "client-home": "Inicio",
  "client-profile": "Mi Perfil",
  "client-habitos": "Hábitos Alimenticios",
  "client-conocimiento": "Test de Conocimiento",
  "client-suplementos": "Consumo de Suplementos",
  "client-analisis": "Mi Análisis Predictivo",
  "client-historial": "Historial",
  "client-recomendaciones": "Recomendaciones",
  "admin-dashboard": "Panel General",
  "admin-usuarios": "Usuarios",
  "admin-clientes": "Clientes",
  "admin-conocimiento": "Conocimiento Nutricional",
  "admin-consumo": "Consumo de Suplementos",
  "admin-tiempo": "Tiempo de Predicción",
  "admin-modelo": "Modelo IA",
  "admin-reportes": "Reportes",
};
