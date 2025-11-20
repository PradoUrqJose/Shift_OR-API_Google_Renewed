import { useMemo } from "react";
import { motion } from "framer-motion";
import { Users, Building2, Calendar, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart as RPieChart, Pie, Cell } from "recharts";
import Card from "../components/ui/Card";

const COLORS = ["#475569", "#64748b", "#334155", "#1e293b", "#10b981", "#059669", "#dc2626", "#0891b2"];

const StatCard = ({ icon: Icon, label, value, gradient, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]`}
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
          <Icon size={24} className="text-white" />
        </div>
      </div>
      <p className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
      <p className="text-4xl font-bold text-white">{value}</p>
    </div>
  </motion.div>
);

export default function DashboardView({ employees, stands, schedule }) {
  const stats = useMemo(() => {
    const totalHours = schedule.reduce((acc, s) => acc + s.hours, 0);
    const shiftsByStand = stands
      .map((st) => ({
        name: st.name.split("-")[0],
        value: schedule.filter((s) => s.standId === st.id).length,
      }))
      .filter((d) => d.value > 0);
    return { totalHours, shiftsByStand };
  }, [schedule, stands]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          label="Colaboradores"
          value={employees.length}
          gradient="from-slate-600 via-slate-700 to-slate-800"
          delay={0}
        />
        <StatCard
          icon={Building2}
          label="Stands Activos"
          value={stands.length}
          gradient="from-blue-600 via-blue-700 to-blue-800"
          delay={0.1}
        />
        <StatCard
          icon={Calendar}
          label="Turnos Generados"
          value={schedule.length}
          gradient="from-emerald-600 via-emerald-700 to-emerald-800"
          delay={0.2}
        />
        <StatCard
          icon={Clock}
          label="Horas Totales"
          value={`${stats.totalHours}h`}
          gradient="from-amber-600 via-amber-700 to-amber-800"
          delay={0.3}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card hover delay={0.4}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Carga por Stand</h3>
            <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center">
              <Building2 size={20} className="text-white" />
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.shiftsByStand}>
                <defs>
                  <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#475569" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#64748b" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" hide />
                <YAxis stroke="#6b7280" />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar dataKey="value" fill="url(#colorBar)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card hover delay={0.5}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Distribución</h3>
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Calendar size={20} className="text-white" />
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RPieChart>
                <Pie
                  data={stats.shiftsByStand}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={50}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.shiftsByStand.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                />
              </RPieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

