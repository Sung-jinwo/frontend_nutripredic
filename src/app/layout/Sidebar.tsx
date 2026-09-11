import {
  Brain, ChartNoAxesCombined, Clock, FileText, History, Home, LogOut, Menu, Pill, User, Utensils, X,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { View } from "../types";
import { ConfirmDialog } from "../components/shared";

type NavItem = { path: string; label: string; icon: typeof Home; view: View; unavailable?: boolean };
type NavGroup = { label: string; items: NavItem[] };

const CLIENT_NAV: NavGroup[] = [
  { label: "", items: [{ path: "/client/home", label: "Inicio", icon: Home, view: "client-home" }] },
  { label: "Registro de consumo", items: [
    { path: "/client/habitos", label: "Registro diario", icon: Utensils, view: "client-habitos" },
    { path: "/client/suplementos", label: "Mis suplementos habituales", icon: Pill, view: "client-suplementos" },
    { path: "/client/consumo", label: "Evaluación de consumo", icon: ChartNoAxesCombined, view: "client-consumo" },
    { path: "/client/conocimiento", label: "Conocimiento", icon: Brain, view: "client-conocimiento" },
  ] },
  { label: "Análisis y conocimiento", items: [
    { path: "/client/analisis", label: "Mi análisis", icon: Brain, view: "client-analisis" },
    { path: "/client/historial", label: "Historial", icon: History, view: "client-historial", unavailable: true },
    { path: "/client/recomendaciones", label: "Orientación", icon: FileText, view: "client-recomendaciones" },
  ] },
  { label: "Cuenta", items: [{ path: "/client/profile", label: "Perfil", icon: User, view: "client-profile" }] },
];

const ADMIN_NAV: NavGroup[] = [
  { label: "", items: [{ path: "/admin/dashboard", label: "Dashboard", icon: Home, view: "admin-dashboard" }] },
  { label: "Indicadores oficiales", items: [{ path: "/admin/conocimiento", label: "PCC oficial", icon: Brain, view: "admin-conocimiento" }, { path: "/admin/consumo", label: "PCS oficial", icon: ChartNoAxesCombined, view: "admin-consumo" }, { path: "/admin/tiempo", label: "TPP oficial", icon: Clock, view: "admin-tiempo" }] },
  { label: "Otros", items: [{ path: "/admin/reportes", label: "Reportes", icon: FileText, view: "admin-reportes" }] },
];

export function Sidebar() {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const groups = role === "ADMIN" ? ADMIN_NAV : CLIENT_NAV;
  const userName = user?.nombre ?? "Usuario";
  const initials = userName.split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
  const go = (path: string) => { navigate(path); setMobileOpen(false); };

  const content = (mobile = false) => <>
    <div className="flex items-center justify-between gap-3 border-b border-white/5 px-5 py-4">
      <div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 shadow"><Brain size={16} className="text-white" /></div><div className="text-sm font-bold leading-none text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>NutriPredict</div></div>
      {mobile && <button onClick={() => setMobileOpen(false)} aria-label="Cerrar navegación" className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"><X size={18} /></button>}
    </div>
    <div className="px-5 pb-2 pt-4"><span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{role === "ADMIN" ? "Panel Administrativo" : "Portal del Cliente"}</span></div>
    <nav className="flex-1 space-y-3 overflow-y-auto px-3 pb-3">
      {groups.map((group, index) => <div key={`${group.label}-${index}`}>
        {group.label && <div className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">{group.label}</div>}
        <div className="space-y-0.5">{group.items.map(({ path, label, icon: Icon, unavailable }) => {
          const active = location.pathname === path;
          return <button key={path} onClick={() => go(path)} aria-current={active ? "page" : undefined} className={`flex w-full items-center gap-3 rounded-xl border-l-2 px-3 py-2.5 text-left text-xs font-medium transition-all focus-visible:outline-offset-[-2px] ${active ? "border-[#d8e85f] bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(216,232,95,.08)]" : "border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-100"}`}><Icon size={15} /><span className="min-w-0 flex-1 truncate">{label}</span>{unavailable && <span className="text-[9px] text-slate-500">Pendiente</span>}</button>;
        })}</div>
      </div>)}
    </nav>
    <div className="border-t border-white/5 p-3"><div className="mb-1 flex items-center gap-2.5 px-2 py-2"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#397065] text-[10px] font-bold text-white">{initials}</div><div className="min-w-0"><div className="truncate text-xs font-medium text-slate-200">{userName}</div><div className="text-[10px] text-slate-500">{role === "ADMIN" ? "Administrador" : "Cliente"}</div></div></div><button onClick={() => setLogoutOpen(true)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-400 transition-all hover:bg-rose-500/10 hover:text-rose-300"><LogOut size={13} />Cerrar sesión</button></div>
  </>;

  return <>
    <aside className="hidden h-full w-64 shrink-0 flex-col bg-[#173c36] lg:flex">{content()}</aside>
    <button onClick={() => setMobileOpen(true)} aria-label="Abrir navegación" className="fixed left-3 top-3 z-40 rounded-xl bg-[#173c36] p-2 text-[#f5f3ed] shadow-lg lg:hidden"><Menu size={18} /></button>
    {mobileOpen && <div className="fixed inset-0 z-50 lg:hidden"><button aria-label="Cerrar navegación" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-slate-950/45" /><aside className="relative flex h-full w-72 flex-col bg-[#173c36] shadow-xl">{content(true)}</aside></div>}
    <ConfirmDialog open={logoutOpen} onOpenChange={setLogoutOpen} title="Cerrar sesión" description="Se cerrará tu sesión en este dispositivo. Podrás volver a ingresar con tus credenciales." confirmLabel="Cerrar sesión" destructive onConfirm={() => void logout()} />
  </>;
}
