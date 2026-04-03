import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileJson, Copy, Download, Search, Braces } from "lucide-react";

const Donnees = ({ data, title = "System Raw Data", afficherNotification }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    if (afficherNotification) afficherNotification("JSON copied to clipboard!");
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, "_")}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="w-full max-w-5xl mx-auto p-4 flex flex-col gap-6"
    >
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="bg-slate-800 p-3 rounded-2xl text-teal-400 shadow-lg">
            <Braces size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">{title}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Live JSON
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
          >
            <Copy size={14} /> Copy
          </button>
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl text-xs font-bold text-white hover:bg-slate-700 transition-all shadow-lg active:scale-95"
          >
            <Download size={14} /> Export .json
          </button>
        </div>
      </div>

      {/* Code Viewer Container */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
        
        <div className="relative bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl overflow-hidden">
          {/* Editor Header Bar */}
          <div className="bg-slate-800/50 px-6 py-3 border-b border-slate-700/50 flex items-center justify-between">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/40"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40"></div>
            </div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">blockchain/json</span>
          </div>

          {/* Scrollable Code Area */}
          <div className="p-8 max-h-[600px] overflow-auto custom-scrollbar-dark font-mono text-sm">
            <pre className="text-teal-400 leading-relaxed">
              {/* This renders the JSON with basic "pseudo-highlighting" via strings */}
              {jsonString}
            </pre>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center px-10">
        <p className="text-[10px] text-slate-400 font-medium">
          This data is retrieved directly from the blockchain node.
          Alterations here are for inspection only and do not affect the consensus state.
        </p>
      </div>
    </motion.div>
  );
};

export default Donnees;