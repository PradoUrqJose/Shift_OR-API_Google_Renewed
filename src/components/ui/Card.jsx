import { motion } from "framer-motion";

export default function Card({ children, className = "", hover = false, delay = 0 }) {
  const baseClasses = "bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 transition-all duration-300";
  const hoverClasses = hover ? "hover:shadow-2xl hover:scale-[1.02] hover:border-indigo-200/50" : "";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`${baseClasses} ${hoverClasses} ${className}`}
    >
      {children}
    </motion.div>
  );
}

