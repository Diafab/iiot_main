import React, { useState } from "react";
import {
  History,
  Search,
  Filter,
  ArrowUpDown,
  PhoneCall,
  ZapOff,
  Info,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { useMachine } from "../context/MachineContext";
import { HistoricalEvent, EventType } from "../types";

export const EventHistoryView: React.FC = () => {
  const { eventsList } = useMachine();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");

  const filteredEvents = eventsList.filter((ev) => {
    const matchesType = filterType === "ALL" || ev.type === filterType;
    const matchesQuery =
      ev.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesQuery;
  });

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
              Historial de Eventos Telemétricos
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-purple-100 text-purple-800 rounded-full border border-purple-200">
              Orden Descendente
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Registro cronológico de fallas, llamadas técnicas, arranques e incidencias en Maquinaria 01.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
          <History className="w-4 h-4 text-purple-600" />
          <span>Total: {filteredEvents.length} de {eventsList.length}</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-purple-100 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            id="event-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por estado, origen o tipo de evento..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filter dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-purple-600 hidden sm:inline" />
          <select
            id="event-filter-type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium cursor-pointer"
          >
            <option value="ALL">Todos los Tipos de Evento</option>
            <option value="TECHNICIAN_CALL">TECHNICIAN_CALL (Llamadas Técnico)</option>
            <option value="POWER_OUTAGE">POWER_OUTAGE (Cortes Energía)</option>
            <option value="INTERVENTION_STARTED">INTERVENTION_STARTED (Mantenimiento)</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-2xl border border-purple-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3.5 px-4">Marca de Tiempo (Desc)</th>
                <th className="py-3.5 px-4">Tipo de Evento</th>
                <th className="py-3.5 px-4">Estado Reportado</th>
                <th className="py-3.5 px-4">Estado SMS</th>
                <th className="py-3.5 px-4">Fuente / Sensor</th>
                <th className="py-3.5 px-4">Reconocimiento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No se encontraron eventos coincidentes con el filtro actual.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 whitespace-nowrap flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-purple-600" />
                      <span>{formatDate(ev.timestamp)}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-extrabold text-[11px] ${
                          ev.type === "TECHNICIAN_CALL"
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : ev.type === "POWER_OUTAGE"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-indigo-100 text-indigo-800 border border-indigo-200"
                        }`}
                      >
                        {ev.type === "TECHNICIAN_CALL" && <PhoneCall className="w-3.5 h-3.5" />}
                        {ev.type === "POWER_OUTAGE" && <ZapOff className="w-3.5 h-3.5" />}
                        {ev.type === "INTERVENTION_STARTED" && <Info className="w-3.5 h-3.5" />}
                        <span>{ev.type}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-800 font-bold">{ev.state}</td>
                    <td className="py-3.5 px-4">
                      {ev.smsSent ? (
                        <span className="px-2 py-0.5 text-[10px] bg-emerald-100 text-emerald-800 font-bold rounded-md">
                          SMS ENVIADO
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] bg-slate-100 text-slate-500 rounded-md">
                          No Enviado
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{ev.source}</td>
                    <td className="py-3.5 px-4">
                      {ev.active ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-600 text-white rounded-full uppercase">
                          Pendiente
                        </span>
                      ) : (
                        <span className="text-slate-600 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{ev.acknowledgedBy || "Procesado"}</span>
                        </span>
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
