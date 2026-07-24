import React from "react";
import { Activity, ShieldCheck, Key, LogIn, Database, Cpu, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types";

interface LoginViewProps {
  openConfigGuide: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ openConfigGuide }) => {
  const { signInWithGoogle, loading, error, isDemoMode, setDemoRole } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background industrial graphic accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl border border-purple-100 shadow-xl p-8 relative z-10 space-y-6">
        {/* Brand Logo & Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-purple-700 to-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md shadow-purple-500/20">
            <Activity className="w-7 h-7 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            INDUS<span className="text-purple-600">MONITOR</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
            Sistema de Monitoreo Industrial en Tiempo Real con Firebase Realtime Database, Firestore y Autenticación Google.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium text-center">
            {error}
          </div>
        )}

        {/* Primary Google Auth Login Button */}
        <div className="space-y-3">
          <button
            id="google-signin-btn"
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer text-sm disabled:opacity-50 active:scale-98"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{loading ? "Autenticando..." : "Iniciar Sesión con Google"}</span>
          </button>
        </div>

        {/* Demo Mode / Environment Status */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Seleccionar Rol para Prueba Directa
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: "admin", label: "Administrador" },
                  { id: "maintenance_manager", label: "Jefe Mantenimiento" },
                  { id: "technician", label: "Técnico Especialista" },
                  { id: "production_manager", label: "Jefe Producción" },
                ] as { id: UserRole; label: string }[]
              ).map((r) => (
                <button
                  key={r.id}
                  onClick={() => setDemoRole(r.id)}
                  className="px-2.5 py-2 text-xs font-semibold bg-slate-50 hover:bg-purple-50 hover:text-purple-700 text-slate-700 border border-slate-200 hover:border-purple-200 rounded-xl transition-all text-center cursor-pointer"
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={openConfigGuide}
            className="w-full py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Database className="w-4 h-4 text-purple-600" />
            <span>Guía de Configuración Variables Firebase</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="text-center text-[10px] text-slate-400 font-mono">
          Google AI Studio Build Mode • Monitoreo Maquinaria 01
        </div>
      </div>
    </div>
  );
};
