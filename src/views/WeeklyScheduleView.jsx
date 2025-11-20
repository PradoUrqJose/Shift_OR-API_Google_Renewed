import { motion } from "framer-motion";
import { Calendar, Store, Clock, AlertTriangle } from "lucide-react";

export default function WeeklyScheduleView({ schedule, stands }) {
  if (schedule.length === 0)
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-96 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-dashed border-indigo-200 shadow-lg"
      >
        <div className="p-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mb-4">
          <Calendar size={48} className="text-indigo-600" />
        </div>
        <p className="text-gray-600 font-semibold">No hay turnos generados</p>
        <p className="text-sm text-gray-400 mt-1">Ve a "Automatización" para empezar</p>
      </motion.div>
    );

  const uniqueDates = [...new Set(schedule.map((s) => s.date))].sort();

  return (
    <div className="overflow-x-auto pb-4 -mx-2 px-2">
      <div className="flex gap-6 min-w-max">
        {uniqueDates.map((date, index) => {
          const dateObj = new Date(date);
          const dayName = dateObj.toLocaleDateString("es-ES", { weekday: "long", timeZone: "UTC" });
          const dayNum = dateObj.toLocaleDateString("es-ES", { day: "numeric", month: "short", timeZone: "UTC" });
          const shiftsThisDay = schedule.filter((s) => s.date === date);

          const shiftsByStand = stands.reduce((acc, stand) => {
            const s = shiftsThisDay.filter((sh) => sh.standId === stand.id);
            if (s.length > 0) acc.push({ stand, shifts: s });
            return acc;
          }, []);

          return (
            <motion.div
              key={date}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="w-80 bg-white/90 backdrop-blur-sm rounded-2xl border border-white/50 flex-shrink-0 flex flex-col shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <div className="p-4 bg-slate-700 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-1 relative z-10">{dayName}</p>
                <p className="text-2xl font-bold relative z-10">{dayNum}</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-200 relative z-10">
                  <Clock size={14} />
                  <span>{shiftsThisDay.length} turnos</span>
                </div>
              </div>
              <div className="p-4 space-y-4 flex-1 overflow-y-auto max-h-[650px] bg-gradient-to-b from-gray-50/50 to-white">
                {shiftsByStand.map(({ stand, shifts }, standIndex) => (
                  <motion.div
                    key={stand.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: standIndex * 0.05 }}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-gray-100 shadow-md hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-slate-700 rounded-lg">
                        <Store size={14} className="text-white" />
                      </div>
                      <p className="text-xs font-bold text-gray-700">{stand.name}</p>
                    </div>
                    <div className="space-y-2">
                      {shifts.map((shift) => (
                        <motion.div
                          key={shift.id}
                          whileHover={{ scale: 1.02, x: 4 }}
                          className="bg-slate-50 p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold bg-slate-700 text-white px-2.5 py-1 rounded-lg shadow-sm">
                              {shift.start} - {shift.end}
                            </span>
                            {shift.isExtra && (
                              <span className="text-xs font-bold bg-amber-500 text-white px-2 py-0.5 rounded flex items-center gap-1">
                                <AlertTriangle size={10} />
                                Extra
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-xs text-white font-bold shadow-md">
                              {shift.employeeName.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-800 font-semibold truncate">{shift.employeeName}</p>
                              {shift.employeeRole && (
                                <p className="text-xs text-gray-500">{shift.employeeRole}</p>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 pl-10 font-medium">{shift.shiftName}</p>
                          <div className="flex items-center gap-1 pl-10 mt-1">
                            <Clock size={10} className="text-gray-400" />
                            <p className="text-xs text-gray-400">{shift.hours}h</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

