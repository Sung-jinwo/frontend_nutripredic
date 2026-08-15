import {
  Home, User, LogOut, Brain, Utensils, Pill, History, FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { View } from "../types";

const CLIENT_NAV = [
  { path: "/client/home", label: "Inicio", icon: Home, view: "client-home" as View },
  { path: "/client/profile", label: "Mi Perfil", icon: User, view: "client-profile" as View },
  { path: "/client/habitos", label: "Hábitos Alimenticios", icon: Utensils, view: "client-habitos" as View },
  { path: "/client/conocimiento", label: "Test de Conocimiento", icon: Brain, view: "client-conocimiento" as View },
  { path: "/client/analisis", label: "Mi Análisis Predictivo", icon: Brain, view: "client-analisis" as View },
  { path: "/client/historial", label: "Historial", icon: History, view: "client-historial" as View },
];

const ADMIN_NAV = [
  { path: "/admin/dashboard", label: "Inicio", icon: Home, view: "admin-dashboard" as View },
  { path: "/admin/reportes", label: "Reportes", icon: FileText, view: "admin-reportes" as View },
];

export function Sidebar() {
  const { role, logout } = useAuth();
  const navigate = useNavigate();
  const nav = role === "admin" ? ADMIN_NAV : CLIENT_NAV;
  const userName = role === "admin" ? "Dr. Marcos Villena" : "Ana María Rodríguez";
  const initials = role === "admin" ? "MV" : "AM";
  const currentPath = window.location.pathname;

  return (
    <div className="w-60 bg-[#0a1628] flex flex-col h-full flex-shrink-0">
      <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow">
          <Brain size={16} className="text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-sm leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>NutriPredict</div>
        </div>
      </div>

      <div className="px-5 pt-4 pb-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          {role === "admin" ? "Panel Administrativo" : "Portal del Cliente"}
        </span>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto pb-3">
        {nav.map(({ path, label, icon: Icon }) => {
          const active = currentPath === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                active
                  ? "bg-teal-500/15 text-teal-400 border-l-2 border-teal-400"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border-l-2 border-transparent"
              }`}
            >
              <Icon size={15} />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-slate-200 text-xs font-medium truncate">{userName}</div>
            <div className="text-slate-500 text-[10px]">{role === "admin" ? "Administrador" : "Cliente"}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all text-xs font-medium"
        >
          <LogOut size={13} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
