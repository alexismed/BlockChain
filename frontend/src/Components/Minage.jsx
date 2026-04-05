import React from "react";
import { motion } from "framer-motion";
import { Cpu, CheckSquare, Square, Database } from "lucide-react";
import { apiAffiche } from "../api";

// We "destructure" the props here: isMining and toggleFunction 
// come from App.jsx
const Minage = ({ selectedTxs, onToggleSelection }) => {
  const [difficulty, setDifficulty] = React.useState(3);
  const [isMining, setisMining] = React.useState(false);

  const handleToggleMining = async () => {
    const txIDS = selectedTxs.map(tx => tx.TxID);
    console.log(txIDS);  
    try {
        const res = await apiAffiche.toggleMining(txIDS, difficulty);
        setisMining(!isMining);
      } catch (err) {
        afficherNotification("Erreur lors de l'action de minage");
        console.error(err);
      }
    };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-8 w-full max-w-4xl"
    >
      {/* 1. Header Section */}
      <div className="text-center">
        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-2">
          Minage de Blocks
        </h2>
        <p className="text-slate-500 text-sm font-medium">
          Selectionner des transactions pour créer un block
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
                Difficulté du block
              </label>
              <span className="text-4xl font-black text-slate-800 leading-none">
                {difficulty}
              </span>
            </div>
            
            <input
              type="range"
              min="3"
              max="10"
              step="1"
              value={difficulty}
              onChange={(e) => setDifficulty(parseInt(e.target.value))}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-500 hover:accent-teal-600 transition-all"
            />
            
            <div className="flex justify-between text-[10px] font-bold text-slate-300 px-1">
              <span>MIN (3)</span>
              <span>MAX (10)</span>
            </div>
          </div>
          
          <button
            onClick={handleToggleMining} 
            className="w-full group relative flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-white uppercase tracking-widest transition-all shadow-xl active:scale-95 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-teal-600 hover:to-emerald-600"
          >
            
            Miner
          </button>
          
        </div>
      </div>
      {/* Selected Transactions List */}
      
        <div className="w-full bg-white/40 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-8 shadow-xl mt-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-teal-500 p-2 rounded-xl text-white">
                <Database size={18} />
            </div>
            <h3 className="font-black text-slate-800 uppercase tracking-tighter">
                Transactions à miner ({selectedTxs.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedTxs.map((tx, idx) => (
              <div key={idx} className="bg-white/60 p-4 rounded-2xl border border-white flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3 overflow-hidden">
                  <button 
                    onClick={() => onToggleSelection(tx)}
                    className="p-1.5 rounded-lg bg-teal-100 text-teal-600"
                  >
                    <CheckSquare size={16} />
                  </button>
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Destinataire</p>
                    <p className="text-[11px] font-mono text-slate-700 truncate">
                        {tx.destinataire || tx.Destinataire}
                    </p>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-black text-slate-800">
                    {(tx.quantite || tx.Quantite || 0).toFixed(4)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      
    </motion.div>
  );
};

export default Minage;