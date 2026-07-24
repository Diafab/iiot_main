import React from "react";
import { AlertTriangle, CheckCircle2, Volume2, VolumeX, ShieldAlert, ZapOff, PhoneCall } from "lucide-react";
import { useMachine } from "../context/MachineContext";
import { useAuth } from "../context/AuthContext";

export const AlertBanner: React.FC = () => {
  const { latestEvent, acknowledgeEvent, soundMuted, toggleSoundMute } = useMachine();
  const { userProfile } = useAuth();

  if (!latestEvent || !latestEvent.active) return null;

  const isAlarmType =
    latestEvent.type === "TECHNICIAN_CALL" || latestEvent.type === "POWER_OUTAGE";

  if (!isAlarmType) return null;

  const role = userProfile?.role;
  const canAcknowledge = role === "admin" || role === "maintenance_manager" || role === "technician";

  const typeConfig = {
    TECHNICIAN_CALL: {
      title: "LLAMADA DE TÉCNICO EN CURSO",
      icon: PhoneCall,
      bg: "bg-gradient-to-r from-red-600 via-rose-600 to-red-700",
      border: "border-red-500",
      description: "Llamada urgente registrada por sensores o interfaz física de operador.",
    },
    POWER_OUTAGE: {
      title: "CORTE DE ENERGÍA DETECTADO",
      icon: ZapOff,
      bg: "bg-gradient-to-r from-red-700 via-amber-700 to-red-800",
      border: "border-amber-500",
      description: "Caída de suministro eléctrico principal en gabinete Maquinaria 01.",
    },
    INTERVENTION_STARTED: {
      title: "INTERVENCIÓN DE MANTENIMIENTO",
      icon: ShieldAlert,
      bg: "bg-gradient-to-r from-amber-600 to-amber-700",
      border: "border-amber-400",
      description: "Equipo en estado de mantenimiento técnico activo.",
    },
  }[latestEvent.type] || {
    title: "ALERTA ACTIVA EN MAQUINARIA",
    icon: AlertTriangle,
    bg: "bg-red-600",
    border: "border-red-400",
    description: "Evento crítico activo que requiere atención inmediata.",
  };

  const IconComp = typeConfig.icon;

  return (
    <div
      id="active-alert-banner"
      className={`w-full ${typeConfig.bg} text-white px-4 py-3 shadow-lg border-b-2 ${typeConfig.border} transition-all animate-fade-in`}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Left Info */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs flex-shrink-0 animate-bounce">
            <IconComp className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-sm sm:text-base tracking-wide uppercase bg-black/20 px-2.5 py-0.5 rounded-md border border-white/20">
                {typeConfig.title}
              </span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-mono font-medium">
                Estado: {latestEvent.state}
              </span>
              {latestEvent.smsSent && (
                <span className="text-[10px] bg-emerald-500/80 text-white font-bold px-1.5 py-0.5 rounded-md uppercase">
                  SMS Enviado
                </span>
              )}
            </div>
            <p className="text-xs text-white/90 mt-1">{typeConfig.description}</p>
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2 self-end md:self-center w-full md:w-auto justify-end">
          <button
            id="banner-toggle-sound-btn"
            onClick={toggleSoundMute}
            className="px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 rounded-lg border border-white/30 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-amber-200" /> : <Volume2 className="w-4 h-4 text-emerald-200" />}
            <span className="hidden sm:inline">{soundMuted ? "Activar Sonido" : "Silenciar Sirena"}</span>
          </button>

          {canAcknowledge ? (
            <button
              id="acknowledge-alert-btn"
              onClick={() => acknowledgeEvent()}
              className="px-4 py-2 text-xs font-bold bg-white text-red-700 hover:bg-slate-100 rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>RECONOCER ALERTA</span>
            </button>
          ) : (
            <span className="text-xs italic bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
              Solo técnicos/administradores pueden reconocer
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
