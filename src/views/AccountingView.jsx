import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, FileText, Download, DollarSign, Clock, TrendingUp } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { generateId } from "../lib/scheduling";

export default function AccountingView({ employees, stands, companies, schedule, accounting, setAccounting, showNotify, generatePDFDashboard }) {
  const [incidentForm, setIncidentForm] = useState({ empId: "", type: "lateness", date: "", value: 0 });
  const [reportTargetCompany, setReportTargetCompany] = useState("");
  const [reportTargetEmployee, setReportTargetEmployee] = useState("");

  const addIncident = () => {
    if (!incidentForm.empId || incidentForm.value <= 0) {
      showNotify("error", "Complete todos los campos de la incidencia.");
      return;
    }
    setAccounting([...accounting, { ...incidentForm, id: generateId() }]);
    setIncidentForm({ ...incidentForm, value: 0 });
    showNotify("success", "Incidencia registrada correctamente.");
  };

  const payrollSummary = employees.map((emp) => {
    const empSchedule = schedule.filter((s) => s.employeeId === emp.id);
    const empIncidents = accounting.filter((a) => a.employeeId === emp.id);

    const totalHours = empSchedule.reduce((acc, s) => acc + s.hours, 0);
    const totalLateness = empIncidents.filter((i) => i.type === "lateness").reduce((acc, i) => acc + i.value, 0);
    const totalBonus = empIncidents.filter((i) => i.type === "bonus").reduce((acc, i) => acc + i.value, 0);

    const gross = totalHours * emp.hourlyRate;
    const penalty = (totalLateness / 60) * emp.hourlyRate;
    const net = gross + totalBonus - penalty;

    return { ...emp, totalHours, totalLateness, totalBonus, net };
  });

  const totalPayroll = payrollSummary.reduce((acc, p) => acc + p.net, 0);

  return (
    <div className="space-y-8">
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-5 shadow-lg border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-slate-100 rounded-lg">
              <DollarSign className="text-slate-700" size={20} />
            </div>
          </div>
          <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Total Nómina</p>
          <p className="text-2xl font-bold text-slate-800">S/ {totalPayroll.toFixed(2)}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-5 shadow-lg border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <TrendingUp className="text-emerald-700" size={20} />
            </div>
          </div>
          <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Bonos Totales</p>
          <p className="text-2xl font-bold text-emerald-700">
            S/ {payrollSummary.reduce((acc, p) => acc + p.totalBonus, 0).toFixed(2)}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-5 shadow-lg border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <Clock className="text-red-700" size={20} />
            </div>
          </div>
          <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Tardanzas</p>
          <p className="text-2xl font-bold text-red-700">
            {payrollSummary.reduce((acc, p) => acc + p.totalLateness, 0)}m
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-5 shadow-lg border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="text-blue-700" size={20} />
            </div>
          </div>
          <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Incidencias</p>
          <p className="text-2xl font-bold text-blue-700">{accounting.length}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-1" hover>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-slate-100 rounded-lg">
              <AlertCircle className="text-slate-700" size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Registrar Incidencia</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">Colaborador</label>
              <select
                className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all bg-white hover:border-slate-300"
                value={incidentForm.empId}
                onChange={(e) => setIncidentForm({ ...incidentForm, empId: e.target.value })}
              >
                <option value="">Seleccionar Colaborador...</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">Tipo</label>
                <select
                  className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all bg-white hover:border-slate-300"
                  value={incidentForm.type}
                  onChange={(e) => setIncidentForm({ ...incidentForm, type: e.target.value })}
                >
                  <option value="lateness">Tardanza (Min)</option>
                  <option value="bonus">Bono (S/)</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">Valor</label>
                <input
                  type="number"
                  className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all bg-white hover:border-slate-300"
                  placeholder="0"
                  value={incidentForm.value}
                  onChange={(e) => setIncidentForm({ ...incidentForm, value: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">Fecha</label>
              <input
                type="date"
                className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all bg-white hover:border-slate-300"
                value={incidentForm.date}
                onChange={(e) => setIncidentForm({ ...incidentForm, date: e.target.value })}
              />
            </div>
            <Button onClick={addIncident} className="w-full justify-center mt-2">
              Registrar Incidencia
            </Button>
          </div>
        </Card>

        <Card className="xl:col-span-2" hover delay={0.1}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="text-blue-700" size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Generar Reportes PDF</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Button variant="secondary" className="w-full justify-center" icon={Download} onClick={() => generatePDFDashboard("General")}>
                Reporte General (Todos los empleados)
              </Button>
            </div>
            <div className="flex gap-3">
              <select
                className="flex-1 border-2 border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all bg-white hover:border-slate-300"
                onChange={(e) => setReportTargetCompany(e.target.value)}
              >
                <option value="">Seleccionar Empresa...</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <Button
                variant="secondary"
                className="flex-1 justify-center"
                icon={Download}
                onClick={() => (reportTargetCompany ? generatePDFDashboard("Empresa", reportTargetCompany) : showNotify("error", "Seleccione una empresa."))}
              >
                Por Empresa
              </Button>
            </div>
            <div className="flex gap-3">
              <select
                className="flex-1 border-2 border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all bg-white hover:border-slate-300"
                onChange={(e) => setReportTargetEmployee(e.target.value)}
              >
                <option value="">Seleccionar Colaborador...</option>
                {employees.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <Button
                variant="secondary"
                className="flex-1 justify-center"
                icon={Download}
                onClick={() => (reportTargetEmployee ? generatePDFDashboard("Unico", reportTargetEmployee) : showNotify("error", "Seleccione un colaborador."))}
              >
                Individual
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Card hover delay={0.2}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <DollarSign className="text-slate-700" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Pre-Nómina Semanal</h3>
              <p className="text-sm text-gray-500">Resumen de pagos y deducciones</p>
            </div>
          </div>
          <div className="px-4 py-2 bg-slate-100 rounded-lg">
            <span className="text-sm font-bold text-slate-700">{payrollSummary.length} empleados</span>
          </div>
        </div>
        <div className="overflow-x-auto rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-xs text-gray-700 uppercase">
              <tr>
                <th className="px-5 py-4 text-left font-bold">Empleado</th>
                <th className="px-5 py-4 text-left font-bold">Stand</th>
                <th className="px-5 py-4 text-left font-bold">Horas</th>
                <th className="px-5 py-4 text-left font-bold text-red-600">Tardanza</th>
                <th className="px-5 py-4 text-left font-bold text-emerald-600">Bono</th>
                <th className="px-5 py-4 text-right font-bold text-slate-700">Neto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payrollSummary.map((p, index) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-slate-50 transition-all"
                >
                  <td className="px-5 py-4 font-semibold text-gray-800">{p.name}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{stands.find((s) => s.id === p.standId)?.name || "-"}</td>
                  <td className="px-5 py-4 text-gray-700">{p.totalHours}h</td>
                  <td className="px-5 py-4 text-red-600 font-medium">{p.totalLateness}m</td>
                  <td className="px-5 py-4 text-emerald-600 font-semibold">S/ {p.totalBonus.toFixed(2)}</td>
                  <td className="px-5 py-4 text-right font-bold text-slate-800 text-lg">S/ {p.net.toFixed(2)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

