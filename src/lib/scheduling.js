// Utilidad para generar IDs únicos
export const generateId = () => Math.random().toString(36).substr(2, 9);

// Constantes legales peruanas
const LEGAL_CONSTANTS = {
  MAX_DAILY_HOURS: 8,
  MAX_WEEKLY_HOURS: 48,
  MIN_REST_BETWEEN_SHIFTS: 12, // horas
  MIN_WEEKLY_REST: 1, // días
  MIN_HOURLY_RATE: 4.27, // S/ (basado en RMV 2024: S/ 1,025.00)
  MAX_CONSECUTIVE_CLOSING_SHIFTS: 3,
  MINOR_NIGHT_SHIFT_LIMIT: "22:00", // menores de 18 no pueden trabajar después de esta hora
};

// Utilidades de tiempo
const parseTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes; // retorna minutos desde medianoche
};


const getDayOfWeek = (dateStr) => {
  return new Date(dateStr).getDay(); // 0 = domingo, 6 = sábado
};

const getWeekRange = (dateStr) => {
  // Calcular semana laboral: lunes a domingo
  const date = new Date(dateStr + "T00:00:00");
  const day = date.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
  // Calcular días hasta el lunes anterior (o el mismo día si es lunes)
  const diff = day === 0 ? -6 : 1 - day; // Si es domingo, retroceder 6 días; si no, calcular hasta lunes
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: monday.toISOString().split("T")[0], end: sunday.toISOString().split("T")[0] };
};

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

