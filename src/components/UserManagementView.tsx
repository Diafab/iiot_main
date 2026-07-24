import React, { useState } from "react";
import {
  Users,
  ShieldCheck,
  UserCheck,
  UserX,
  AlertOctagon,
  Search,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { UserRole, UserProfile } from "../types";

export const UserManagementView: React.FC = () => {
  const { userProfile, allUsers, updateUserRole, isDemoMode, error, clearError } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [savingUid, setSavingUid] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const currentUserRole = userProfile?.role || "technician";
  const canAdminUsers = currentUserRole === "admin" || currentUserRole === "maintenance_manager";

  if (!canAdminUsers) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-red-200 text-center shadow-xs">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-black text-slate-900">Acceso Restringido</h2>
        <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
          Solo usuarios con rol de <span className="font-bold">Administrador</span> o{" "}
          <span className="font-bold">Jefe de Mantenimiento</span> pueden gestionar usuarios y roles de la plataforma.
        </p>
      </div>
    );
  }

  const roleLabels: Record<UserRole, { label: string; desc: string; color: string }> = {
    admin: {
      label: "Administrador",
      desc: "Acceso total a usuarios, reglas, máquinas y telemetría",
      color: "bg-purple-100 text-purple-800 border-purple-300",
    },
    maintenance_manager: {
      label: "Jefe de Mantenimiento",
      desc: "Gestión de personal técnico, máquinas e intervenciones",
      color: "bg-indigo-100 text-indigo-800 border-indigo-300",
    },
    technician: {
      label: "Técnico Especialista",
      desc: "Reconocimiento de alertas y registro de intervenciones",
      color: "bg-blue-100 text-blue-800 border-blue-300",
    },
    production_manager: {
      label: "Jefe de Producción",
      desc: "Monitoreo en tiempo real e historial de eventos (Sólo Lectura)",
      color: "bg-emerald-100 text-emerald-800 border-emerald-300",
    },
  };

  const filteredUsers = allUsers.filter(
    (u) =>
      u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    setSuccessMsg(null);
    clearError();
    try {
      setSavingUid(uid);
      await updateUserRole(uid, newRole);
      setSuccessMsg(`Rol actualizado correctamente para el usuario.`);
    } catch (err) {
      console.error("Role change error:", err);
    } finally {
      setSavingUid(null);
    }
  };

  const formatDate = (ts?: number) => {
    if (!ts) return "N/A";
    const d = new Date(ts);
    return `${d.toLocaleDateString("es-ES")} ${d.toLocaleTimeString("es-ES")}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-purple-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Administración de Usuarios y Roles
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-purple-100 text-purple-800 rounded-full border border-purple-200">
              Control RBAC
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Definición de permisos por rol para la supervisión industrial y gestión de mantenimientos.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
          <Users className="w-4 h-4 text-purple-600" />
          <span>{allUsers.length} Usuario(s) Registrado(s)</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-medium">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Role definitions reference card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {(Object.keys(roleLabels) as UserRole[]).map((rKey) => {
          const info = roleLabels[rKey];
          return (
            <div key={rKey} className="p-4 bg-white rounded-xl border border-purple-100 shadow-2xs space-y-1">
              <span className={`inline-block px-2 py-0.5 text-[10px] font-extrabold rounded-md border ${info.color}`}>
                {info.label}
              </span>
              <p className="text-[11px] text-slate-500 leading-tight mt-1">{info.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Users table */}
      <div className="bg-white rounded-2xl border border-purple-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              id="user-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o correo electrónico..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <span className="text-xs text-slate-500 font-mono self-end sm:self-center">
            {isDemoMode ? "Modo Demostración" : "Colección Firestore: 'users'"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Correo Electrónico</th>
                <th className="py-3 px-4">Rol Asignado</th>
                <th className="py-3 px-4">Última Sesión</th>
                <th className="py-3 px-4 text-right">Cambiar Rol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No hay usuarios registrados que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const roleConfig = roleLabels[u.role] || roleLabels.technician;
                  const isCurrent = userProfile?.uid === u.uid;
                  return (
                    <tr key={u.uid} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                            {u.displayName ? u.displayName.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <div>{u.displayName || "Usuario Industrial"}</div>
                            {isCurrent && (
                              <span className="text-[10px] text-purple-700 font-semibold">(Tú)</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono">{u.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${roleConfig.color}`}
                        >
                          {roleConfig.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono">{formatDate(u.lastLogin)}</td>
                      <td className="py-3 px-4 text-right">
                        <select
                          id={`user-role-select-${u.uid}`}
                          disabled={savingUid === u.uid}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                          className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                        >
                          <option value="admin">Admin</option>
                          <option value="maintenance_manager">Jefe Mantenimiento</option>
                          <option value="technician">Técnico</option>
                          <option value="production_manager">Jefe Producción</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
