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
  Copy
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiAffiche } from "./api";

const blockVariants = {
  center: { x: 0, scale: 1, opacity: 1, zIndex: 10, filter: "blur(0px)" },
  left: { x: -280, scale: 0.8, opacity: 0.3, zIndex: 5, filter: "blur(1px)" },
  right: { x: 280, scale: 0.8, opacity: 0.3, zIndex: 5, filter: "blur(1px)" },
  hiddenLeft: { x: -400, scale: 0.5, opacity: 0, zIndex: 0 },
  hiddenRight: { x: 400, scale: 0.5, opacity: 0, zIndex: 0 },
};

const App = () => {
  const [blocks, setBlocks] = useState([]);
  const [mempool, setMempool] = useState([]); // ÉTAT POUR LE MEMPOOL
  const [currentIndex, setCurrentIndex] = useState(0);
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

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await apiAffiche.login(username, password);
      setToken(res.data);
      afficherNotification("Connexion réussie !");
    } catch (err) {
      afficherNotification("Identifiants incorrects ");
    }
  };

  const handleLogout = () => {
    setToken(null);
    setSolde(0);
    afficherNotification("Déconnexion réussie");
  };

  const handleAjouterFonds = () => {
    setSolde(solde + 50);
    afficherNotification("+ 50 BTC ajoutés (Mode Test)");
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(adresseTest);
    setDestinataire(adresseTest);
    afficherNotification("Adresse copiée et collée !");
  };

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

  return (
      <div className="flex h-screen text-black text-slate-800 overflow-hidden font-sans">
      {/* <div className="flex h-screen bg-slate-900 text-white overflow-hidden font-sans"> */}
      {/* <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] 
      from-cyan-400 via-teal-500 to-emerald-600 text-slate-800 font-sans 
      p-6 overflow-hidden flex flex-col gap-6"> */}

        {/* 1. PANNEAU GAUCHE : LE WALLET (25% de l'écran) */}
        <aside className="w-1/4 border-r border-slate-700 bg-slate-800/50 p-6 flex flex-col z-20">
          <div className="flex items-center gap-3 mb-6 text-blue-400 font-black italic">
            <Wallet size={24} />
            <h2 className="text-xl uppercase tracking-widest">Mon Wallet</h2>
          </div>

          <div className="h-12 mb-2">
            <AnimatePresence>
              {notification && (
                  <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="p-3 text-xs font-bold text-center bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-xl"
                  >
                    {notification}
                  </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!token ? (
              <form onSubmit={handleLogin} className="flex flex-col gap-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-700 shadow-xl">
                <h3 className="text-xs font-bold text-slate-400 flex items-center gap-2 mb-2 uppercase tracking-widest">
                  <Lock size={14}/> Authentification
                </h3>
                <input
                    className="bg-slate-800 p-3 rounded-xl border border-slate-600 text-sm outline-none focus:border-blue-500 transition-colors"
                    placeholder="Nom d'utilisateur"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    className="bg-slate-800 p-3 rounded-xl border border-slate-600 text-sm outline-none focus:border-blue-500 transition-colors"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 p-3 rounded-xl font-black uppercase tracking-widest transition-all text-xs mt-2">
                  Connexion
                </button>
              </form>
          ) : (
              <div className="flex flex-col h-full overflow-y-auto pr-2 custom-scrollbar">
                <div className="bg-gradient-to-br from-blue-900 to-slate-800 border border-blue-500/30 p-5 rounded-2xl mb-4 shadow-lg text-center relative overflow-hidden">
                  <div className="text-[10px] text-blue-300 font-bold uppercase tracking-widest mb-1">Solde Disponible</div>
                  <div className="text-3xl font-black text-white">{solde.toFixed(2)} <span className="text-sm text-blue-400">BTC</span></div>
                  <button onClick={handleAjouterFonds} className="mt-4 w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 p-2 rounded-xl text-xs font-bold flex justify-center items-center gap-2 text-slate-300 transition-colors">
                    <PlusCircle size={14} className="text-green-400"/> Recevoir fonds
                  </button>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl mb-4 flex flex-col gap-2">
                  <div className="text-[10px] text-yellow-500 font-bold uppercase">Adresse de test (Bob)</div>
                  <div className="flex items-center gap-2">
                    <div className="text-[10px] font-mono text-slate-300 truncate bg-slate-900 p-2 rounded-lg flex-1">
                      {adresseTest}
                    </div>
                    <button onClick={handleCopyAddress} title="Copier" className="bg-yellow-600 hover:bg-yellow-500 p-2 rounded-lg text-white transition-colors">
                      <Copy size={12} />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSendTransaction} className="flex flex-col gap-3 bg-slate-900/50 p-5 rounded-2xl border border-slate-700 shadow-xl">
                  <h3 className="text-xs font-black text-blue-400 flex items-center gap-2 uppercase tracking-widest">
                    <Send size={14}/> Envoyer
                  </h3>
                  <input
                      className="bg-slate-800 p-3 rounded-xl border border-slate-600 text-xs outline-none focus:border-blue-500 font-mono transition-colors"
                      placeholder="Adresse du destinataire"
                      value={destinataire}
                      onChange={(e) => setDestinataire(e.target.value)}
                  />
                  <div className="relative">
                    <input
                        type="number"
                        step="0.01"
                        className="w-full bg-slate-800 p-3 rounded-xl border border-slate-600 text-xs outline-none focus:border-blue-500 font-mono transition-colors"
                        placeholder="Montant"
                        value={montant}
                        onChange={(e) => setMontant(e.target.value)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-500">BTC</span>
                  </div>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-500 p-3 rounded-xl font-black uppercase tracking-widest transition-all text-xs mt-1 flex justify-center items-center gap-2">
                    <Shield size={12} /> Signer & Envoyer
                  </button>
                </form>

                <button onClick={handleLogout} className="mt-6 mb-4 flex items-center justify-center gap-2 text-slate-500 hover:text-red-400 p-2 text-xs font-bold transition-colors">
                  <LogOut size={14}/> Se Déconnecter
                </button>
              </div>
          )}
        </aside>

        {/* 2. PANNEAU CENTRAL : EXPLORATEUR BLOCKCHAIN (50% de l'écran) */}
        <main className="w-2/4 flex flex-col items-center justify-center p-8 relative overflow-hidden">
          <div className="z-20 text-center mb-6 w-full">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Database className="text-teal-500" size={28} />
              <h1 className="text-3xl font-black tracking-tighter text-blue uppercase">
                BlockChain Explorer
              </h1>
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
                        <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Block Hash</div>
                        <div className="font-mono text-[9px] break-all text-slate-600 leading-relaxed bg-slate-50 p-2 rounded-xl">
                            {block.hash}
                        </div>
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

          <div className="absolute bottom-10 flex gap-4">
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
        </main>

        {/* 3. PANNEAU DROITE : LE MEMPOOL EN DIRECT (25% de l'écran) */}
        <aside className="w-1/4 border-l border-slate-700 bg-slate-800/50 p-6 flex flex-col z-20">
          <div className="flex items-center gap-3 mb-6 text-yellow-500 font-black italic">
            <Cpu size={24} />
            <h2 className="text-xl uppercase tracking-widest">Mempool</h2>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
               En attente de validation
            </span>
            <span className="bg-yellow-500/20 text-yellow-500 text-[10px] px-2 py-0.5 rounded font-black">
               {mempool.length} TX
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
            <AnimatePresence initial={false}>
              {mempool.length === 0 ? (
                  <div className="text-xs text-slate-500 italic text-center mt-10">Aucune transaction en attente...</div>
              ) : (
                  mempool.map((tx, i) => {
                    const sender = tx.expediteur || tx.Expediteur;
                    const receiver = tx.destinataire || tx.Destinataire;
                    const amount = tx.quantite || tx.Quantite;
                    const isSigned = tx.signatureTx || tx.SignatureTx;

                    return (
                        <motion.div
                            key={i} // L'index est utilisé car on n'a pas d'ID unique pour le moment
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="p-3 bg-slate-900 border border-slate-700 rounded-xl hover:border-yellow-500/50 transition-all group"
                        >
                          <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-black text-white">
                                    {amount ? amount.toFixed(4) : "0.00"} BTC
                                </span>
                            {isSigned && (
                                <Shield size={14} className="text-green-500" title="Signé cryptographiquement" />
                            )}
                          </div>
                          <div className="space-y-1.5 border-t border-slate-700/50 pt-2">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span className="text-[8px] text-slate-500 font-bold w-6">FROM:</span>
                              <span className="text-[9px] font-mono text-slate-400 truncate">{sender}</span>
                            </div>
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span className="text-[8px] text-slate-500 font-bold w-6">TO:</span>
                              <span className="text-[9px] font-mono text-slate-400 truncate">{receiver}</span>
                            </div>
                          </div>
                        </motion.div>
                    );
                  })
              )}
            </AnimatePresence>
          </div>
        </aside>

        {/* --- MODALE HEADER DU BLOC --- */}
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
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Hash Précédent</label>
                  <div className="font-mono text-[10px] text-slate-600 break-all">{selectedBlock.prevHash}</div>
                </div>
                <div className="col-span-2 bg-slate-50 p-4 rounded-2xl">
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Merkle Root</label>
                  <div className="font-mono text-[10px] text-slate-600 break-all">{selectedBlock.merkleRoot}</div>
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
                              {(tx.signatureTx || tx.SignatureTx) && <span className="text-[8px] text-emerald-500 font-bold uppercase">Signed</span>}
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


export default App;