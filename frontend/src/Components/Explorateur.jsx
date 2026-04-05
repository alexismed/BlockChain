import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronsLeft,
  ChevronRight,
  ChevronsRight,
  Database,
  Cpu,
  Search,
  X,
  Coins,
  Shield,
  Clock,
  Wallet,
  Send,
  Lock,
  LogOut,
  PlusCircle,
  Trash2, 
  Copy
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiAffiche } from "../api";

const blockVariants = {
  center: { x: 0, scale: 1, opacity: 1, zIndex: 10, filter: "blur(0px)" },
  left: { x: -280, scale: 0.8, opacity: 0.3, zIndex: 5, filter: "blur(1px)" },
  right: { x: 280, scale: 0.8, opacity: 0.3, zIndex: 5, filter: "blur(1px)" },
  hiddenLeft: { x: -400, scale: 0.5, opacity: 0, zIndex: 0 },
  hiddenRight: { x: 400, scale: 0.5, opacity: 0, zIndex: 0 },
};

const Explorateur = () => {
  const [blocks, setBlocks] = useState([]);
  const [mempool, setMempool] = useState([]); // ÉTAT POUR LE MEMPOOL
  const [currentIndex, setCurrentIndex] = useState(0);
  const [simActive, setSimActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBlock, setSelectedBlock] = useState(null);

  const [token, setToken] = useState(null);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("azerty");
  const [destinataire, setDestinataire] = useState("");
  const [montant, setMontant] = useState("");
  const [notification, setNotification] = useState("");

  const [solde, setSolde] = useState(0);
  const adresseTest = "bc1q9x3j7zwyt4d5g8p2m6vhkq9x3j7z";

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Récupération de la Blockchain
        const resBlocks = await apiAffiche.getBlockChain();
        const javaBlocks = resBlocks.data;

        if (javaBlocks && javaBlocks.length > 0) {
            const formattedBlocks = javaBlocks.map((javaBlock, index) => {
            const header = javaBlock.blockHeader || javaBlock.BlockHeader;
            const body = javaBlock.blockBody || javaBlock.BlockBody;
            const txList = body?.transactionList || body?.TransactionList || [];

            return {
              index: index,
              hash: javaBlock.HashBlock || javaBlock.hashBlock,
              prevHash: header?.hashPre || header?.HashPre || "0000000000000000",
              merkleRoot: header?.merkleRoot || header?.MerkleRoot,
              timestamp: header?.timeStamp || header?.TimeStamp,
              nonce: header?.nonce || header?.Nonce,
              transactions: txList,
              coinbase: body?.coinBaseTrans || body?.CoinBaseTrans,
            };
          });

          setBlocks(formattedBlocks);
        }

        // 2. Récupération du Mempool en direct
        const resMempool = await apiAffiche.getMempool();
        if (resMempool.data) {
          setMempool(resMempool.data);
        }

      } catch (error) {
        console.error("Erreur Backend", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Rafraîchissement toutes les 5 secondes
    return () => clearInterval(interval);
  }, []);

  const handleSendTransaction = async (e) => {
    e.preventDefault();
    if (!destinataire || !montant) return;

    const montantNum = parseFloat(montant);

    if (montantNum > solde) {
      afficherNotification("Fonds insuffisants ! ");
      return;
    }

    try {
      const res = await apiAffiche.creerTransaction(token, destinataire, montantNum);
      afficherNotification(res.data);
      setSolde(solde - montantNum);
      setDestinataire("");
      setMontant("");

      // On rafraîchit manuellement le mempool juste après l'envoi pour que ça soit instantané
      const resMempool = await apiAffiche.getMempool();
      setMempool(resMempool.data);

    } catch (err) {
      afficherNotification("Erreur de transaction ");
    }
  };

  const afficherNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 4000);
  };

  const moveFirst = () => setCurrentIndex(0);
  const moveNext = () => currentIndex < blocks.length - 1 && setCurrentIndex(currentIndex + 1);
  const movePrev = () => currentIndex > 0 && setCurrentIndex(currentIndex - 1);
  const moveLast = () => setCurrentIndex(blocks.length - 1);

  const handleSearch = (e) => {
    e.preventDefault();
    const term = searchTerm.trim();
    if (!term) return;
    const foundIndex = blocks.findIndex((b) => b.index.toString() === term);

    if (foundIndex !== -1) {
      setCurrentIndex(foundIndex);
      setSearchTerm("");
    } else {
      alert("Bloc introuvable !");
    }
  };

  const getBlockPosition = (index) => {
    if (index === currentIndex) return "center";
    if (index === currentIndex - 1) return "left";
    if (index === currentIndex + 1) return "right";
    return index < currentIndex ? "hiddenLeft" : "hiddenRight";
  };

  const handleToggleSimulation = async () => {
    try {
      const res = await apiAffiche.toggleSimulation();
      setSimActive(res.data);
    } catch (err) {
      afficherNotification("Erreur lors de l'action de minage");
      console.error(err);
    }
  };

  const handleClearBlockchain = async () => { 
  if (window.confirm("Vous etes sûr de vouloir supprimer TOUTE la Blockchain? Cette action est irreversible.")) {
    try {
      await apiAffiche.clearBlockchain();
      setBlocks([]); // Clear the local state immediately for better UX
      setCurrentIndex(0);
      setSimActive(false);
      afficherNotification("Blockchain cleared successfully");
    } catch (err) {
      afficherNotification("Error clearing blockchain");
      console.error(err);
    }
  }
};

  return (
        <div>
          <div className="z-20 text-center mb-6 w-full">
            
            {/* --- BUTTONS SECTION --- */}
            <div className="z-20 text-center mb-12 w-full flex flex-col items-center gap-6">
              
              {/* Container for horizontal alignment */}
              <div className="flex items-center justify-center gap-4 w-full">
                
                {/* 1. START/STOP SIMULATION BUTTON */}
                <div 
                  role="button"
                  onClick={handleToggleSimulation}
                  className="group relative cursor-pointer transition-all duration-300 active:scale-95 flex-1 max-w-xs"
                >
                  <div className={`absolute -inset-1 rounded-[2rem] blur opacity-25 group-hover:opacity-60 transition duration-500 ${
                    simActive ? "bg-gradient-to-r from-orange-400 to-red-500" : "bg-gradient-to-r from-teal-400 to-emerald-500"
                  }`}></div>
                  
                  <div className={`relative flex items-center justify-center gap-4 px-6 py-4 rounded-[2rem] shadow-2xl border border-white/20 transition-colors duration-500 ${
                    simActive ? "bg-gradient-to-r from-orange-500 to-red-600" : "bg-gradient-to-r from-teal-500 to-emerald-600"
                  }`}>
                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md shadow-inner">
                      <Cpu className={`text-white ${simActive ? "animate-spin" : "animate-pulse"}`} size={24} />
                    </div>
                    <span className="text-sm font-black text-white tracking-tight uppercase">
                      {simActive ? "Desactiver Simulation" : "Activer Simulation"}
                    </span>
                  </div>
                </div>

                {/* 2. DELETE BLOCKCHAIN BUTTON */}
                <div 
                  role="button"
                  onClick={handleClearBlockchain}
                  className="group relative cursor-pointer transition-all duration-300 active:scale-95 flex-1 max-w-xs"
                >
                  <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-rose-400 to-red-600 blur opacity-10 group-hover:opacity-40 transition duration-500"></div>
                  
                  <div className="relative flex items-center justify-center gap-4 px-6 py-4 rounded-[2rem] bg-white border border-rose-100 shadow-xl group-hover:border-rose-300 transition-colors">
                    <div className="bg-rose-500 p-2 rounded-xl text-white shadow-lg shadow-rose-200">
                      <Trash2 size={24} />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-black text-slate-800 tracking-tight uppercase">Supprimer Chaine</span>
                      <span className="text-[9px] font-bold text-rose-500 uppercase leading-none">Supprimer toute la chaine</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* --- HEADER SECTION --- */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-center gap-2">
                  <Database className="text-teal-500" size={28} />
                  <h1 className="text-3xl font-black tracking-tighter text-slate-800 uppercase">
                    BlockChain Explorateur
                  </h1>
                </div>
                <div className="w-24 h-1 bg-gradient-to-r from-teal-500 to-transparent rounded-full"></div>
              </div>
            </div>

            <form onSubmit={handleSearch} className="flex bg-white/90 p-1 rounded-2xl shadow-xl w-72 border border-teal-100 mx-auto mb-4">
              <input
                type="text"
                placeholder="Block Index..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent px-4 py-2 text-xs outline-none flex-1"
              />
              <button className="bg-teal-500 text-white p-2 rounded-xl">
                <Search size={16} />
              </button>
            </form>

            <div className="text-slate-500 text-[10px] flex items-center justify-center gap-2 animate-pulse">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Réception des blocs...
            </div>
          </div>

          <div className="relative w-full h-[400px] flex items-center justify-center">
            {blocks.length === 0 ? (
                <div className="text-slate-500 font-mono text-sm animate-pulse">Chargement de la blockchain...</div>
            ) : (
              <AnimatePresence mode="popLayout" initial={false}>
                {blocks.map((block, i) => {
                  const pos = getBlockPosition(i);
                  if (pos.includes("hidden") && Math.abs(i - currentIndex) > 1) return null;

                  return (
                    <motion.div
                      key={block.index}
                      variants={blockVariants}
                      animate={pos}
                      initial={pos.includes("Left") ? "hiddenLeft" : "hiddenRight"}
                      exit={pos.includes("Left") ? "hiddenLeft" : "hiddenRight"}
                      transition={{ type: "spring", stiffness: 200, damping: 25 }}
                      onClick={() => pos === "center" && setSelectedBlock(block)}
                      className={`absolute w-72 h-80 rounded-[3rem] p-8 shadow-2xl flex flex-col justify-between border-2 transition-all cursor-pointer 
                      ${
                        i === blocks.length - 1
                          ? "bg-teal-200 border-teal-200 scale-100"
                          : pos === "center"
                            ? "bg-white border-teal-200 scale-100"
                            : "bg-white/40 border-white/20 opacity-50 scale-90"
                      }
                      `}
                    >
                      <div className="flex justify-between items-start">
                        <div className="bg-teal-500 text-white px-4 py-1 rounded-full text-[20px] font-black">
                          {
                            i === 0 ? "Genesis" : "Block #" + block.index
                          }
                        </div>
                        <Database className="text-teal-200" size={32} />
                      </div>

                      <div>
                        <div className="text-[15px] uppercase font-black text-slate-400 tracking-widest mb-1">Hash Block</div>
                        <div className="font-mono text-[12px] break-all text-slate-600 leading-relaxed bg-slate-50 p-2 rounded-xl">
                            {(block.hash).substring(0, 10)}...{(block.hash).substring(60)}
                        </div>
                      </div>
                      
                      <div className="text-[15px] uppercase font-black text-slate-400 tracking-widest mb-1">
                        Transactions: {block.transactions.length}
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-bold text-slate-400 uppercase">Status</span>
                            <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                              <Shield size={10} /> Validated
                            </span>
                        </div>
                        <ChevronRight className="text-teal-500" />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          <div className="flex justify-center gap-6 mt-16 pb-12 w-full">
            <button
                onClick={moveFirst}
                disabled={currentIndex === 0 || blocks.length === 0}
                className="p-4 bg-white hover:bg-teal-50 disabled:opacity-5 text-teal-600 rounded-2xl shadow-lg border border-teal-100 transition-all active:scale-90"
            >
              <ChevronsLeft size={24} />
            </button>
            <button
                onClick={movePrev}
                disabled={currentIndex === 0 || blocks.length === 0}
                className="p-4 bg-white hover:bg-teal-50 disabled:opacity-5 text-teal-600 rounded-2xl shadow-lg border border-teal-100 transition-all active:scale-90"
            >
              <ChevronLeft size={24} />
            </button>
            <button
                onClick={moveNext}
                disabled={currentIndex === blocks.length - 1 || blocks.length === 0}
                className="p-4 bg-white hover:bg-teal-50 disabled:opacity-5 text-teal-600 rounded-2xl shadow-lg border border-teal-100 transition-all active:scale-90"
            >
              <ChevronRight size={24} />
            </button>
            <button
                onClick={moveLast}
                disabled={currentIndex === blocks.length - 1 || blocks.length === 0}
                className="p-4 bg-white hover:bg-teal-50 disabled:opacity-5 text-teal-600 rounded-2xl shadow-lg border border-teal-100 transition-all active:scale-90"
             >
              <ChevronsRight size={24} />
            </button>
          </div>

          <AnimatePresence>
        {selectedBlock && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-teal-900/40 backdrop-blur-md flex items-center justify-center z-50 p-6"
            onClick={() => setSelectedBlock(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[3rem] p-10 w-full max-w-2xl shadow-2xl relative max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setSelectedBlock(null)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800 transition-colors">
                <X size={24} />
              </button>
              
              <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
                <div className="bg-teal-500 p-2 rounded-xl text-white"><Shield size={24} /></div>
                Details: Block {selectedBlock.index === 0 ? "Genesis" : "#" + selectedBlock.index}
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="col-span-2 bg-slate-50 p-4 rounded-2xl">
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Hash Block</label>
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-[10px] text-slate-600 break-all flex-1">{selectedBlock.hash}</div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(selectedBlock.hash);
                        afficherNotification("Hash copied to clipboard!");
                      }}
                      className="p-2 bg-white rounded-lg text-teal-500 hover:bg-teal-500 hover:text-white transition-all shadow-sm border border-teal-100 active:scale-90"
                      title="Copier Hash"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Mineur</label>
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-[10px] text-slate-600 break-all flex-1">
                      {(selectedBlock.coinbase.Mineur || selectedBlock.coinbase.mineur).substring(0, 5)}...{(selectedBlock.coinbase.Mineur || selectedBlock.coinbase.mineur).substring(60)}
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(selectedBlock.coinbase.Mineur || selectedBlock.coinbase.mineur);
                        afficherNotification("Hash copied to clipboard!");
                      }}
                      className="p-2 bg-white rounded-lg text-teal-500 hover:bg-teal-500 hover:text-white transition-all shadow-sm border border-teal-100 active:scale-90"
                      title={(selectedBlock.coinbase.Mineur || selectedBlock.coinbase.mineur)}
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Recompense</label>
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-[10px] text-slate-600 break-all flex-1">
                      {(selectedBlock.coinbase.Recompense || selectedBlock.coinbase.recompense) ? (selectedBlock.coinbase.Recompense || selectedBlock.coinbase.recompense).toFixed(4) : "0.00"}
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Hash Précédent</label>
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-[10px] text-slate-600 break-all flex-1">
                      {(selectedBlock.prevHash).substring(0, 5)}...{(selectedBlock.prevHash).substring(60)}
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(selectedBlock.prevHash);
                        afficherNotification("Hash copied to clipboard!");
                      }}
                      className="p-2 bg-white rounded-lg text-teal-500 hover:bg-teal-500 hover:text-white transition-all shadow-sm border border-teal-100 active:scale-90"
                      title={selectedBlock.prevHash}
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Merkle Root</label>
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-[10px] text-slate-600 break-all flex-1">
                      {(selectedBlock.merkleRoot).substring(0, 5)}...{(selectedBlock.merkleRoot).substring(60)}
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(selectedBlock.merkleRoot);
                        afficherNotification("Hash copied to clipboard!");
                      }}
                      className="p-2 bg-white rounded-lg text-teal-500 hover:bg-teal-500 hover:text-white transition-all shadow-sm border border-teal-100 active:scale-90"
                      title={selectedBlock.merkleRoot}
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4">
                  <Clock className="text-teal-500" size={16} />
                  <div>
                    <div className="text-[9px] font-black text-slate-400 uppercase">Timestamp</div>
                    <div className="text-xs font-bold">{selectedBlock.timestamp || "N/A"}</div>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4">
                  <Cpu className="text-teal-500" size={16} />
                  <div>
                    <div className="text-[9px] font-black text-slate-400 uppercase">Nonce</div>
                    <div className="text-xs font-bold">{selectedBlock.nonce}</div>
                  </div>
                </div>
              </div>

              <div className="bg-teal-600/10 p-5 rounded-xl border border-teal-500/20">
                    <label className="text-[10px] text-teal-600 font-bold block mb-3 uppercase flex justify-between">
                      <span>Transactions ({selectedBlock.transactions.length})</span>
                    </label>

                    <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {selectedBlock.transactions.map((tx, idx) => {
                        return (
                          <div key={idx} className="bg-teal-50/50 border border-teal-100 p-4 rounded-2xl flex justify-between items-center">
                            <div className="flex-1 min-w-0">
                              <div className="text-[9px] text-teal-600 font-bold mb-1">FROM/TO</div>
                              <div className="text-[10px] font-mono text-slate-500 truncate">{(tx.expediteur || tx.Expediteur).substring(0, 20)}...</div>
                              <div className="text-[10px] font-mono text-slate-500 truncate">{(tx.destinataire || tx.Destinataire).substring(0, 20)}...</div>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-sm font-black text-teal-700">{(tx.quantite || tx.Quantite || 0).toFixed(2)} BTC</div>
                              <span className="text-[12px] text-emerald-500 font-bold uppercase">Frais: {(tx.frais || tx.Frais || 0).toFixed(2)} BTC</span>
                            </div>
                          </div>
                        );
                      })}

                      {selectedBlock.transactions.length === 0 && (
                          <div className="text-sm text-slate-500 italic text-center py-4">Aucune transaction dans ce bloc</div>
                      )}
                    </div>
                  </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
        </div>
  );
};


export default Explorateur;