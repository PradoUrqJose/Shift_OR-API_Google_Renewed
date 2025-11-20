import { useState } from "react";
import { Trash2 } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { generateId } from "../lib/scheduling";

export default function CrudView({ title, items, fields, onAdd, onDelete, showNotify }) {
  const [formData, setFormData] = useState({});
  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({ ...formData, id: generateId() });
    setFormData({});
    showNotify("success", `${title} agregado.`);
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1 h-fit" hover>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-slate-700 rounded-lg">
            <span className="text-white font-bold text-lg">+</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800">Nuevo {title}</h3>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">{field.label}</label>
              {field.type === "select" ? (
                <select
                  className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all bg-white hover:border-slate-300"
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  value={formData[field.key] || ""}
                  required
                >
                  <option value="">Seleccionar...</option>
                  {field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type || "text"}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all bg-white hover:border-slate-300"
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  value={formData[field.key] || ""}
                  required
                />
              )}
            </div>
          ))}
          <Button type="submit" className="w-full justify-center mt-6">
            Guardar
          </Button>
        </form>
      </Card>
      <Card className="lg:col-span-2" hover delay={0.1}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-slate-700 rounded-lg">
            <span className="text-white font-bold text-lg">📋</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800">Lista de {title}s</h3>
          <span className="ml-auto px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
            {items.length} registros
          </span>
        </div>
        <div className="overflow-x-auto rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-xs text-gray-700 uppercase">
              <tr>
                {fields.map((f) => (
                  <th key={f.key} className="px-5 py-4 text-left font-bold">
                    {f.label}
                  </th>
                ))}
                <th className="px-5 py-4 text-right font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-all">
                  {fields.map((f) => (
                    <td key={f.key} className="px-5 py-4 text-gray-700 font-medium">
                      {f.type === "select" ? f.options.find((o) => o.value === item[f.key])?.label || item[f.key] : item[f.key]}
                    </td>
                  ))}
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => {
                        onDelete(item.id);
                        showNotify("success", "Registro eliminado");
                      }}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all hover:scale-110"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

