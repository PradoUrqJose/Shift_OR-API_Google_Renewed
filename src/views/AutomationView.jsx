import { useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Settings, CheckCircle, History, Sparkles, AlertTriangle, Info, Calendar } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { runCPSATSolver, generateId } from "../lib/scheduling";

// Helper para formatear fecha a DD/MM/YYYY
const formatDateToDisplay = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString + "T00:00:00");
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Helper para convertir DD/MM/YYYY a YYYY-MM-DD (formato input date)
const parseDateFromDisplay = (dateString) => {
  if (!dateString) return "";
  const parts = dateString.split("/");
  if (parts.length !== 3) return "";
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

export default function AutomationView({ employees, shifts, stands, schedule, setSchedule, automationHistory, setAutomationHistory, loading, setLoading, showNotify }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [lastResult, setLastResult] = useState(null);

  const handleOptimize = () => {
    if (!startDate || !endDate) {
      showNotify("error", "Seleccione un rango de fechas válido.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      showNotify("error", "La fecha fin debe ser posterior a la fecha de inicio.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = runCPSATSolver(employees, shifts, stands, startDate, endDate, {});
      
      setSchedule(result.schedule);
      setLastResult(result);

      // Agregar al historial
      const historyEntry = {
        id: generateId(),
        timestamp: new Date().toLocaleString("es-PE", { 
          day: "2-digit", 
          month: "2-digit", 
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }),
        range: `${formatDateToDisplay(startDate)} al ${formatDateToDisplay(endDate)}`,
        shiftsGenerated: result.schedule.length,
        violations: result.violations.length,
        warnings: result.warnings.length,
        status: result.violations.length > 0 ? "Con advertencias" : "Completado",
      };
      setAutomationHistory([historyEntry, ...automationHistory]);

      setLoading(false);
      
      if (result.violations.length > 0) {
        showNotify("error", `Optimización completada con ${result.violations.length} restricción(es) violada(s). Revisa los detalles.`);
      } else if (result.warnings.length > 0) {
        showNotify("success", `Optimización completada. ${result.schedule.length} turnos generados. ${result.warnings.length} advertencia(s).`);
      } else {
        showNotify("success", `Optimización completada. ${result.schedule.length} turnos generados sin problemas.`);
      }
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-slate-800 text-white shadow-2xl border border-slate-700"
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
        <div className="relative z-10 p-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Sparkles className="text-yellow-300" size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-2">
                Motor Retail de Automatización
              </h2>
              <p className="text-slate-300 text-sm mt-1">IA avanzada para distribución inteligente de turnos</p>
            </div>
          </div>
          <div className="mt-8 flex flex-col md:flex-row items-end gap-4">
            <div className="flex-1">
              <label className="block text-xs mb-2 text-slate-300 font-semibold uppercase tracking-wider flex items-center gap-2">
                <Calendar size={14} />
                Fecha Inicio
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl p-3 pl-10 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all [color-scheme:dark]"
                  style={{ 
                    colorScheme: "dark",
                    WebkitAppearance: "none"
                  }}
                />
                <Calendar 
                  size={18} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" 
                />
                {startDate && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 text-xs font-medium pointer-events-none">
                    {formatDateToDisplay(startDate)}
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">Formato: DD/MM/YYYY</p>
            </div>
            <div className="flex-1">
              <label className="block text-xs mb-2 text-slate-300 font-semibold uppercase tracking-wider flex items-center gap-2">
                <Calendar size={14} />
                Fecha Fin
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split("T")[0]}
                  className="w-full bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl p-3 pl-10 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all [color-scheme:dark]"
                  style={{ 
                    colorScheme: "dark",
                    WebkitAppearance: "none"
                  }}
                />
                <Calendar 
                  size={18} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" 
                />
                {endDate && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 text-xs font-medium pointer-events-none">
                    {formatDateToDisplay(endDate)}
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">Formato: DD/MM/YYYY</p>
            </div>
            <motion.button
              onClick={handleOptimize}
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-3 rounded-xl font-bold hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 flex items-center gap-2 shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={20} />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <Settings size={20} />
                  <span>Ejecutar Automatización</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TABLA DE RESULTADOS ACTUALES */}
        <Card className="lg:col-span-2" hover delay={0.2}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
                <CheckCircle size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Resultados Generados</h3>
                <p className="text-xs text-gray-500">Turnos actuales del sistema</p>
              </div>
            </div>
            <span className="px-4 py-2 bg-slate-700 text-white rounded-xl font-bold text-sm shadow-lg">
              {schedule.length} Turnos
            </span>
          </div>
          <div className="overflow-auto max-h-[450px] rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-xs text-gray-700 uppercase sticky top-0">
                <tr>
                  <th className="px-5 py-4 text-left font-bold">Fecha</th>
                  <th className="px-5 py-4 text-left font-bold">Stand</th>
                  <th className="px-5 py-4 text-left font-bold">Colaborador</th>
                  <th className="px-5 py-4 text-left font-bold">Turno</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {schedule.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-12 text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle size={32} className="text-gray-300" />
                        <p>No hay turnos generados aún.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  schedule.map((s, index) => (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      <td className="px-5 py-4 whitespace-nowrap font-medium text-gray-700">
                        {formatDateToDisplay(s.date)}
                      </td>
                      <td className="px-5 py-4 text-gray-600">{s.standName}</td>
                      <td className="px-5 py-4 font-semibold text-slate-700">{s.employeeName}</td>
                      <td className="px-5 py-4">
                        <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full font-semibold">
                          {s.shiftName}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* HISTORIAL DE EJECUCIONES */}
        <Card className="lg:col-span-1" hover delay={0.3}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-slate-700 rounded-lg">
              <History size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Historial</h3>
              <p className="text-xs text-gray-500">Ejecuciones recientes</p>
            </div>
          </div>
          <div className="space-y-3 overflow-auto max-h-[450px]">
            {automationHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <History size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm">Sin historial registrado.</p>
              </div>
            ) : (
              automationHistory.map((h, index) => (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-l-4 border-slate-500 bg-slate-50 p-4 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  <p className="text-xs text-gray-500 mb-2 font-medium">{h.timestamp}</p>
                  <p className="text-sm font-bold text-gray-800 mb-3">{h.range}</p>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        h.status === "Completado"
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                          : "bg-amber-500 text-white"
                      }`}
                    >
                      {h.status}
                    </span>
                    <span className="text-xs font-bold text-slate-700">{h.shiftsGenerated} Turnos</span>
                    {h.violations > 0 && (
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                        {h.violations} Viol.
                      </span>
                    )}
                    {h.warnings > 0 && (
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">
                        {h.warnings} Adv.
                      </span>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Sección de Violaciones y Advertencias */}
      {lastResult && (lastResult.violations.length > 0 || lastResult.warnings.length > 0) && (
        <div className="space-y-4">
          {lastResult.violations.length > 0 && (
            <Card hover>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="text-red-700" size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Restricciones Legales Violadas</h3>
                  <p className="text-sm text-gray-500">{lastResult.violations.length} violación(es) detectada(s)</p>
                </div>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {lastResult.violations.map((v, idx) => (
                  <div key={idx} className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-red-800">{v.employee}</p>
                        <p className="text-sm text-gray-600">
                          {v.date} - {v.shift}
                        </p>
                      </div>
                    </div>
                    <ul className="list-disc list-inside space-y-1">
                      {v.violations.map((violation, vIdx) => (
                        <li key={vIdx} className="text-sm text-red-700">{violation}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {lastResult.warnings.length > 0 && (
            <Card hover>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Info className="text-amber-700" size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Advertencias Operativas</h3>
                  <p className="text-sm text-gray-500">{lastResult.warnings.length} advertencia(s)</p>
                </div>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {lastResult.warnings.map((w, idx) => (
                  <div key={idx} className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-lg">
                    <p className="text-sm font-semibold text-amber-800">
                      {w.date} - {w.stand} - {w.shift}
                    </p>
                    <p className="text-sm text-amber-700 mt-1">{w.message}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Estadísticas */}
          {lastResult.statistics && (
            <Card hover>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CheckCircle className="text-blue-700" size={20} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Estadísticas de Optimización</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-slate-800">{lastResult.statistics.totalShifts}</p>
                  <p className="text-xs text-gray-500 mt-1">Turnos Generados</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-slate-800">{lastResult.statistics.totalHours}h</p>
                  <p className="text-xs text-gray-500 mt-1">Horas Totales</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-slate-800">{lastResult.statistics.employeesUsed}</p>
                  <p className="text-xs text-gray-500 mt-1">Empleados Usados</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{lastResult.statistics.violationsCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Violaciones</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

