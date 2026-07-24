import React from "react";
import {
  Bell,
  CheckCircle2,
  Volume2,
  VolumeX,
  PhoneCall,
  ZapOff,
  Clock,
  ShieldCheck,
  AlertOctagon,
  Info,
} from "lucide-react";
import { useMachine } from "../context/MachineContext";
import { useAuth } from "../context/AuthContext";

export const ActiveAlertsView: React.FC = () => {
  const { latestEvent, eventsList, acknowledgeEvent, soundMuted, toggleSoundMute } = useMachine();
  const { userProfile } = useAuth();

  const role = userProfile?.role;
  const canAcknowledge = role === "admin" || role === "maintenance_manager" || role === "technician";

  const activeEvents = eventsList.filter((e) => e.active);

  const formatDate = (ts: number) => {
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
              Alertas Activas y Sirenas
            </h1>
            <span
              className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                activeEvents.length > 0
                  ? "bg-rose-600 text-white animate-pulse"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {activeEvents.length > 0 ? `${activeEvents.length} Alerta(s) Activa(s)` : "Sin Alertas"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Supervisión y reconocimiento técnico de llamadas de servicio o cortes de energía.
          </p>
        </div>

        <button
          onClick={toggleSoundMute}
          className={`px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            soundMuted
              ? "bg-amber-50 text-amber-800 border-amber-300"
              : "bg-purple-600 text-white border-purple-700 shadow-sm hover:bg-purple-700"
          }`}
        >
          {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span>{soundMuted ? "Sirena Silenciada" : "Sirena Audible Activa"}</span>
        </button>
      </div>

      {/* Primary Active Alert Card if present */}
      {latestEvent && latestEvent.active ? (
        <div className="bg-gradient-to-br from-rose-600 via-red-600 to-rose-700 text-white p-6 rounded-2xl shadow-lg border-2 border-rose-400 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-white/20 rounded-2xl backdrop-blur-md animate-bounce">
                {latestEvent.type === "POWER_OUTAGE" ? (
                  <ZapOff className="w-8 h-8 text-amber-200" />
                ) : (
                  <PhoneCall className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-wider bg-black/30 px-3 py-1 rounded-md border border-white/20">
                    {latestEvent.type === "TECHNICIAN_CALL"
                      ? "LLAMADA URGENTE A TÉCNICO"
                      : latestEvent.type === "POWER_OUTAGE"
                      ? "CORTE DE ENERGÍA DE PLANTA"
                      : "INTERVENCIÓN REQUERIDA"}
                  </span>
                  <span className="text-xs bg-white/20 font-mono font-bold px-2.5 py-1 rounded-md">
                    {latestEvent.state}
                  </span>
                  {latestEvent.smsSent && (
                    <span className="text-[10px] bg-emerald-500 font-bold px-2 py-0.5 rounded-md uppercase">
                      SMS Notificado
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-black mt-2">
                  Atención requerida en Maquinaria 01
                </h2>
                <div className="flex items-center gap-4 text-xs text-white/90 font-mono mt-1">
                  <span>Origen: {latestEvent.source}</span>
                  <span>|</span>
                  <span>Registrado: {formatDate(latestEvent.timestamp)}</span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto flex justify-end">
              {canAcknowledge ? (
                <button
                  onClick={() => acknowledgeEvent()}
                  className="w-full md:w-auto px-6 py-3 bg-white text-rose-700 font-black rounded-xl shadow-md hover:bg-slate-100 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 text-sm"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>RECONOCER Y SILENCIAR ALERTA</span>
                </button>
              ) : (
                <div className="text-xs italic bg-black/30 px-4 py-2 rounded-xl border border-white/20">
                  Solo personal con rol Técnico o Superior puede reconocer alertas.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 bg-white border border-purple-100 rounded-2xl text-center shadow-xs">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            No Hay Alertas Activas en este Momento
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            El sistema de monitoreo no detecta eventos críticos de llamada técnica ni cortes de energía pendientes de reconocimiento.
          </p>
        </div>
      )}

      {/* Active Alerts Table */}
      <div className="bg-white rounded-2xl border border-purple-100 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-purple-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-600" />
            <span>Lista de Alertas en Tiempo Real</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Mostrando {eventsList.length} registro(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Tipo de Evento</th>
                <th className="py-3 px-4">Estado / Descripción</th>
                <th className="py-3 px-4">Estado Alerta</th>
                <th className="py-3 px-4">Origen</th>
                <th className="py-3 px-4">Marca de Tiempo</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {eventsList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    No se han registrado eventos en la base de datos.
                  </td>
                </tr>
              ) : (
                eventsList.map((ev) => (
                  <tr
                    key={ev.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      ev.active ? "bg-rose-50/40 font-medium" : ""
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                      {ev.type === "TECHNICIAN_CALL" && (
                        <PhoneCall className="w-4 h-4 text-rose-600" />
                      )}
                      {ev.type === "POWER_OUTAGE" && (
                        <ZapOff className="w-4 h-4 text-amber-600" />
                      )}
                      {ev.type === "INTERVENTION_STARTED" && (
                        <Info className="w-4 h-4 text-indigo-600" />
                      )}
                      <span>{ev.type}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-mono">{ev.state}</td>
                    <td className="py-3 px-4">
                      {ev.active ? (
                        <span className="px-2 py-0.5 text-[10px] font-extrabold bg-rose-600 text-white rounded-full uppercase animate-pulse">
                          ACTIVA
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                          {ev.acknowledgedBy
                            ? `Reconocido (${ev.acknowledgedBy})`
                            : "Inactivo / Normal"}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{ev.source}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{formatDate(ev.timestamp)}</td>
                    <td className="py-3 px-4 text-right">
                      {ev.active && canAcknowledge ? (
                        <button
                          onClick={() => acknowledgeEvent(ev.id)}
                          className="px-3 py-1 bg-rose-600 text-white font-bold rounded-md hover:bg-rose-700 text-[11px] cursor-pointer"
                        >
                          Reconocer
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
