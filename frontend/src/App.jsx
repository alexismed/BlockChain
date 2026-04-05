import Minage from "./Components/Minage";
import Explorateur from "./Components/Explorateur";
import Comptes from "./Components/Comptes";
import Donnees from "./Components/Donnees";
import Soldes from "./Components/Soldes";
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
import Principes from "./Components/Principes";

const blockVariants = {
  center: { x: 0, scale: 1, opacity: 1, zIndex: 10, filter: "blur(0px)" },
  left: { x: -280, scale: 0.8, opacity: 0.3, zIndex: 5, filter: "blur(1px)" },
  right: { x: 280, scale: 0.8, opacity: 0.3, zIndex: 5, filter: "blur(1px)" },
  hiddenLeft: { x: -400, scale: 0.5, opacity: 0, zIndex: 0 },
  hiddenRight: { x: 400, scale: 0.5, opacity: 0, zIndex: 0 },
};

const App = () => {
  const [activeTab, setActiveTab] = useState("Explorateur");
  const [blocks, setBlocks] = useState([]);
  const [mempool, setMempool] = useState([]); // ÉTAT POUR LE MEMPOOL
  const [currentIndex, setCurrentIndex] = useState(0);
  const [simActive, setSimActive] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBlock, setSelectedBlock] = useState(null);

  const [token, setToken] = useState(null);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("azerty");
  const [destinataire, setDestinataire] = useState("");
  const [montant, setMontant] = useState("");
  const [notification, setNotification] = useState("");

  const [difficulte, setDifficulte] = useState(0);
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
            setDifficulte(header?.target || header?.Target);

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

  const handleToggleSimulation = async () => {
    try {
      const res = await apiAffiche.toggleMining();
      setSimActive(res.data);
    } catch (err) {
      afficherNotification("Erreur lors de l'action de minage");
      console.error(err);
    }
  };

  const handleChangeTarget = async (target) => {
    try {
      const res = await apiAffiche.changerDifficulte(target);
    } catch (err) {
      afficherNotification("Erreur lors de l'action de minage");
      console.error(err);
    }
  };

  return (
      <div className="flex h-screen text-black text-slate-800 overflow-hidden font-sans">

        {/* 1. PANNEAU GAUCHE : LE WALLET (25% de l'écran) */}
        <aside className="w-1/4 bg-white/60 border-r border-white/20 backdrop-blur-xl p-8 flex flex-col z-20 shadow-2xl overflow-y-auto">
          {/* Brand Header */}
          <div className="flex items-center gap-4 mb-12">
            <div>
              <h2 className="text-[40px] font-black text-teal-600 text-slate-800 leading-none">Projet Blockchain</h2>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 flex flex-col gap-3">
            {[
              { title: "Principes", icon: <Search size={20} /> },
              { title: "Explorateur", icon: <Database size={20} /> },
              { title: "Soldes", icon: <Wallet size={20} /> },
              { title: "Donnees", icon: <X size={20} /> },
            ].map((item, index) => (
              <button
                onClick={() => setActiveTab(item.title)}
                key={index}
                className="flex items-center gap-4 w-full p-4 rounded-2xl transition-all duration-300 group
                          hover:bg-white hover:shadow-xl hover:shadow-teal-500/5 border border-transparent hover:border-teal-100 hover:translate-x-1"
              >
                {/* Tab Icon */}
                <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-teal-50 text-slate-400 group-hover:text-teal-600 transition-colors">
                  {item.icon}
                </div>
                
                {/* Tab Label */}
                <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                  {item.title}
                </span>

                {/* Hover Indicator */}
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                </div>
              </button>
            ))}
          </nav>

          {/* Status Info Footer */}
          <div className="mt-8 pt-8 border-t border-slate-100">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Nombre de blocs</span>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
              </div>
              <div className="text-[15px] font-bold text-slate-700">{blocks.length}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Difficulté Actuelle</span>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
              </div>
              <div className="text-[15px] font-bold text-slate-700">{difficulte}</div>
            </div>
          </div>
        </aside>

        {/* 2. PANNEAU CENTRAL : EXPLORATEUR BLOCKCHAIN (50% de l'écran) */}
        <main className="w-2/4 flex flex-col items-center p-8 relative overflow-y-auto custom-scrollbar">

          {activeTab === "Principes" && (
            <Principes afficherNotification={afficherNotification} />
          )}
          {activeTab === "Comptes" && (
            <Comptes afficherNotification={afficherNotification} />
          )}
          {activeTab === "Minage" && (
            <Minage 
              isMining={simActive} 
              onToggle={handleChangeTarget} 
            />
          )}
          {activeTab === "Explorateur" && <Explorateur />}

          {activeTab === "Donnees" && (
            <Donnees 
              title="Donnees brutes de la chaine"
              data={{
                blocks: blocks,
              }}
              afficherNotification={afficherNotification}
            />
          )}

          {activeTab === "Soldes" && (
            <Soldes 
              afficherNotification={afficherNotification} 
            />
          )}

          
        </main>

        {/* 3. PANNEAU DROITE : LE MEMPOOL EN DIRECT (25% de l'écran) */}
        <aside className="w-1/4 bg-white/60 border-l border-slate-700 bg-slate-800/50 p-6 flex flex-col z-20">
          <div className="flex items-center gap-3 mb-6 text-teal-500 font-black ">
            <Cpu size={24} />
            <h2 className="text-xl uppercase tracking-widest">Mempool</h2>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] text-slate-800 font-bold uppercase tracking-wider">
               En attente de validation
            </span>
            <span className="bg-yellow-500/20 text-teal-600 text-[10px] px-2 py-0.5 rounded font-black">
               {mempool.length} TX
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
            <AnimatePresence initial={false}>
              {mempool.length === 0 ? (
                  <div className="text-xs text-slate-800 italic text-center mt-10">Aucune transaction en attente...</div>
              ) : (
                  mempool.map((tx, i) => {
                    const sender = tx.expediteur || tx.Expediteur;
                    const receiver = tx.destinataire || tx.Destinataire;
                    const amount = tx.quantite || tx.Quantite;
                    const frais = tx.frais || tx.Frais;
                    const isSigned = tx.signatureTx || tx.SignatureTx;

                    return (
                        <motion.div
                            key={i} // L'index est utilisé car on n'a pas d'ID unique pour le moment
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="p-3 bg-yellow-500/20 bg-slate-900 border border-slate-700 rounded-xl hover:border-yellow-500/50 transition-all group"
                        >
                          <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-black text-teal-600">
                                    {amount ? amount.toFixed(4) : "0.00"} BTC
                                </span>
                                <span className="text-sm font-black text-green-600">
                                    Frais: {amount ? frais.toFixed(4) : "0.00"} BTC
                                </span>
                          </div>
                          <div className="space-y-1.5 border-t border-slate-700 pt-2">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span className="text-[8px] text-slate-800 font-bold w-6">FROM:</span>
                              <span className="text-[9px] font-mono text-slate-700 truncate">{sender}</span>
                            </div>
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span className="text-[8px] text-slate-800 font-bold w-6">TO:</span>
                              <span className="text-[9px] font-mono text-slate-700 truncate">{receiver}</span>
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
        
      </div>
  );
};


export default App;