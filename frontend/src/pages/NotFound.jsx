import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPinOff, ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden font-sans">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Icon & 404 Text */}
        <div className="relative mb-6">
          <motion.h1 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="text-[120px] sm:text-[180px] font-black text-transparent bg-clip-text bg-gradient-to-br from-stone-100 to-stone-600 leading-none select-none drop-shadow-2xl"
          >
            404
          </motion.h1>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-accent-500 bg-stone-950 p-4 rounded-full shadow-2xl border border-stone-800">
            <MapPinOff size={48} strokeWidth={1.5} />
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          Oops! You seem to be lost.
        </h2>
        <p className="text-stone-400 max-w-md mx-auto mb-10 text-lg">
          The destination you are looking for doesn't exist, has been moved, or is currently unavailable.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-white font-semibold transition-all hover:-translate-y-1 border border-stone-700 hover:border-stone-600"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
          
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-accent-500 hover:bg-accent-600 text-white font-bold transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(245,158,11,0.3)]"
          >
            <Home size={20} />
            Return Home
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
