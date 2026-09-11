export type View =
  | "login" | "register"
  | "client-home" | "client-profile" | "client-habitos" | "client-conocimiento"
  | "client-suplementos" | "client-consumo" | "client-analisis" | "client-historial"
  | "client-recomendaciones"
  | "admin-dashboard" | "admin-clientes" | "admin-conocimiento"
  | "admin-consumo" | "admin-tiempo" | "admin-modelo" | "admin-reportes"
  | "admin-usuarios";

export type Role = "CLIENTE" | "ADMIN";

export const FONT_HEADING = { fontFamily: "'Outfit', sans-serif" };
export const FONT_MONO = { fontFamily: "'JetBrains Mono', monospace" };

export const BREADCRUMBS: Record<View, string> = {
  login: "Acceso",
  register: "Registro",
  "client-home": "Inicio",
  "client-profile": "Mi Perfil",
  "client-habitos": "Hábitos Alimenticios",
  "client-conocimiento": "Test de Conocimiento",
  "client-suplementos": "Mis suplementos habituales",
  "client-consumo": "Evaluación de consumo",
  "client-analisis": "Mi Análisis Predictivo",
  "client-historial": "Historial",
  "client-recomendaciones": "Orientación",
  "admin-dashboard": "Panel General",
  "admin-usuarios": "Usuarios",
  "admin-clientes": "Clientes",
  "admin-conocimiento": "Conocimiento Nutricional",
  "admin-consumo": "Consumo de Suplementos",
  "admin-tiempo": "Tiempo de Predicción",
  "admin-modelo": "Modelo IA",
  "admin-reportes": "Reportes",
};
