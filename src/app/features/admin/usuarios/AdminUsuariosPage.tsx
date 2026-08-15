import { Edit2, Settings } from "lucide-react";
import { Badge, StateBadge, SectionHeader, Card } from "../../../components/shared";

export default function AdminUsuariosPage() {
  const users = [
    { nombre: "Dr. Marcos Villena", email: "m.villena@sistema.edu", rol: "Administrador", estado: "Activo", ultimoAcceso: "Hoy, 09:45" },
    { nombre: "Lic. Carolina Fuentes", email: "c.fuentes@sistema.edu", rol: "Asesor", estado: "Activo", ultimoAcceso: "Hoy, 08:12" },
    { nombre: "Ing. Roberto Salinas", email: "r.salinas@sistema.edu", rol: "Administrador", estado: "Activo", ultimoAcceso: "Ayer, 16:30" },
    { nombre: "Lic. Patricia Mora", email: "p.mora@sistema.edu", rol: "Asesor", estado: "Activo", ultimoAcceso: "24/06/2025" },
  ];

  return (
    <div>
      <SectionHeader title="Gestión de usuarios" subtitle="Administradores y asesores del sistema" />
      <Card className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              {["Usuario", "Rol", "Estado", "Último acceso", "Acciones"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((u, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                      {u.nombre.split(" ")[1]?.charAt(0)}{u.nombre.split(" ")[2]?.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-800">{u.nombre}</div>
                      <div className="text-xs text-slate-400">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <Badge label={u.rol} variant={u.rol === "Administrador" ? "purple" : "info"} />
                </td>
                <td className="px-5 py-3.5"><StateBadge estado={u.estado} /></td>
                <td className="px-5 py-3.5 text-xs text-slate-500">{u.ultimoAcceso}</td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Edit2 size={13} /></button>
                    <button className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Settings size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
