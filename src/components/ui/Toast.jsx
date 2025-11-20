import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, X } from "lucide-react";

export default function Toast({ message, type, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9, x: 100 }}
      animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.9, x: 100 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className={`fixed top-6 right-6 z-50 px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[320px] backdrop-blur-md border-2
        ${type === "success" 
          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400/50" 
          : "bg-gradient-to-r from-red-500 to-rose-500 text-white border-red-400/50"}`}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
      >
        {type === "success" ? (
          <CheckCircle size={24} className="text-emerald-100" />
        ) : (
          <AlertCircle size={24} className="text-red-100" />
        )}
      </motion.div>
      <span className="font-semibold text-sm flex-1">{message}</span>
      <motion.button
        onClick={onClose}
        whileHover={{ scale: 1.2, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        className="opacity-80 hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-white/20"
      >
        <X size={18} />
      </motion.button>
    </motion.div>
  );
}