// Validaciones de restricciones legales
const validateLegalRestrictions = (employee, shift, date, schedule, precomputed = {}) => {
  const violations = [];

  // 1. Validar salario mínimo
  if (employee.hourlyRate < LEGAL_CONSTANTS.MIN_HOURLY_RATE) {
    violations.push(`Tarifa por hora (S/ ${employee.hourlyRate}) está por debajo del salario mínimo peruano (S/ ${LEGAL_CONSTANTS.MIN_HOURLY_RATE})`);
  }

  // 2. Validar horas diarias máximas
  const dailyHours = schedule
    .filter((s) => s.date === date && s.employeeId === employee.id)
    .reduce((acc, s) => acc + s.hours, 0);
  if (dailyHours + shift.hours > LEGAL_CONSTANTS.MAX_DAILY_HOURS) {
    violations.push(`Excedería las ${LEGAL_CONSTANTS.MAX_DAILY_HOURS} horas diarias permitidas (actual: ${dailyHours}h + ${shift.hours}h)`);
  }

  // 3. Validar horas semanales máximas
  // Usar valor precomputado si está disponible, sino calcular desde schedule
  const weeklyHours = precomputed.weeklyHours !== undefined 
    ? precomputed.weeklyHours
    : (() => {
        const weekRange = getWeekRange(date);
        return schedule
          .filter((s) => {
            if (s.employeeId !== employee.id) return false;
            const sDate = new Date(s.date + "T00:00:00");
            const weekStart = new Date(weekRange.start + "T00:00:00");
            const weekEnd = new Date(weekRange.end + "T00:00:00");
            return sDate >= weekStart && sDate <= weekEnd;
          })
          .reduce((acc, s) => acc + s.hours, 0);
      })();
    
  if (weeklyHours + shift.hours > LEGAL_CONSTANTS.MAX_WEEKLY_HOURS) {
    violations.push(`Excedería las ${LEGAL_CONSTANTS.MAX_WEEKLY_HOURS} horas semanales permitidas (actual: ${weeklyHours}h + ${shift.hours}h)`);
  }

  // 4. Validar descanso mínimo entre jornadas (12 horas)
  // Solo verificar el último turno asignado del día anterior (no todos los anteriores)
  const previousShifts = schedule
    .filter((s) => s.employeeId === employee.id)
    .sort((a, b) => {
      const dateCompare = new Date(a.date) - new Date(b.date);
      if (dateCompare !== 0) return dateCompare;
      return parseTime(b.end) - parseTime(a.end); // Ordenar por hora de fin descendente
    });

  if (previousShifts.length > 0) {
    // Buscar el último turno del día anterior (no del mismo día)
    const currentShiftDate = new Date(date + "T00:00:00");
    let lastShiftFromPreviousDay = null;
    
    for (const prevShift of previousShifts) {
      const prevShiftDate = new Date(prevShift.date + "T00:00:00");
      const daysDiff = Math.floor((currentShiftDate - prevShiftDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Encontró un turno del día anterior
        lastShiftFromPreviousDay = prevShift;
        break;
      } else if (daysDiff === 0) {
        // Mismo día - solo verificar que no se superpongan
        const lastEnd = parseTime(prevShift.end);
        const currentStart = parseTime(shift.start);
        if (currentStart < lastEnd) {
          violations.push(`Los turnos se superponen en el mismo día`);
        }
        // No requiere 12h de descanso en el mismo día, solo que no se superpongan
        break;
      } else if (daysDiff > 1) {
        // Hay más de un día de diferencia, no hay problema de descanso
        break;
      }
    }

    // Si hay un turno del día anterior, validar descanso de 12 horas
    if (lastShiftFromPreviousDay) {
      const lastEndMinutes = parseTime(lastShiftFromPreviousDay.end);
      const currentStartMinutes = parseTime(shift.start);
      
      // Calcular horas de descanso: horas restantes del día anterior + horas del día siguiente hasta inicio
      const hoursRemainingDay1 = (24 * 60 - lastEndMinutes) / 60; // Horas desde fin del turno hasta medianoche
      const hoursDay2 = currentStartMinutes / 60; // Horas desde medianoche hasta inicio del turno
      const totalRestHours = hoursRemainingDay1 + hoursDay2;
      
      if (totalRestHours < LEGAL_CONSTANTS.MIN_REST_BETWEEN_SHIFTS) {
        violations.push(`No cumple con el descanso mínimo de ${LEGAL_CONSTANTS.MIN_REST_BETWEEN_SHIFTS} horas entre jornadas (descanso: ${totalRestHours.toFixed(1)}h)`);
      }
    }
  }

  // 5. Validar turnos nocturnos para menores de edad
  const age = calculateAge(employee.birthDate);
  if (age !== null && age < 18) {
    const shiftEndTime = parseTime(shift.end);
    const limitTime = parseTime(LEGAL_CONSTANTS.MINOR_NIGHT_SHIFT_LIMIT);
    if (shiftEndTime > limitTime) {
      violations.push(`Menor de edad no puede trabajar turnos que terminen después de las ${LEGAL_CONSTANTS.MINOR_NIGHT_SHIFT_LIMIT}`);
    }
  }

  // 6. Validar descanso semanal obligatorio (1 día por semana)
  // Solo validar si ya trabajó 6 días en la semana ANTES del día actual
  const weekRangeCheck = getWeekRange(date);
  const workedDaysInWeek = new Set(
    schedule
      .filter((s) => {
        if (s.employeeId !== employee.id) return false;
        const sDate = new Date(s.date + "T00:00:00");
        const weekStart = new Date(weekRangeCheck.start + "T00:00:00");
        const weekEnd = new Date(weekRangeCheck.end + "T00:00:00");
        const currentDate = new Date(date + "T00:00:00");
        // Solo contar días anteriores al día actual
        return sDate >= weekStart && sDate <= weekEnd && sDate < currentDate;
      })
      .map((s) => s.date)
  );
  
  // Si ya trabajó 6 días ANTES del día actual, entonces este sería el 7mo día (violación)
  if (workedDaysInWeek.size >= 6) {
    violations.push(`Debe tener al menos ${LEGAL_CONSTANTS.MIN_WEEKLY_REST} día de descanso semanal obligatorio (ya trabajó ${workedDaysInWeek.size} días esta semana)`);
  }

  // 7. Validar turnos consecutivos de cierre
  // Solo contar turnos de cierre en días consecutivos anteriores
  if (shift.name.toLowerCase().includes("cierre")) {
    const recentClosingShifts = schedule
      .filter((s) => {
        if (s.employeeId !== employee.id || !s.shiftName.toLowerCase().includes("cierre")) return false;
        const sDate = new Date(s.date + "T00:00:00");
        const currentDate = new Date(date + "T00:00:00");
        const daysDiff = Math.floor((currentDate - sDate) / (1000 * 60 * 60 * 24));
        // Solo contar días consecutivos (0, 1, 2, 3)
        return daysDiff >= 0 && daysDiff < LEGAL_CONSTANTS.MAX_CONSECUTIVE_CLOSING_SHIFTS;
      })
      .length;

    if (recentClosingShifts >= LEGAL_CONSTANTS.MAX_CONSECUTIVE_CLOSING_SHIFTS) {
      violations.push(`No puede tener más de ${LEGAL_CONSTANTS.MAX_CONSECUTIVE_CLOSING_SHIFTS} turnos de cierre consecutivos`);
    }
  }

  // 8. Validar cierre + apertura consecutiva
  // Solo validar si ayer tuvo turno de cierre y hoy quiere abrir
  const yesterday = new Date(date + "T00:00:00");
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  
  const yesterdayShifts = schedule.filter((s) => {
    return s.employeeId === employee.id && s.date === yesterdayStr;
  });

  const hadClosingYesterday = yesterdayShifts.some((s) => s.shiftName.toLowerCase().includes("cierre"));
  const isOpeningToday = shift.name.toLowerCase().includes("apertura") || shift.name.toLowerCase().includes("mañana");

  if (hadClosingYesterday && isOpeningToday) {
    // Verificar si hay al menos 12 horas de descanso
    const lastClosingShift = yesterdayShifts
      .filter((s) => s.shiftName.toLowerCase().includes("cierre"))
      .sort((a, b) => parseTime(b.end) - parseTime(a.end))[0];
    
    if (lastClosingShift) {
      const lastEndMinutes = parseTime(lastClosingShift.end);
      const currentStartMinutes = parseTime(shift.start);
      const hoursRemainingDay1 = (24 * 60 - lastEndMinutes) / 60;
      const hoursDay2 = currentStartMinutes / 60;
      const totalRestHours = hoursRemainingDay1 + hoursDay2;
      
      if (totalRestHours < LEGAL_CONSTANTS.MIN_REST_BETWEEN_SHIFTS) {
        violations.push(`No puede cerrar un día y abrir al día siguiente (descanso insuficiente: ${totalRestHours.toFixed(1)}h < ${LEGAL_CONSTANTS.MIN_REST_BETWEEN_SHIFTS}h)`);
      }
    }
  }

  // 9. Validar disponibilidad del empleado
  if (employee.availability) {
    const dayOfWeek = getDayOfWeek(date);
    const dayNames = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    const dayName = dayNames[dayOfWeek];
    const dayAvailability = employee.availability[dayName];

    if (!dayAvailability || dayAvailability === "no disponible") {
      violations.push(`No disponible los ${dayName}s`);
    } else if (dayAvailability !== "disponible") {
      // Tiene horario específico
      const [availableStart, availableEnd] = dayAvailability.split(" - ");
      const shiftStart = parseTime(shift.start);
      const shiftEnd = parseTime(shift.end);
      const availStart = parseTime(availableStart);
      const availEnd = parseTime(availableEnd);

      if (shiftStart < availStart || shiftEnd > availEnd) {
        violations.push(`Fuera del horario disponible (${dayAvailability})`);
      }
    }
  }

  return violations;
};

// Simulador del Solver CP-SAT (Retail Edition - Rango Fechas) con restricciones legales peruanas
export const runCPSATSolver = (employees, shifts, stands, startDateStr, endDateStr, options = {}) => {
  const schedule = [];
  const violations = [];
  const warnings = [];

  // Generar array de fechas basado en el rango
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  start.setMinutes(start.getMinutes() + start.getTimezoneOffset());
  end.setMinutes(end.getMinutes() + end.getTimezoneOffset());

  const dates = [];
  for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
    dates.push(new Date(dt).toISOString().split("T")[0]);
  }

  // Tracking de carga de trabajo
  const employeeLoad = {}; // Carga total
  const employeeDailyLoad = {}; // Carga por día
  const employeeWeeklyLoad = {}; // Carga por semana
  const employeeClosingStreak = {}; // Racha de turnos de cierre

  employees.forEach((e) => {
    employeeLoad[e.id] = 0;
    employeeDailyLoad[e.id] = {};
    employeeWeeklyLoad[e.id] = {};
    employeeClosingStreak[e.id] = 0;
  });

  const shuffle = (array) => array.sort(() => Math.random() - 0.5);

  dates.forEach((date) => {
    const dayOfWeek = getDayOfWeek(date);
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const weekRange = getWeekRange(date);

    stands.forEach((stand) => {
      const allStandStaff = employees.filter((e) => e.standId === stand.id && e.active);
      if (allStandStaff.length === 0) return;

      shifts.forEach((shift) => {
        // Filtrar por rol requerido si existe (hacer copia para no afectar otros turnos)
        let standStaff = allStandStaff;
        if (shift.requiredRole) {
          standStaff = standStaff.filter((e) => e.role === shift.requiredRole);
        }
        
        if (standStaff.length === 0) return; // No hay empleados con el rol requerido

        // Calcular cuántos empleados se necesitan basado en la configuración del turno
        let needed = shift.requiredStaffBase || 1;
        
        // Si es fin de semana y hay configuración específica, usarla
        if (isWeekend && shift.requiredStaffWeekend != null) {
          needed = shift.requiredStaffWeekend;
        }
        
        // Nunca pedir más de los que existen en el stand
        needed = Math.min(needed, standStaff.length);

        // Filtrar candidatos válidos
        let candidates = standStaff.filter((e) => {
          // No asignar si ya tiene turno ese día
          if (schedule.some((s) => s.date === date && s.employeeId === e.id)) return false;

          // Validar restricciones legales
          // Calcular carga semanal actual para este empleado (optimización: calcular una vez y reutilizar)
          const currentWeekHours = schedule
            .filter((s) => {
              if (s.employeeId !== e.id) return false;
              const sDate = new Date(s.date + "T00:00:00");
              const weekStart = new Date(weekRange.start + "T00:00:00");
              const weekEnd = new Date(weekRange.end + "T00:00:00");
              return sDate >= weekStart && sDate <= weekEnd;
            })
            .reduce((acc, s) => acc + s.hours, 0);
            
          const legalViolations = validateLegalRestrictions(e, shift, date, schedule, { weeklyHours: currentWeekHours });
          if (legalViolations.length > 0) {
            violations.push({
              employee: e.name,
              date,
              shift: shift.name,
              violations: legalViolations,
            });
            return false;
          }

          return true;
        });

        // Determinar roles críticos basados en el turno (no global)
        const criticalRoles = shift.requiredRole ? [shift.requiredRole] : [];
        
        // Asegurar roles críticos
        const assignedRoles = new Set();
        schedule
          .filter((s) => s.date === date && s.standId === stand.id && s.shiftId === shift.id)
          .forEach((s) => {
            const emp = employees.find((e) => e.id === s.employeeId);
            if (emp) assignedRoles.add(emp.role);
          });

        // Priorizar empleados con roles críticos no asignados
        if (criticalRoles.length > 0) {
          const criticalCandidates = candidates.filter((e) => criticalRoles.includes(e.role) && !assignedRoles.has(e.role));
          if (criticalCandidates.length > 0 && !assignedRoles.has(criticalRoles[0])) {
            candidates = [...criticalCandidates, ...candidates.filter((e) => !criticalCandidates.includes(e))];
          }
        }

        // Ordenar por carga de trabajo (balancear)
        candidates = shuffle(candidates).sort((a, b) => {
          const loadA = employeeLoad[a.id] || 0;
          const loadB = employeeLoad[b.id] || 0;
          return loadA - loadB;
        });

        // Asignar turnos
        for (let i = 0; i < needed && i < candidates.length; i++) {
          const emp = candidates[i];
          if (!emp) continue;

          // Calcular carga semanal actual para determinar isExtra
          const weekKey = weekRange.start;
          const currentWeekLoad = employeeWeeklyLoad[emp.id]?.[weekKey] || 0;
          
          schedule.push({
            id: generateId(),
            date,
            shiftId: shift.id,
            shiftName: shift.name,
            employeeId: emp.id,
            employeeName: emp.name,
            employeeRole: emp.role,
            companyId: emp.companyId,
            standId: stand.id,
            standName: stand.name,
            hours: shift.hours,
            start: shift.start,
            end: shift.end,
            isExtra: shift.hours > LEGAL_CONSTANTS.MAX_DAILY_HOURS || currentWeekLoad + shift.hours > LEGAL_CONSTANTS.MAX_WEEKLY_HOURS,
          });

          // Actualizar tracking
          employeeLoad[emp.id] = (employeeLoad[emp.id] || 0) + shift.hours;
          employeeDailyLoad[emp.id][date] = (employeeDailyLoad[emp.id][date] || 0) + shift.hours;
          
          // Actualizar carga semanal correctamente
          if (!employeeWeeklyLoad[emp.id]) {
            employeeWeeklyLoad[emp.id] = {};
          }
          employeeWeeklyLoad[emp.id][weekKey] = currentWeekLoad + shift.hours;

          if (shift.name.toLowerCase().includes("cierre")) {
            employeeClosingStreak[emp.id] = (employeeClosingStreak[emp.id] || 0) + 1;
          } else {
            employeeClosingStreak[emp.id] = 0;
          }
        }

        // Verificar si se asignaron roles críticos (solo una advertencia por turno)
        const finalAssignedRoles = new Set();
        schedule
          .filter((s) => s.date === date && s.standId === stand.id && s.shiftId === shift.id)
          .forEach((s) => {
            const emp = employees.find((e) => e.id === s.employeeId);
            if (emp) finalAssignedRoles.add(emp.role);
          });

        const missingRoles = criticalRoles.filter((role) => !finalAssignedRoles.has(role));
        if (missingRoles.length > 0) {
          warnings.push({
            date,
            stand: stand.name,
            shift: shift.name,
            message: `Faltan roles críticos: ${missingRoles.join(", ")}`,
          });
        }
      });
    });
  });

  return {
    schedule: schedule.sort((a, b) => {
      const dateCompare = new Date(a.date) - new Date(b.date);
      if (dateCompare !== 0) return dateCompare;
      return parseTime(a.start) - parseTime(b.start);
    }),
    violations,
    warnings,
    statistics: {
      totalShifts: schedule.length,
      totalHours: schedule.reduce((acc, s) => acc + s.hours, 0),
      employeesUsed: new Set(schedule.map((s) => s.employeeId)).size,
      violationsCount: violations.length,
      warningsCount: warnings.length,
    },
  };
};
