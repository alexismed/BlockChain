import React from "react";
import { motion } from "framer-motion";
import { Cpu, Activity, Zap, ShieldAlert } from "lucide-react";

// We "destructure" the props here: isMining and toggleFunction 
// come from App.jsx
const Mining = ({ isMining, onToggle }) => {
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

        {/* The Toggle Button (Using the Choice B style we discussed) */}
        <button 
          onClick={onToggle}
          className={`group relative px-12 py-5 rounded-2xl font-black text-white uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
            isMining ? "bg-gradient-to-r from-orange-500 to-red-600" : "bg-gradient-to-r from-teal-500 to-emerald-600"
          }`}
        >
          {isMining ? "Stop Mining Process" : "Start Mining Process"}
        </button>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-6 w-full mt-12">
          <StatCard icon={<Zap size={18}/>} label="Hashrate" value={isMining ? "14.2 MH/s" : "0.0 MH/s"} />
          <StatCard icon={<Activity size={18}/>} label="Efficiency" value={isMining ? "98%" : "N/A"} />
          <StatCard icon={<ShieldAlert size={18}/>} label="Node Temp" value={isMining ? "42°C" : "24°C"} />
        </div>
      </div>
    </motion.div>
  );
};

// Internal sub-component for the little stat boxes
const StatCard = ({ icon, label, value }) => (
  <div className="bg-white/60 p-5 rounded-3xl border border-white/40 flex flex-col items-center gap-2">
    <div className="text-teal-500">{icon}</div>
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    <span className="text-lg font-black text-slate-700">{value}</span>
  </div>
);

export default Mining;