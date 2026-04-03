import React from "react";
import { motion } from "framer-motion";
import { Cpu, Activity, Zap, ShieldAlert } from "lucide-react";

// We "destructure" the props here: isMining and toggleFunction 
// come from App.jsx
const Minage = ({ isMining, onToggle }) => {
  const [difficulty, setDifficulty] = React.useState(1);
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-8 w-full max-w-4xl"
    >
      {/* 1. Header Section */}
      <div className="text-center">
        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-2">
          Network Consensus
        </h2>
        <p className="text-slate-500 text-sm font-medium">
          Manage local node mining and block validation parameters.
        </p>
      </div>

      {/* 2. The Main Control Card (Glassmorphism) */}
      <div className="w-full bg-white/40 backdrop-blur-xl border border-white/50 rounded-[3rem] p-12 shadow-2xl flex flex-col items-center">
        
        {/* Animated Visual Indicator */}
        <div className={`relative mb-10 p-8 rounded-full transition-all duration-700 ${
          isMining ? "bg-orange-500/10" : "bg-teal-500/10"
        }`}>
          <div className={`absolute inset-0 rounded-full blur-2xl animate-pulse ${
            isMining ? "bg-orange-400/20" : "bg-teal-400/20"
          }`}></div>
          <Cpu 
            size={80} 
            className={`relative z-10 transition-colors duration-500 ${
              isMining ? "text-orange-500 animate-spin-slow" : "text-teal-500"
            }`} 
          />
        </div>

        {/* Replace the Toggle Button with this Slider & Button Group */}
        <div className="flex flex-col items-center gap-6 w-full max-w-sm">
          <div className="w-full space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Target Difficulty
              </label>
              <span className="text-4xl font-black text-slate-800 leading-none">
                {difficulty}
              </span>
            </div>
            
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={difficulty}
              onChange={(e) => setDifficulty(parseInt(e.target.value))}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-500 hover:accent-teal-600 transition-all"
            />
            
            <div className="flex justify-between text-[10px] font-bold text-slate-300 px-1">
              <span>MIN (1)</span>
              <span>MAX (10)</span>
            </div>
          </div>
          
          <button 
            className="w-full group relative flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-white uppercase tracking-widest transition-all shadow-xl active:scale-95 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-teal-600 hover:to-emerald-600"
          >
            
            Changer la difficulté
          </button>
          
        </div>
      </div>
    </motion.div>
  );
};

export default Minage;