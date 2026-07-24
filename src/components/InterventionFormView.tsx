import React, { useState } from "react";
import {
  Wrench,
  UserCheck,
  AlertCircle,
  Clock,
  FileText,
  Package,
  PlusCircle,
  Check,
  History,
  Calendar,
} from "lucide-react";
import { useMachine } from "../context/MachineContext";
import { useAuth } from "../context/AuthContext";
import { InterventionType } from "../types";

export const InterventionFormView: React.FC = () => {
  const { registerIntervention, interventions } = useMachine();
  const { userProfile } = useAuth();

  const nowStr = new Date().toISOString().slice(0, 16);
  const oneHourAgoStr = new Date(Date.now() - 3600000).toISOString().slice(0, 16);

  const [technician, setTechnician] = useState(
    userProfile?.displayName || userProfile?.email || "Técnico Especialista"
  );
  const [cause, setCause] = useState("");
  const [interventionType, setInterventionType] = useState<InterventionType>("CORRECTIVA");
  const [replacedPart, setReplacedPart] = useState("");
  const [observations, setObservations] = useState("");
  const [startTime, setStartTime] = useState(oneHourAgoStr);
  const [endTime, setEndTime] = useState(nowStr);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitSuccess(false);

    if (!cause.trim()) {
      setErrorMessage("Por favor, ingrese la causa de la intervención.");
      return;
    }
    if (!replacedPart.trim()) {
      setErrorMessage("Por favor, especifique el repuesto o componente cambiado (o indicar 'Ninguno').");
      return;
    }

    try {
      setIsSubmitting(true);
      await registerIntervention({
        technician,
        cause,
        interventionType,
        replacedPart,
        observations,
        startTime,
        endTime,
      });

      setSubmitSuccess(true);
      setCause("");
      setReplacedPart("");
      setObservations("");
    } catch (err: unknown) {
      console.error("Error submitting intervention:", err);
      const msg = err instanceof Error ? err.message : "Error al guardar intervención";
      setErrorMessage("Error al registrar en Cloud Firestore: " + msg);
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Registro de Intervenciones Técnicas
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-purple-100 text-purple-800 rounded-full border border-purple-200">
              Cloud Firestore
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Formulario para registrar tareas correctivas, preventivas o de emergencia con histórico en base de datos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-purple-100 shadow-xs">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-purple-100">
            <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Nueva Ficha de Intervención
              </h2>
              <p className="text-xs text-slate-500">
                Llene los datos solicitados por el departamento de mantenimiento.
              </p>
            </div>
          </div>

          {submitSuccess && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-xs font-medium">
              <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Intervención registrada correctamente en Cloud Firestore. Estado de máquina actualizado a TRABAJANDO.</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800 text-xs font-medium">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Technician Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Técnico Responsable:
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="intervention-tech-input"
                  type="text"
                  required
                  value={technician}
                  onChange={(e) => setTechnician(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>
            </div>

            {/* Type & Cause Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tipo de Intervención:
                </label>
                <select
                  id="intervention-type-select"
                  value={interventionType}
                  onChange={(e) => setInterventionType(e.target.value as InterventionType)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold cursor-pointer"
                >
                  <option value="CORRECTIVA">CORRECTIVA (Falla Activa)</option>
                  <option value="PREVENTIVA">PREVENTIVA (Programada)</option>
                  <option value="PREDICTIVA">PREDICTIVA (Monitoreo)</option>
                  <option value="EMERGENCIA">EMERGENCIA (Parada Crítica)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Repuesto Cambiado:
                </label>
                <div className="relative">
                  <Package className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="intervention-part-input"
                    type="text"
                    required
                    placeholder="Ej. Rodamiento SKF 6205, Fusible 10A, etc."
                    value={replacedPart}
                    onChange={(e) => setReplacedPart(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Cause */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Causa u Origen de la Intervención:
              </label>
              <input
                id="intervention-cause-input"
                type="text"
                required
                placeholder="Ej. Sobrecalentamiento en motor principal por lubricante degradado"
                value={cause}
                onChange={(e) => setCause(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              />
            </div>

            {/* Start and End Times */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Hora Inicial de Trabajo:
                </label>
                <input
                  id="intervention-start-time"
                  type="datetime-local"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Hora Final de Trabajo:
                </label>
                <input
                  id="intervention-end-time"
                  type="datetime-local"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                />
              </div>
            </div>

            {/* Observations */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Observaciones y Pruebas Realizadas:
              </label>
              <textarea
                id="intervention-observations-input"
                rows={3}
                placeholder="Detalle pruebas de vacío, ajuste de torque o recomendaciones..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              />
            </div>

            <button
              id="submit-intervention-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <Wrench className="w-4 h-4" />
              <span>{isSubmitting ? "Guardando en Firestore..." : "REGISTRAR INTERVENCIÓN"}</span>
            </button>
          </form>
        </div>

        {/* History Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <History className="w-5 h-5 text-purple-600" />
              <span>Historial de Intervenciones</span>
            </h3>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {interventions.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No hay registros de intervenciones guardados en Firestore.
                </div>
              ) : (
                interventions.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 hover:bg-purple-50/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 text-[10px] font-extrabold bg-purple-100 text-purple-800 rounded-md uppercase">
                        {record.interventionType}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {formatDate(record.createdAt)}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900">
                      Causa: <span className="text-slate-800 font-normal">{record.cause}</span>
                    </h4>

                    <div className="text-xs text-slate-600 grid grid-cols-2 gap-1 font-mono">
                      <div>Técnico: <span className="font-semibold text-slate-800">{record.technician}</span></div>
                      <div>Repuesto: <span className="font-semibold text-slate-800">{record.replacedPart}</span></div>
                    </div>

                    {record.observations && (
                      <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded-lg border border-slate-200">
                        "{record.observations}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
