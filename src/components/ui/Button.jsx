import { motion } from "framer-motion";

export default function Button({ children, onClick, variant = "primary", icon: Icon, className = "", disabled = false, type = "button" }) {
  const baseStyle = "px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group";
  const variants = {
    primary: "bg-slate-700 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 hover:scale-105 active:scale-95",
    secondary: "bg-white/90 backdrop-blur-sm text-gray-700 border-2 border-gray-300 hover:border-slate-400 hover:bg-slate-50 shadow-md hover:shadow-lg",
    danger: "bg-red-50 text-red-700 hover:bg-red-100 border-2 border-red-200 hover:border-red-300 shadow-md hover:shadow-lg",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-900/20 hover:shadow-xl hover:shadow-emerald-900/30 hover:scale-105 active:scale-95",
  };
  
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
      {Icon && <Icon size={18} className="relative z-10" />}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

