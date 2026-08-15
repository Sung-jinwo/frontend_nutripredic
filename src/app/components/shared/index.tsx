export function Badge({ label, variant }: { label: string; variant: "success" | "warning" | "danger" | "info" | "neutral" | "purple" }) {
  const s: Record<string, string> = {
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    danger: "bg-rose-50 text-rose-700 border border-rose-200",
    info: "bg-sky-50 text-sky-700 border border-sky-200",
    neutral: "bg-slate-100 text-slate-500 border border-slate-200",
    purple: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s[variant]}`}>
      {label}
    </span>
  );
}

export function StateBadge({ estado }: { estado: string }) {
  if (estado === "Activo") return <Badge label="Activo" variant="success" />;
  if (estado === "Evaluado") return <Badge label="Evaluado" variant="info" />;
  if (estado === "Pendiente") return <Badge label="Pendiente" variant="warning" />;
  if (estado === "Pausado") return <Badge label="Pausado" variant="neutral" />;
  return <Badge label={estado} variant="neutral" />;
}

export function KPICard({ icon: Icon, title, value, sub, iconBg, change }: {
  icon: any; title: string; value: string; sub?: string; iconBg: string; change?: number;
}) {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${iconBg}`}>
          <Icon size={19} className="text-white" />
        </div>
        {change !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${change >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {change >= 0 ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-800 leading-none" style={FONT_HEADING}>{value}</div>
      <div className="text-sm text-slate-500 mt-1">{title}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800" style={FONT_HEADING}>{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function ProgressBar({ value, color = "bg-teal-500" }: { value: number; color?: string }) {
  return (
    <div className="w-full bg-slate-100 rounded-full h-1.5">
      <div className={`${color} h-1.5 rounded-full`} style={{ width: `${value}%` }} />
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-100 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

import { ArrowUp, ArrowDown } from "lucide-react";
import { FONT_HEADING } from "../../types";
