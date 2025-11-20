import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, UserPlus, Users, Building2, Briefcase, DollarSign, Calendar, AlertCircle } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { generateId } from "../lib/scheduling";

const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export default function EmployeesView({ employees, stands, companies, setEmployees, showNotify }) {
  const [form, setForm] = useState({
    name: "",
    role: "",
    hourlyRate: "",
    companyId: "",
    standId: "",
    birthDate: "",
    availability: {
      lunes: "disponible",
      martes: "disponible",
      miércoles: "disponible",
      jueves: "disponible",
      viernes: "disponible",
      sábado: "disponible",
      domingo: "disponible",
    },
  });
  const availableStands = stands.filter((s) => s.companyId === form.companyId);
  const MIN_HOURLY_RATE = 4.27; // Salario mínimo peruano 2024

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar salario mínimo
    if (parseFloat(form.hourlyRate) < MIN_HOURLY_RATE) {
      showNotify("error", `La tarifa por hora (S/ ${form.hourlyRate}) está por debajo del salario mínimo peruano (S/ ${MIN_HOURLY_RATE})`);
      return;
    }

    setEmployees([...employees, { ...form, id: generateId(), active: true }]);
    setForm({
      name: "",
      role: "",
      hourlyRate: "",
      companyId: "",
      standId: "",
      birthDate: "",
      availability: {
        lunes: "disponible",
        martes: "disponible",
        miércoles: "disponible",
        jueves: "disponible",
        viernes: "disponible",
        sábado: "disponible",
        domingo: "disponible",
      },
    });
    showNotify("success", "Colaborador registrado.");
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-5 shadow-lg border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Users className="text-slate-700" size={20} />
            </div>
          </div>
          <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Total Colaboradores</p>
          <p className="text-2xl font-bold text-slate-800">{employees.length}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-5 shadow-lg border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="text-blue-700" size={20} />
            </div>
          </div>
          <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Stands Asignados</p>
          <p className="text-2xl font-bold text-blue-700">{new Set(employees.map((e) => e.standId)).size}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-5 shadow-lg border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <DollarSign className="text-emerald-700" size={20} />
            </div>
          </div>
          <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Tarifa Promedio</p>
          <p className="text-2xl font-bold text-emerald-700">
            S/{" "}
            {employees.length > 0
              ? (employees.reduce((acc, e) => acc + parseFloat(e.hourlyRate || 0), 0) / employees.length).toFixed(2)
              : "0.00"}
            /h
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 h-fit" hover>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-slate-100 rounded-lg">
              <UserPlus className="text-slate-700" size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Registrar Colaborador</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">Nombre Completo</label>
              <input
                type="text"
                placeholder="Ej: Juan Pérez"
                className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all bg-white hover:border-slate-300"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">Empresa</label>
              <select
                className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all bg-white hover:border-slate-300"
                required
                value={form.companyId}
                onChange={(e) => setForm({ ...form, companyId: e.target.value, standId: "" })}
              >
                <option value="">Seleccionar Empresa...</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">Stand</label>
              <select
                className={`w-full border-2 rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all ${
                  !form.companyId ? "bg-gray-100 border-gray-300 cursor-not-allowed" : "bg-white border-gray-200 hover:border-slate-300"
                }`}
                required
                disabled={!form.companyId}
                value={form.standId}
                onChange={(e) => setForm({ ...form, standId: e.target.value })}
              >
                <option value="">{form.companyId ? "Seleccionar Stand..." : "Primero seleccione Empresa"}</option>
                {availableStands.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                  Cargo <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all bg-white hover:border-slate-300"
                  required
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="">Seleccionar...</option>
                  <option value="Cajero">Cajero</option>
                  <option value="Vendedor">Vendedor</option>
                  <option value="Seguridad">Seguridad</option>
                  <option value="Almacén">Almacén</option>
                  <option value="Repositor">Repositor</option>
                  <option value="Gerente">Gerente</option>
                  <option value="Asesora">Asesora</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                  Tarifa/h (Min: S/ {MIN_HOURLY_RATE}) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="15.00"
                  step="0.01"
                  min={MIN_HOURLY_RATE}
                  className={`w-full border-2 rounded-xl p-3 outline-none focus:ring-2 transition-all ${
                    form.hourlyRate && parseFloat(form.hourlyRate) < MIN_HOURLY_RATE
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-200 focus:ring-slate-500 focus:border-slate-500 hover:border-slate-300"
                  } bg-white`}
                  required
                  value={form.hourlyRate}
                  onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                />
                {form.hourlyRate && parseFloat(form.hourlyRate) < MIN_HOURLY_RATE && (
                  <p className="text-xs text-red-600 mt-1">⚠️ Debe ser al menos S/ {MIN_HOURLY_RATE} (RMV 2024)</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                Fecha de Nacimiento (Para validar restricciones de menores)
              </label>
              <input
                type="date"
                className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all bg-white hover:border-slate-300"
                value={form.birthDate}
                onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">Los menores de 18 años no pueden trabajar después de las 22:00</p>
            </div>
            <Button type="submit" className="w-full justify-center mt-2">
              Registrar Colaborador
            </Button>
          </form>
        </Card>
        <Card className="lg:col-span-2" hover delay={0.1}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Users className="text-slate-700" size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Lista de Colaboradores</h3>
                <p className="text-sm text-gray-500">Gestión de personal activo</p>
              </div>
            </div>
            <div className="px-4 py-2 bg-slate-100 rounded-lg">
              <span className="text-sm font-bold text-slate-700">{employees.length} registros</span>
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-xs text-gray-700 uppercase">
                <tr>
                  <th className="px-5 py-4 text-left font-bold">Nombre</th>
                  <th className="px-5 py-4 text-left font-bold">Stand</th>
                  <th className="px-5 py-4 text-left font-bold">Cargo</th>
                  <th className="px-5 py-4 text-left font-bold">Tarifa/h</th>
                  <th className="px-5 py-4 text-left font-bold">Info Legal</th>
                  <th className="px-5 py-4 text-right font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employees.map((item, index) => {
                  const age = calculateAge(item.birthDate);
                  const isMinor = age !== null && age < 18;
                  const isValidRate = parseFloat(item.hourlyRate || 0) >= 4.27;
                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-slate-50 transition-all"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                            <span className="text-slate-700 font-bold text-sm">{item.name.charAt(0)}</span>
                          </div>
                          <span className="font-semibold text-gray-800">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="bg-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded-full font-semibold">
                          {stands.find((s) => s.id === item.standId)?.name || "-"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Briefcase size={14} className="text-gray-400" />
                          <span className="text-gray-700">{item.role}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${isValidRate ? "text-emerald-700" : "text-red-600"}`}>
                            S/ {parseFloat(item.hourlyRate || 0).toFixed(2)}/h
                          </span>
                          {!isValidRate && <AlertCircle size={14} className="text-red-500" title="Por debajo del salario mínimo" />}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          {age !== null && (
                            <div className="flex items-center gap-1">
                              <Calendar size={12} className="text-gray-400" />
                              <span className="text-xs text-gray-600">
                                {age} años {isMinor && <span className="text-amber-600 font-semibold">(Menor)</span>}
                              </span>
                            </div>
                          )}
                          {isMinor && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                              No puede trabajar después de 22:00
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => {
                            setEmployees(employees.filter((e) => e.id !== item.id));
                            showNotify("success", "Colaborador eliminado");
                          }}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all hover:scale-110"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

