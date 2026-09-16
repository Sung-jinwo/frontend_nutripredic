import { useState, useSyncExternalStore } from "react";
import { Bell, CheckCircle2, Info, TriangleAlert, Trash2 } from "lucide-react";
import { notificationStore } from "../../services/notifications";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";

export function NotificationCenter() {
  const items = useSyncExternalStore(notificationStore.subscribe, notificationStore.get);
  const [open, setOpen] = useState(false);
  const unread = items.filter(item => !item.read).length;
  return <Sheet open={open} onOpenChange={value => { setOpen(value); if (value) notificationStore.markAllRead(); }}>
    <SheetTrigger asChild><button className="relative rounded-xl p-2 text-primary hover:bg-muted" aria-label={`Notificaciones, ${unread} sin leer`}><Bell size={20}/>{unread > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">{unread > 99 ? "99+" : unread}</span>}</button></SheetTrigger>
    <SheetContent className="w-full sm:max-w-md">
      <SheetHeader><SheetTitle>Notificaciones</SheetTitle><SheetDescription>Últimos 100 avisos de tu cuenta guardados en este navegador. No se sincronizan entre dispositivos.</SheetDescription></SheetHeader>
      <div className="flex items-center justify-between px-4 text-xs text-muted-foreground"><span>{items.length} avisos</span><button disabled={!items.length} onClick={notificationStore.clear} className="rounded-md px-2 py-1 hover:bg-muted disabled:opacity-40">Vaciar historial</button></div>
      <div className="flex-1 overflow-y-auto px-4 pb-6">{items.length === 0 ? <p className="py-12 text-center text-sm text-muted-foreground">No tienes notificaciones guardadas.</p> : <ul className="space-y-3">{items.map(item => {
        const Icon = item.kind === "error" ? TriangleAlert : item.kind === "success" ? CheckCircle2 : Info;
        return <li key={item.id} className="flex gap-3 rounded-xl border border-border p-3"><Icon size={18} className={`mt-0.5 shrink-0 ${item.kind === "error" ? "text-destructive" : "text-primary"}`}/><div className="min-w-0 flex-1"><p className="break-words text-sm text-foreground">{item.message}</p><time dateTime={item.createdAt} className="mt-2 block text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" })}</time></div><button onClick={() => notificationStore.remove(item.id)} aria-label="Eliminar notificación" className="self-start rounded-md p-1 text-muted-foreground hover:bg-muted"><Trash2 size={15}/></button></li>;
      })}</ul>}</div>
    </SheetContent>
  </Sheet>;
}
