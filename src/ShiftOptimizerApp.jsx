import React, { useState, useEffect } from "react";
import {
  Users,
  Building2,
  Settings,
  PieChart,
  DollarSign,
  FileSpreadsheet,
  Clock,
  Store,
  MapPin,
  LayoutGrid,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Componentes UI
import Card from "./components/ui/Card";
import Button from "./components/ui/Button";
import Toast from "./components/ui/Toast";

// Vistas
import DashboardView from "./views/DashboardView";
import WeeklyScheduleView from "./views/WeeklyScheduleView";
import AccountingView from "./views/AccountingView";
import AutomationView from "./views/AutomationView";
import CrudView from "./views/CrudView";
import EmployeesView from "./views/EmployeesView";

// Utilidades
import { generateId } from "./lib/scheduling";

// --- HELPERS LOCALSTORAGE ---
const loadFromLocalStorage = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// --- VALORES POR DEFECTO ---
const DEFAULT_COMPANIES = [
  { id: "1", name: "Retail SuperMarket S.A.", ruc: "20123456789" },
  { id: "2", name: "Moda Express Ltda.", ruc: "20987654321" },
];

const DEFAULT_STANDS = [
  { id: "st1", name: "Stand Central - Real Plaza Trujillo", companyId: "1" },
  { id: "st2", name: "Isla Express - Real Plaza Trujillo", companyId: "1" },
  { id: "st3", name: "Boutique Principal - Real Plaza Trujillo", companyId: "2" },
  { id: "st4", name: "Corner - Real Plaza Trujillo", companyId: "2" },
];

const DEFAULT_SHIFTS = [
  {
    id: "s1",
    name: "Apertura",
    start: "10:00",
    end: "16:00",
    hours: 6,
    requiredStaffBase: 1,
    requiredRole: "Vendedor",
  },
  {
    id: "s2",
    name: "Punta (Tarde)",
    start: "16:00",
    end: "21:00",
    hours: 5,
    requiredStaffBase: 2,
    requiredStaffWeekend: 2,
    requiredRole: "Vendedor",
  },
  {
    id: "s3",
    name: "Cierre",
    start: "16:00",
    end: "21:00",
    hours: 5,
    requiredStaffBase: 1,
    requiredRole: "Vendedor",
  },
];

// --- APP PRINCIPAL ---
export default function ShiftOptimizerApp() {
  const [view, setView] = useState("dashboard");
  const [libsLoaded, setLibsLoaded] = useState(false);
  const [notification, setNotification] = useState(null); // { type, message }

  // --- ESTADO GLOBAL con localStorage ---
  const [companies, setCompanies] = useState(() => loadFromLocalStorage("shiftpro_companies", DEFAULT_COMPANIES));
  const [stands, setStands] = useState(() => loadFromLocalStorage("shiftpro_stands", DEFAULT_STANDS));

  const [employees, setEmployees] = useState(() => {
    const defaultEmployees = [
      // Stand Central (st1) - 4 vendedores
    {
      id: "e1",
      name: "Juan Pérez",
      companyId: "1",
      standId: "st1",
      role: "Vendedor",
      hourlyRate: 15,
      active: true,
      birthDate: "1990-05-15",
      availability: {
        lunes: "disponible",
        martes: "disponible",
        miércoles: "disponible",
        jueves: "disponible",
        viernes: "disponible",
        sábado: "disponible",
        domingo: "disponible",
      },
    },
    {
      id: "e2",
      name: "Maria Garcia",
      companyId: "1",
      standId: "st1",
      role: "Vendedor",
      hourlyRate: 12,
      active: true,
      birthDate: "1988-03-20",
      availability: {
        lunes: "disponible",
        martes: "disponible",
        miércoles: "disponible",
        jueves: "disponible",
        viernes: "disponible",
        sábado: "disponible",
        domingo: "disponible",
      },
    },
    {
      id: "e7",
      name: "Roberto Silva",
      companyId: "1",
      standId: "st1",
      role: "Vendedor",
      hourlyRate: 14,
      active: true,
      birthDate: "1994-08-12",
      availability: {
        lunes: "disponible",
        martes: "disponible",
        miércoles: "disponible",
        jueves: "disponible",
        viernes: "disponible",
        sábado: "disponible",
        domingo: "disponible",
      },
    },
    {
      id: "e8",
      name: "Carmen Vega",
      companyId: "1",
      standId: "st1",
      role: "Vendedor",
      hourlyRate: 13,
      active: true,
      birthDate: "1995-02-28",
      availability: {
        lunes: "disponible",
        martes: "disponible",
        miércoles: "disponible",
        jueves: "disponible",
        viernes: "disponible",
        sábado: "disponible",
        domingo: "disponible",
      },
    },
    // Isla Express (st2) - 4 vendedores
    {
      id: "e5",
      name: "Luis Torres",
      companyId: "1",
      standId: "st2",
      role: "Vendedor",
      hourlyRate: 13,
      active: true,
      birthDate: "1991-09-05",
      availability: {
        lunes: "disponible",
        martes: "disponible",
        miércoles: "disponible",
        jueves: "disponible",
        viernes: "disponible",
        sábado: "disponible",
        domingo: "disponible",
      },
    },
    {
      id: "e9",
      name: "Patricia Ramos",
      companyId: "1",
      standId: "st2",
      role: "Vendedor",
      hourlyRate: 14,
      active: true,
      birthDate: "1992-06-15",
      availability: {
        lunes: "disponible",
        martes: "disponible",
        miércoles: "disponible",
        jueves: "disponible",
        viernes: "disponible",
        sábado: "disponible",
        domingo: "disponible",
      },
    },
    {
      id: "e10",
      name: "Diego Morales",
      companyId: "1",
      standId: "st2",
      role: "Vendedor",
      hourlyRate: 15,
      active: true,
      birthDate: "1993-11-22",
      availability: {
        lunes: "disponible",
        martes: "disponible",
        miércoles: "disponible",
        jueves: "disponible",
        viernes: "disponible",
        sábado: "disponible",
        domingo: "disponible",
      },
    },
    {
      id: "e11",
      name: "Laura Jimenez",
      companyId: "1",
      standId: "st2",
      role: "Vendedor",
      hourlyRate: 12,
      active: true,
      birthDate: "1996-04-08",
      availability: {
        lunes: "disponible",
        martes: "disponible",
        miércoles: "disponible",
        jueves: "disponible",
        viernes: "disponible",
        sábado: "disponible",
        domingo: "disponible",
      },
    },
    // Boutique Principal (st3) - 4 vendedores
    {
      id: "e3",
      name: "Carlos Ruiz",
      companyId: "2",
      standId: "st3",
      role: "Vendedor",
      hourlyRate: 14,
      active: true,
      birthDate: "1992-11-10",
      availability: {
        lunes: "disponible",
        martes: "disponible",
        miércoles: "disponible",
        jueves: "disponible",
        viernes: "disponible",
        sábado: "disponible",
        domingo: "disponible",
      },
    },
    {
      id: "e4",
      name: "Ana Lopez",
      companyId: "2",
      standId: "st3",
      role: "Vendedor",
      hourlyRate: 25,
      active: true,
      birthDate: "1985-07-25",
      availability: {
        lunes: "disponible",
        martes: "disponible",
        miércoles: "disponible",
        jueves: "disponible",
        viernes: "disponible",
        sábado: "disponible",
        domingo: "disponible",
      },
    },
    {
      id: "e12",
      name: "Fernando Castro",
      companyId: "2",
      standId: "st3",
      role: "Vendedor",
      hourlyRate: 16,
      active: true,
      birthDate: "1991-03-17",
      availability: {
        lunes: "disponible",
        martes: "disponible",
        miércoles: "disponible",
        jueves: "disponible",
        viernes: "disponible",
        sábado: "disponible",
        domingo: "disponible",
      },
    },
    {
      id: "e13",
      name: "Monica Herrera",
      companyId: "2",
      standId: "st3",
      role: "Vendedor",
      hourlyRate: 15,
      active: true,
      birthDate: "1994-09-30",
      availability: {
        lunes: "disponible",
        martes: "disponible",
        miércoles: "disponible",
        jueves: "disponible",
        viernes: "disponible",
        sábado: "disponible",
        domingo: "disponible",
      },
    },
    // Corner (st4) - 4 vendedores
    {
      id: "e6",
      name: "Sofia Mendez",
      companyId: "2",
      standId: "st4",
      role: "Vendedor",
      hourlyRate: 16,
      active: true,
      birthDate: "1993-12-18",
      availability: {
        lunes: "disponible",
        martes: "disponible",
        miércoles: "disponible",
        jueves: "disponible",
        viernes: "disponible",
        sábado: "disponible",
        domingo: "disponible",
      },
    },
    {
      id: "e14",
      name: "Javier Mendoza",
      companyId: "2",
      standId: "st4",
      role: "Vendedor",
      hourlyRate: 14,
      active: true,
      birthDate: "1992-07-05",
      availability: {
        lunes: "disponible",
        martes: "disponible",
        miércoles: "disponible",
        jueves: "disponible",
        viernes: "disponible",
        sábado: "disponible",
        domingo: "disponible",
      },
    },
    {
      id: "e15",
      name: "Valeria Paredes",
      companyId: "2",
      standId: "st4",
      role: "Vendedor",
      hourlyRate: 15,
      active: true,
      birthDate: "1995-01-20",
      availability: {
        lunes: "disponible",
        martes: "disponible",
        miércoles: "disponible",
        jueves: "disponible",
        viernes: "disponible",
        sábado: "disponible",
        domingo: "disponible",
      },
    },
    {
      id: "e16",
      name: "Ricardo Flores",
      companyId: "2",
      standId: "st4",
      role: "Vendedor",
      hourlyRate: 13,
      active: true,
      birthDate: "1993-10-14",
      availability: {
        lunes: "disponible",
        martes: "disponible",
        miércoles: "disponible",
        jueves: "disponible",
        viernes: "disponible",
        sábado: "disponible",
        domingo: "disponible",
      },
    },
    ];
    return loadFromLocalStorage("shiftpro_employees", defaultEmployees);
  });

  const [shifts, setShifts] = useState(() => loadFromLocalStorage("shiftpro_shifts", DEFAULT_SHIFTS));
  const [schedule, setSchedule] = useState(() => loadFromLocalStorage("shiftpro_schedule", []));
  const [automationHistory, setAutomationHistory] = useState(() => loadFromLocalStorage("shiftpro_automationHistory", []));
  const [accounting, setAccounting] = useState(() => loadFromLocalStorage("shiftpro_accounting", []));
  const [loading, setLoading] = useState(false);

  // --- PERSISTENCIA LOCALSTORAGE ---
  useEffect(() => {
    saveToLocalStorage("shiftpro_companies", companies);
  }, [companies]);

  useEffect(() => {
    saveToLocalStorage("shiftpro_stands", stands);
  }, [stands]);

  useEffect(() => {
    saveToLocalStorage("shiftpro_employees", employees);
  }, [employees]);

  useEffect(() => {
    saveToLocalStorage("shiftpro_shifts", shifts);
  }, [shifts]);

  useEffect(() => {
    saveToLocalStorage("shiftpro_schedule", schedule);
  }, [schedule]);

  useEffect(() => {
    saveToLocalStorage("shiftpro_automationHistory", automationHistory);
  }, [automationHistory]);

  useEffect(() => {
    saveToLocalStorage("shiftpro_accounting", accounting);
  }, [accounting]);

  // --- HELPER NOTIFICACIONES ---
  const showNotify = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // --- CARGA LIBRERÍAS ---
  useEffect(() => {
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    Promise.all([loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"), loadScript("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js")])
      .then(() => {
        loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.29/jspdf.plugin.autotable.min.js")
          .then(() => setLibsLoaded(true))
          .catch((e) => console.error("Error loading autotable", e));
      })
      .catch((e) => console.error("Error loading libraries", e));
  }, []);

  // --- UTILS EXCEL/PDF ---
  const exportToExcel = () => {
    if (!window.XLSX) {
      showNotify("error", "Librería Excel no cargada. Intente de nuevo.");
      return;
    }
    const wb = window.XLSX.utils.book_new();

    const wsSchedule = window.XLSX.utils.json_to_sheet(
      schedule.map((s) => ({
        Fecha: s.date,
        Empresa: companies.find((c) => c.id === s.companyId)?.name,
        Stand: s.standName,
        Empleado: s.employeeName,
        Turno: s.shiftName,
        Horas: s.hours,
        Inicio: s.start,
        Fin: s.end,
      }))
    );
    window.XLSX.utils.book_append_sheet(wb, wsSchedule, "Planificación");

    const wsAccounting = window.XLSX.utils.json_to_sheet(
      accounting.map((a) => {
        const emp = employees.find((e) => e.id === a.employeeId);
        return {
          Empleado: emp?.name,
          Tipo: a.type,
          Fecha: a.date,
          Valor: a.value,
        };
      })
    );
    window.XLSX.utils.book_append_sheet(wb, wsAccounting, "Contabilidad");

    window.XLSX.writeFile(wb, "Reporte_Retail_Master.xlsx");
    showNotify("success", "Reporte Excel exportado exitosamente.");
  };

  const generatePDFDashboard = (reportType, filterId, startDate, endDate) => {
    if (!window.jspdf) {
      showNotify("error", "Librería PDF no cargada.");
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let targetEmployees = employees;
    if (reportType === "Empresa" && filterId) targetEmployees = employees.filter((e) => e.companyId === filterId);
    else if (reportType === "Unico" && filterId) targetEmployees = employees.filter((e) => e.id === filterId);

    if (targetEmployees.length === 0) {
      showNotify("error", "No se encontraron datos para los filtros seleccionados.");
      return;
    }

    try {
      let pageCount = 0;
      const currentDate = new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });

      targetEmployees.forEach((emp) => {
        if (pageCount > 0) doc.addPage();
        pageCount++;

        const company = companies.find((c) => c.id === emp.companyId) || { name: "N/A", ruc: "" };
        const stand = stands.find((s) => s.id === emp.standId) || { name: "Sin Asignar" };

        const empSchedule = schedule.filter((s) => s.employeeId === emp.id && (!startDate || s.date >= startDate) && (!endDate || s.date <= endDate));
        const empIncidents = accounting.filter((a) => a.employeeId === emp.id && (!startDate || a.date >= startDate) && (!endDate || a.date <= endDate));

        const totalHours = empSchedule.reduce((acc, s) => acc + s.hours, 0);
        const totalLatenessMins = empIncidents.filter((i) => i.type === "lateness").reduce((acc, i) => acc + i.value, 0);
        const totalBonuses = empIncidents.filter((i) => i.type === "bonus").reduce((acc, i) => acc + i.value, 0);
        const grossSalary = totalHours * emp.hourlyRate;
        const latenessPenalty = (totalLatenessMins / 60) * emp.hourlyRate;
        const netSalary = grossSalary + totalBonuses - latenessPenalty;

        // === ENCABEZADO MEJORADO ===
        // Fondo del encabezado (slate-700)
        doc.setFillColor(51, 65, 85);
        doc.rect(0, 0, 210, 50, "F");
        
        // Línea decorativa inferior del encabezado
        doc.setFillColor(71, 85, 105);
        doc.rect(0, 50, 210, 3, "F");

        // Logo/Icono (simulado con texto)
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text("ShiftPro", 14, 20);
        
        // Información de la empresa
        doc.setFontSize(14);
        doc.setFont("helvetica", "normal");
        doc.text(company.name, 14, 30);
        doc.setFontSize(9);
        doc.text(`RUC: ${company.ruc}`, 14, 37);
        doc.text(`Stand: ${stand.name}`, 14, 43);

        // Título del reporte
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("REPORTE DE RENDIMIENTO", 196, 20, { align: "right" });
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(`Fecha de emisión: ${currentDate}`, 196, 28, { align: "right" });
        doc.text(`Período: ${startDate || "Todo"} - ${endDate || "Actual"}`, 196, 35, { align: "right" });

        // === INFORMACIÓN DEL COLABORADOR ===
        let yPos = 60;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("INFORMACIÓN DEL COLABORADOR", 14, yPos);
        
        yPos += 8;
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(14, yPos, 196, yPos);
        
        yPos += 7;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Nombre: ${emp.name}`, 14, yPos);
        doc.text(`Cargo: ${emp.role}`, 100, yPos);
        
        yPos += 6;
        doc.text(`Tarifa por hora: S/ ${parseFloat(emp.hourlyRate).toFixed(2)}`, 14, yPos);
        doc.text(`Stand asignado: ${stand.name}`, 100, yPos);

        // === TABLA DE TURNOS ===
        yPos += 10;
        const shiftsBody = empSchedule.length
          ? empSchedule.map((s) => [
              new Date(s.date).toLocaleDateString("es-ES", { day: "2-digit", month: "short" }),
              s.standName.length > 20 ? s.standName.substring(0, 20) + "..." : s.standName,
              s.shiftName,
              `${s.hours}h`,
              `${s.start} - ${s.end}`,
            ])
          : [["-", "-", "Sin turnos registrados", "-", "-"]];

        doc.autoTable({
          startY: yPos,
          head: [["Fecha", "Stand", "Turno", "Horas", "Horario"]],
          body: shiftsBody,
          theme: "striped",
          headStyles: {
            fillColor: [51, 65, 85],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 9,
          },
          bodyStyles: {
            fontSize: 8,
            textColor: [0, 0, 0],
          },
          alternateRowStyles: {
            fillColor: [249, 250, 251],
          },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 50 },
            2: { cellWidth: 45 },
            3: { cellWidth: 20 },
            4: { cellWidth: 30 },
          },
          margin: { left: 14, right: 14 },
        });

        // === TABLA DE INCIDENCIAS ===
        const incidentsBody = empIncidents.length
          ? empIncidents.map((i) => [
              new Date(i.date).toLocaleDateString("es-ES", { day: "2-digit", month: "short" }),
              i.type === "lateness" ? "Tardanza" : "Bono",
              i.type === "lateness" ? `${i.value} min` : `S/ ${i.value.toFixed(2)}`,
            ])
          : [["-", "Sin incidencias", "-"]];

        if (empIncidents.length > 0) {
          doc.autoTable({
            startY: doc.lastAutoTable.finalY + 10,
            head: [["Fecha", "Tipo", "Valor"]],
            body: incidentsBody,
            theme: "striped",
            headStyles: {
              fillColor: [71, 85, 105],
              textColor: [255, 255, 255],
              fontStyle: "bold",
              fontSize: 9,
            },
            bodyStyles: {
              fontSize: 8,
              textColor: [0, 0, 0],
            },
            alternateRowStyles: {
              fillColor: [249, 250, 251],
            },
            columnStyles: {
              0: { cellWidth: 40 },
              1: { cellWidth: 50 },
              2: { cellWidth: 40 },
            },
            margin: { left: 14, right: 14 },
          });
        }

        // === RESUMEN FINANCIERO ===
        const finalY = empIncidents.length > 0 ? doc.lastAutoTable.finalY + 15 : doc.lastAutoTable.finalY + 15;
        
        // Fondo del resumen
        doc.setFillColor(249, 250, 251);
        doc.rect(14, finalY - 5, 182, 35, "F");
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.rect(14, finalY - 5, 182, 35);

        // Título del resumen
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("RESUMEN FINANCIERO", 20, finalY + 3);

        // Línea divisoria
        doc.setDrawColor(200, 200, 200);
        doc.line(20, finalY + 6, 190, finalY + 6);

        // Detalles del resumen
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        let summaryY = finalY + 12;
        
        doc.text(`Total de horas trabajadas:`, 20, summaryY);
        doc.setFont("helvetica", "bold");
        doc.text(`${totalHours} horas`, 140, summaryY, { align: "right" });
        
        summaryY += 6;
        doc.setFont("helvetica", "normal");
        doc.text(`Sueldo bruto (${totalHours}h × S/ ${parseFloat(emp.hourlyRate).toFixed(2)}/h):`, 20, summaryY);
        doc.setFont("helvetica", "bold");
        doc.text(`S/ ${grossSalary.toFixed(2)}`, 140, summaryY, { align: "right" });

        if (totalBonuses > 0) {
          summaryY += 6;
          doc.setFont("helvetica", "normal");
          doc.setTextColor(16, 185, 129);
          doc.text(`Bonos y beneficios:`, 20, summaryY);
          doc.setFont("helvetica", "bold");
          doc.text(`+ S/ ${totalBonuses.toFixed(2)}`, 140, summaryY, { align: "right" });
        }

        if (latenessPenalty > 0) {
          summaryY += 6;
          doc.setFont("helvetica", "normal");
          doc.setTextColor(239, 68, 68);
          doc.text(`Descuento por tardanzas (${totalLatenessMins} min):`, 20, summaryY);
          doc.setFont("helvetica", "bold");
          doc.text(`- S/ ${latenessPenalty.toFixed(2)}`, 140, summaryY, { align: "right" });
        }

        // === TOTAL NETO ===
        summaryY += 10;
        doc.setDrawColor(51, 65, 85);
        doc.setLineWidth(1);
        doc.line(20, summaryY, 190, summaryY);
        
        summaryY += 8;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(51, 65, 85);
        doc.text("TOTAL NETO A PAGAR:", 20, summaryY);
        doc.setFontSize(16);
        doc.setTextColor(16, 185, 129);
        doc.text(`S/ ${netSalary.toFixed(2)}`, 140, summaryY, { align: "right" });

        // === PIE DE PÁGINA ===
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.setFont("helvetica", "italic");
        doc.text(`ShiftPro - Sistema de Gestión de Turnos | Página ${pageCount}`, 105, pageHeight - 10, { align: "center" });
        doc.text(`Generado el ${currentDate}`, 105, pageHeight - 5, { align: "center" });
      });

      doc.save(`Reporte_${reportType}_${new Date().toISOString().split("T")[0]}.pdf`);
      showNotify("success", "PDF generado correctamente.");
    } catch (error) {
      console.error(error);
      showNotify("error", "Error al generar PDF.");
    }
  };

  // --- NAVEGACIÓN ---
  const NavItem = ({ id, label, icon: Icon }) => {
    const isActive = view === id;
    return (
      <motion.button
        onClick={() => setView(id)}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all rounded-xl mb-2 relative overflow-hidden group ${
          isActive
            ? "bg-slate-700 text-white shadow-lg shadow-slate-900/20"
            : "text-gray-600 hover:bg-slate-50"
        }`}
      >
        {isActive && (
          <motion.div
            layoutId="activeNav"
            className="absolute inset-0 bg-slate-700 rounded-xl"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <Icon size={20} className={`relative z-10 ${isActive ? "text-white" : "text-gray-400 group-hover:text-slate-700"}`} />
        <span className={`relative z-10 ${isActive ? "text-white" : "group-hover:text-slate-700"}`}>{label}</span>
        {isActive && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute right-3 w-2 h-2 bg-white rounded-full"
          />
        )}
      </motion.button>
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-slate-50/50 to-gray-100 font-sans text-gray-800 overflow-hidden">
      {/* Notificación Flotante */}
      <AnimatePresence>{notification && <Toast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}</AnimatePresence>

      <aside className="w-72 bg-white/80 backdrop-blur-xl border-r border-white/20 flex flex-col z-20 shadow-2xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 border-b border-gray-100/50"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="p-2 bg-slate-700 rounded-xl shadow-lg">
              <Store className="text-white" size={24} />
            </div>
            <h1 className="font-extrabold text-2xl text-slate-800">
              ShiftPro
          </h1>
        </div>
          <p className="text-center text-xs text-gray-500 mt-2 font-medium">Gestión Inteligente de Turnos</p>
        </motion.div>
        <nav className="flex-1 p-4 overflow-y-auto space-y-1">
          <NavItem id="dashboard" label="Dashboard" icon={PieChart} />
          <NavItem id="weekly" label="Cronograma Semanal" icon={LayoutGrid} />
          <NavItem id="automation" label="Automatización" icon={Settings} />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="px-4 text-xs font-bold text-gray-400 uppercase mb-3 mt-8 tracking-wider"
          >
            Gestión
          </motion.p>
          <NavItem id="companies" label="Empresas" icon={Building2} />
          <NavItem id="stands" label="Stands" icon={MapPin} />
          <NavItem id="employees" label="Colaboradores" icon={Users} />
          <NavItem id="shifts" label="Turnos" icon={Clock} />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="px-4 text-xs font-bold text-gray-400 uppercase mb-3 mt-8 tracking-wider"
          >
            Finanzas
          </motion.p>
          <NavItem id="accounting" label="Contabilidad" icon={DollarSign} />
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 md:p-10 relative">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              {view === "weekly"
                ? "Cronograma de Turnos"
                : view === "accounting"
                ? "Contabilidad & Nómina"
                : "Panel de Control"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {view === "weekly"
                ? "Vista semanal de todos los turnos programados"
                : view === "accounting"
                ? "Gestión de nómina y contabilidad"
                : "Resumen general del sistema"}
            </p>
          </div>
          {view === "weekly" && (
            <Button onClick={exportToExcel} variant="success" icon={FileSpreadsheet} disabled={!libsLoaded}>
              Exportar Excel
            </Button>
          )}
        </motion.header>

        <AnimatePresence mode="wait">
          <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
            {view === "dashboard" && <DashboardView employees={employees} stands={stands} schedule={schedule} />}
            {view === "weekly" && <WeeklyScheduleView schedule={schedule} stands={stands} />}
            {view === "companies" && (
              <CrudView
                title="Empresa"
                items={companies}
                onAdd={(i) => setCompanies([...companies, i])}
                onDelete={(id) => setCompanies(companies.filter((c) => c.id !== id))}
                showNotify={showNotify}
                fields={[
                  { key: "name", label: "Razón Social" },
                  { key: "ruc", label: "RUC" },
                ]}
              />
            )}
            {view === "stands" && (
              <CrudView
                title="Stand"
                items={stands}
                onAdd={(i) => setStands([...stands, i])}
                onDelete={(id) => setStands(stands.filter((s) => s.id !== id))}
                showNotify={showNotify}
                fields={[
                  { key: "name", label: "Nombre" },
                  { key: "companyId", label: "Empresa", type: "select", options: companies.map((c) => ({ value: c.id, label: c.name })) },
                ]}
              />
            )}
            {view === "employees" && <EmployeesView employees={employees} stands={stands} companies={companies} setEmployees={setEmployees} showNotify={showNotify} />}
            {view === "shifts" && (
              <CrudView
                title="Turno"
                items={shifts}
                onAdd={(i) => setShifts([...shifts, i])}
                onDelete={(id) => setShifts(shifts.filter((s) => s.id !== id))}
                showNotify={showNotify}
                fields={[
                  { key: "name", label: "Nombre" },
                  { key: "start", label: "Inicio" },
                  { key: "end", label: "Fin" },
                  { key: "hours", label: "Horas", type: "number" },
                ]}
              />
            )}
            {view === "automation" && (
              <AutomationView
                employees={employees}
                shifts={shifts}
                stands={stands}
                schedule={schedule}
                setSchedule={setSchedule}
                automationHistory={automationHistory}
                setAutomationHistory={setAutomationHistory}
                loading={loading}
                setLoading={setLoading}
                showNotify={showNotify}
              />
            )}
            {view === "accounting" && (
              <AccountingView
                employees={employees}
                stands={stands}
                companies={companies}
                schedule={schedule}
                accounting={accounting}
                setAccounting={setAccounting}
                showNotify={showNotify}
                generatePDFDashboard={generatePDFDashboard}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
