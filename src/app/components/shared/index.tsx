import { AlertCircle, ArrowDown, ArrowUp, Inbox, LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";
import { FONT_HEADING } from "../../types";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "../ui/dialog";

export type StatusVariant = "success" | "warning" | "danger" | "info" | "neutral" | "purple";

export function Badge({ label, variant }: { label: string; variant: StatusVariant }) {
  const s: Record<string, string> = {
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    danger: "bg-rose-50 text-rose-700 border border-rose-200",
    info: "bg-sky-50 text-sky-700 border border-sky-200",
    neutral: "bg-slate-100 text-slate-500 border border-slate-200",
    purple: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none ${s[variant]}`}>
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

/** Badge semántico para estados que vienen del backend, sin reinterpretar su valor. */
export const StatusBadge = Badge;

export function KPICard({ icon: Icon, title, value, sub, iconBg, change }: {
  icon: any; title: string; value: string; sub?: string; iconBg: string; change?: number;
}) {
  return (
    <div className="rounded-2xl border border-[#dbe7e1] bg-white p-5 shadow-[0_8px_24px_rgba(23,60,54,.06)] transition-shadow hover:shadow-[0_12px_30px_rgba(23,60,54,.11)]">
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
      <div className="text-2xl font-semibold leading-none text-slate-900" style={FONT_HEADING}>{value}</div>
      <div className="mt-1 text-sm font-medium text-slate-700">{title}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

export const StatCard = KPICard;

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#397065]">NutriPredict</p>
        <h1 className="text-2xl font-semibold tracking-[-0.025em] text-slate-900" style={FONT_HEADING}>{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export const PageHeader = SectionHeader;

export function ProgressBar({ value, color = "bg-teal-500" }: { value: number; color?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)}>
      <div className={`${color} h-full rounded-full transition-[width] duration-300`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-[#dbe7e1] bg-white shadow-[0_8px_24px_rgba(23,60,54,.06)] ${className}`}>
      {children}
    </section>
  );
}

export const SectionCard = Card;

export function EmptyState({ title = "Sin información disponible", description, icon: Icon = Inbox, action }: { title?: string; description?: string; icon?: typeof Inbox; action?: ReactNode }) {
  return <Card className="border-dashed p-9 text-center"><Icon size={30} className="mx-auto mb-3 text-[#78a59a]" /><h2 className="text-base font-semibold text-slate-800" style={FONT_HEADING}>{title}</h2>{description && <p className="mx-auto mt-1.5 max-w-lg text-sm leading-6 text-slate-500">{description}</p>}{action && <div className="mt-5">{action}</div>}</Card>;
}

export function LoadingState({ label = "Cargando información..." }: { label?: string }) {
  return <Card className="p-10 text-center"><LoaderCircle size={28} className="mx-auto mb-3 animate-spin text-[#397065]" /><p className="text-sm text-slate-500">{label}</p></Card>;
}

export function ErrorState({ message }: { message: string }) {
  return <div role="alert" className="flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><AlertCircle size={18} className="mt-0.5 shrink-0" /><p>{message}</p></div>;
}

export function DataTable({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`overflow-x-auto overscroll-x-contain ${className}`}><table className="w-full min-w-[640px] text-sm">{children}</table></div>;
}

export function AppModal({ open, onOpenChange, title, description, children, footer, className = "" }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-h-[90vh] overflow-y-auto border-slate-200 bg-white p-0 shadow-2xl sm:max-w-2xl ${className}`}>
        <DialogHeader className="border-b border-slate-100 px-6 py-5 text-left">
          <DialogTitle className="text-lg font-semibold text-slate-900" style={FONT_HEADING}>{title}</DialogTitle>
          {description && <DialogDescription className="text-sm text-slate-500">{description}</DialogDescription>}
        </DialogHeader>
        <div className="px-6 py-5">{children}</div>
        {footer && <DialogFooter className="border-t border-slate-100 bg-slate-50/80 px-6 py-4">{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}

export function ConfirmModal({ open, onOpenChange, title, description, confirmLabel = "Confirmar", onConfirm, busy = false, destructive = false }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  busy?: boolean;
  destructive?: boolean;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-slate-200 bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-slate-900">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-600">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={busy}
            onClick={onConfirm}
            className={destructive ? "bg-rose-600 text-white hover:bg-rose-700" : "bg-teal-700 text-white hover:bg-teal-800"}
          >
            {busy ? "Procesando..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const ConfirmDialog = ConfirmModal;
