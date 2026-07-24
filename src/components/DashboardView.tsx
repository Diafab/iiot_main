import React from "react";
import {
  Activity,
  Radio,
  Wifi,
  Zap,
  Clock,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Power,
  Sliders,
  Bell,
  Cpu,
  Layers,
} from "lucide-react";
import { useMachine } from "../context/MachineContext";
import { useAuth } from "../context/AuthContext";
import { MachineState, EventType } from "../types";

export const DashboardView: React.FC = () => {
  const {
    liveData,
    latestEvent,
    isStale,
    secondsSinceUpdate,
    loading,
    rtdbError,
    simulateStateChange,
    simulateTriggerEvent,
    seedInitialRTDBData,
  } = useMachine();
  const { isDemoMode } = useAuth();

  // Color mappings for industrial machine state
  const stateStyles: Record<
    MachineState,
    { title: string; bg: string; text: string; border: string; badgeBg: string; pulse: boolean }
  > = {
    TRABAJANDO: {
      title: "TRABAJANDO (NORMAL)",
      bg: "bg-emerald-50",
      text: "text-emerald-800",
      border: "border-emerald-300",
      badgeBg: "bg-emerald-600 text-white",
      pulse: true,
    },
    DETENIDA: {
      title: "DETENIDA",
      bg: "bg-slate-100",
      text: "text-slate-800",
      border: "border-slate-300",
      badgeBg: "bg-slate-600 text-white",
      pulse: false,
    },
    MANTENIMIENTO: {
      title: "EN MANTENIMIENTO",
      bg: "bg-indigo-50",
      text: "text-indigo-800",
      border: "border-indigo-300",
      badgeBg: "bg-indigo-600 text-white",
      pulse: false,
    },
    FALLA: {
      title: "FALLA CRÍTICA",
      bg: "bg-rose-50",
      text: "text-rose-800",
      border: "border-rose-300",
      badgeBg: "bg-rose-600 text-white",
      pulse: true,
    },
    "CORTE ENERGIA": {
      title: "CORTE DE ENERGÍA",
      bg: "bg-amber-50",
      text: "text-amber-900",
      border: "border-amber-400",
      badgeBg: "bg-amber-600 text-white",
      pulse: true,
    },
  };

  const currentState = liveData?.state || "DETENIDA";
  const currentStyle = stateStyles[currentState] || stateStyles.DETENIDA;

  const formatDate = (ts?: number) => {
    if (!ts) return "N/A";
    const d = new Date(ts);
    return `${d.toLocaleDateString("es-ES")} ${d.toLocaleTimeString("es-ES")}`;
  };

  return (
    <div className="space-y-6">
      {/* Firebase / Connection Error Warning */}
      {rtdbError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <h4 className="font-bold text-red-900">Error de Conexión Realtime Database</h4>
            <p className="text-red-700">{rtdbError}</p>
            <p className="text-xs text-red-600 mt-1 font-mono">
              Verifica las reglas de seguridad o las variables VITE_FIREBASE_* en .env
            </p>
          </div>
        </div>
      )}

      {/* Outdated Equipment Warning Banner */}
      {isStale && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl">
              <Clock className="w-6 h-6 text-amber-700 animate-spin" />
            </div>
            <div>
              <h4 className="font-bold text-amber-900 text-sm">
                ¡EQUIPO SIN ACTUALIZACIÓN DE TELEMETRÍA!
              </h4>
              <p className="text-xs text-amber-800">
                La última señal recibida fue hace{" "}
                <span className="font-bold font-mono">{secondsSinceUpdate} segundos</span>.
                Compruebe la conectividad del PLC o enlace GSM/Wi-Fi en planta.
              </p>
            </div>
          </div>
          <button
            onClick={() => simulateStateChange(currentState)}
            className="px-3 py-1.5 text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 rounded-lg shadow-xs cursor-pointer"
          >
            Refrescar Señal
          </button>
        </div>
      )}

      {/* Main Header / Status Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-purple-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Monitoreo en Tiempo Real
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-purple-100 text-purple-800 rounded-full border border-purple-200">
              Línea 01 - Celda A
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Supervisión continua de sensores de telemetría y eventos de máquina 01.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {rtdbError ? (
            <button
              onClick={seedInitialRTDBData}
              className="px-3 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Inicializar Nodos RTDB</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-600">
              <Cpu className="w-4 h-4 text-purple-600" />
              <span>Fuente: {liveData?.source || "PLC_MODBUS_GW01"}</span>
            </div>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-2xl border border-slate-200" />
          ))}
        </div>
      ) : (
        /* 5 Industrial Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Machine State */}
          <div
            className={`p-5 rounded-2xl border-2 ${currentStyle.border} ${currentStyle.bg} flex flex-col justify-between transition-all shadow-xs`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Estado Máquina
              </span>
              <Activity
                className={`w-5 h-5 ${
                  currentState === "TRABAJANDO"
                    ? "text-emerald-600"
                    : currentState === "FALLA"
                    ? "text-rose-600 animate-bounce"
                    : "text-slate-500"
                }`}
              />
            </div>
            <div className="my-3">
              <span
                className={`inline-block px-3 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wide ${
                  currentStyle.badgeBg
                } ${currentStyle.pulse ? "animate-pulse" : ""}`}
              >
                {currentStyle.title}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Sensor principal activo
            </div>
          </div>

          {/* Card 2: GSM Status */}
          <div className="p-5 rounded-2xl border border-purple-100 bg-white flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Módulo GSM
              </span>
              <Radio
                className={`w-5 h-5 ${liveData?.gsm ? "text-purple-600" : "text-slate-300"}`}
              />
            </div>
            <div className="my-3">
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    liveData?.gsm ? "bg-purple-600 animate-ping" : "bg-slate-300"
                  }`}
                />
                <span className="text-lg font-bold text-slate-900">
                  {liveData?.gsm ? "CONECTADO" : "DESCONECTADO"}
                </span>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Red móvil de respaldo SMS
            </div>
          </div>

          {/* Card 3: Wi-Fi Status */}
          <div className="p-5 rounded-2xl border border-purple-100 bg-white flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Enlace Wi-Fi
              </span>
              <Wifi
                className={`w-5 h-5 ${liveData?.wifi ? "text-indigo-600" : "text-slate-300"}`}
              />
            </div>
            <div className="my-3">
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    liveData?.wifi ? "bg-indigo-600" : "bg-slate-300"
                  }`}
                />
                <span className="text-lg font-bold text-slate-900">
                  {liveData?.wifi ? "ACTIVO" : "INACTIVO"}
                </span>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Ancho de banda local 5GHz
            </div>
          </div>

          {/* Card 4: Power Status */}
          <div className="p-5 rounded-2xl border border-purple-100 bg-white flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Alimentación
              </span>
              <Zap
                className={`w-5 h-5 ${
                  liveData?.power ? "text-amber-500 fill-amber-400" : "text-slate-300"
                }`}
              />
            </div>
            <div className="my-3">
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    liveData?.power ? "bg-amber-500" : "bg-rose-500"
                  }`}
                />
                <span className="text-lg font-bold text-slate-900">
                  {liveData?.power ? "220V AC OK" : "SIN ENERGÍA"}
                </span>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Suministro Eléctrico Trifásico
            </div>
          </div>

          {/* Card 5: Last Update */}
          <div
            className={`p-5 rounded-2xl border ${
              isStale ? "border-amber-300 bg-amber-50/50" : "border-purple-100 bg-white"
            } flex flex-col justify-between shadow-xs`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Última Señal
              </span>
              <Clock className={`w-5 h-5 ${isStale ? "text-amber-600" : "text-purple-600"}`} />
            </div>
            <div className="my-2">
              <div className="text-sm font-bold text-slate-900 font-mono">
                {formatDate(liveData?.updatedAt)}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 mt-1">
                Hace {secondsSinceUpdate} s
              </div>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              {isStale ? "⚠️ Equipo desactualizado" : "Sincronización en tiempo real"}
            </div>
          </div>
        </div>
      )}

      {/* Latest Event Banner Panel */}
      {latestEvent && (
        <div className="p-5 bg-white rounded-2xl border border-purple-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 text-purple-700 rounded-xl">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                Último Evento Registrado
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Tipo: <span className="text-purple-900">{latestEvent.type}</span> — Estado:{" "}
                <span className="text-indigo-700">{latestEvent.state}</span>
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Origen: {latestEvent.source} | Fecha: {formatDate(latestEvent.timestamp)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                latestEvent.active
                  ? "bg-red-100 text-red-800 border border-red-200 animate-pulse"
                  : "bg-slate-100 text-slate-700 border border-slate-200"
              }`}
            >
              {latestEvent.active ? "ALERTA ACTIVA" : "RECONOCIDO / INACTIVO"}
            </span>
          </div>
        </div>
      )}

      {/* Simulator Tools Panel for Testing Realtime Telemetry */}
      <div className="p-6 bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 text-white rounded-2xl shadow-md border border-purple-800">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold tracking-wide">
              Simulador de Señales de Sensores Telemétricos
            </h3>
          </div>
          <span className="text-[11px] font-mono text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded-md border border-purple-700">
            {isDemoMode ? "Modo Demo" : "Realtime Database Conectado"}
          </span>
        </div>
        <p className="text-xs text-slate-300 mb-4">
          Utilice estos controles para simular cambios de telemetría provenientes del PLC de la máquina 01 y probar el funcionamiento en vivo de las alertas y actualización en tiempo real.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Change live state */}
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300 block mb-2">
              1. Simular Estado de Máquina en Vivo:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(
                ["TRABAJANDO", "DETENIDA", "MANTENIMIENTO", "FALLA", "CORTE ENERGIA"] as MachineState[]
              ).map((st) => (
                <button
                  key={st}
                  onClick={() => simulateStateChange(st)}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    currentState === st
                      ? "bg-purple-600 text-white border-purple-400 shadow-sm"
                      : "bg-white/10 text-slate-200 hover:bg-white/20 border-white/20"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Trigger events */}
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300 block mb-2">
              2. Disparar Eventos de Alerta Teleimétricos:
            </span>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => simulateTriggerEvent("TECHNICIAN_CALL")}
                className="flex-1 px-3 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg border border-rose-400 cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Bell className="w-4 h-4" />
                <span>Llamada de Técnico</span>
              </button>

              <button
                onClick={() => simulateTriggerEvent("POWER_OUTAGE")}
                className="flex-1 px-3 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg border border-amber-400 cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Zap className="w-4 h-4" />
                <span>Corte de Energía</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
