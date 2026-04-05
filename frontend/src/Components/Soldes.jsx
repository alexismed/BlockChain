import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History,
  Zap,
  Calendar,
  TrendingUp,
  Activity
} from "lucide-react";
import { apiAffiche } from "../api";

const Soldes = ({ afficherNotification }) => {
  const [addressSearch, setAddressSearch] = useState("");
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // --- CALCULATION LOGIC ---
  const calculateBalance = () => {
    let acc = Number(0);
    results.slice().reverse().forEach(tx => {
      const amount = Number(tx.amount) || 0;
      acc = tx.isCoinbase ? acc + amount : tx.isOutgoing ? acc - amount : acc + amount;
      tx.partialSum = acc;
    });
    
    return acc;
  };

  const finalBalance = calculateBalance();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!addressSearch.trim()) return;
    
    const [resTransList, resCBList] = await Promise.all([
        apiAffiche.getTransactions(addressSearch),
        apiAffiche.getCoinBaseTransactions(addressSearch)
    ]);
    const currentTransactions = resTransList.data || [];
    const currentCoinbase = resCBList.data || [];

    

    const transactionMatches = currentTransactions.map(tx => {
        const sender = tx.expediteur || tx.Expediteur;
        const isOutgoing = sender?.toLowerCase() === addressSearch.toLowerCase();
        return {
            ...tx,
            amount: isOutgoing ? (tx.Quantite + tx.Frais) : tx.Quantite,
            blockIndex: Number(tx.BlockIndex),
            isCoinbase: false,
            isOutgoing: isOutgoing,
            partialSum: Number(0)
        };
    });
    
    

    const coinbasePromises = currentCoinbase.map(async (blockIndex) => {
      const resFrais = await apiAffiche.getFraisBlock(blockIndex);
      return {
        amount: Number(resFrais.data || 0) + 50, // Reward + Fees
        blockIndex: Number(blockIndex),
        isCoinbase: true,
        isOutgoing: false,
        partialSum: Number(0)
      };
    });
    const coinbaseMatches = await Promise.all(coinbasePromises);

    const allMatches = [...transactionMatches, ...coinbaseMatches];
    
    const sorted = allMatches.sort((a, b) => {
      return Number(b.blockIndex) - Number(a.blockIndex); // Newest first
    });
    setResults(sorted);
    setHasSearched(true);

    if (allMatches.length === 0) afficherNotification("No history found.");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-4xl mx-auto p-4 flex flex-col gap-6">
      
      {/* SEARCH BAR */}
      <section className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-8 shadow-2xl">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Saisir l'adresse (0x...)"
              value={addressSearch}
              onChange={(e) => setAddressSearch(e.target.value)}
              className="w-full bg-white/60 border border-white/80 rounded-2xl py-4 pl-12 pr-4 text-slate-800 font-mono text-xs focus:ring-2 ring-teal-400 outline-none transition-all"
            />
          </div>
          <button className="bg-slate-800 text-white font-black px-8 rounded-2xl shadow-xl hover:bg-slate-900 transition-all">
            Rechercher
          </button>
        </form>
      </section>

      {hasSearched && (
        <>
          {/* --- NEW SUMMARY DASHBOARD --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-br from-teal-500 to-emerald-600 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden"
            >
              <TrendingUp className="absolute right-[-10px] bottom-[-10px] size-32 opacity-10 rotate-12" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-80">Solde final</p>
              <h2 className="text-4xl font-black tracking-tighter">
                {finalBalance.toFixed(4)} <span className="text-teal-200 text-xl">BTC</span>
              </h2>
            </motion.div>

            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-md border border-white p-8 rounded-[2.5rem] shadow-xl flex items-center justify-between"
            >
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Activité totale</p>
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter">
                  {results.length} <span className="text-slate-300 text-xl font-medium uppercase italic">Events</span>
                </h2>
              </div>
              <div className="bg-slate-100 p-4 rounded-3xl text-teal-600">
                <Activity size={32} />
              </div>
            </motion.div>
          </div>

          {/* HISTORY SECTION */}
          <div className="space-y-4 mt-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-4 flex items-center gap-2">
              <History size={14}/> Historique du compte
            </h3>

            <div className="grid grid-cols-1 gap-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {results.map((tx, i) => {
                  const sender = tx.expediteur || tx.Expediteur;
                  const isOutgoing = !tx.isCoinbase && sender?.toLowerCase() === addressSearch.toLowerCase();
                  
                  return (
                    <motion.div
                      key={`${tx.blockIndex}-${i}`}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-5 rounded-[1.5rem] border transition-all relative overflow-hidden ${
                        tx.isCoinbase ? 'bg-indigo-950 border-indigo-500/30' : 'bg-slate-900 border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-center relative z-10">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${tx.isCoinbase ? 'bg-indigo-500/20 text-indigo-300' : isOutgoing ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            {tx.isCoinbase ? <Zap size={18} /> : isOutgoing ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider leading-none mb-1">
                                {tx.isCoinbase ? "Récompense Minage" : isOutgoing ? "Paiement Envoyé" : "Paiement Reçu"}
                            </span>
                            <span className="text-[9px] font-bold text-slate-600 uppercase flex items-center gap-1">
                                <Calendar size={10} /> Block #{tx.blockIndex}
                            </span>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            {/* The Transaction Amount (Change) */}
                            <span className={`text-lg font-black leading-none ${tx.isCoinbase ? 'text-indigo-200' : isOutgoing ? 'text-red-400' : 'text-emerald-400'}`}>
                                {isOutgoing ? "-" : "+"}{Number(tx.amount).toFixed(4)} BTC
                            </span>
                            
                            {/* The New Running Balance (Total at that time) */}
                            <div className="mt-1 flex items-center gap-1.5 opacity-60">
                                <span className="text-[8px] font-black uppercase text-slate-500 tracking-tighter">Solde:</span>
                                <span className="text-[11px] font-mono font-bold text-slate-400">
                                {tx.partialSum.toFixed(4)} <span className="text-[9px]">BTC</span>
                                </span>
                            </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default Soldes;