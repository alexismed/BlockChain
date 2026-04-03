import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserPlus, 
  Key, 
  ShieldCheck, 
  Fingerprint, 
  Copy, 
  CheckCircle2, 
  Trash2,
  User
} from "lucide-react";

const Comptes = ({ afficherNotification }) => {
  const [accounts, setAccounts] = useState([]);
  const [newName, setNewName] = useState("");

  // Helper to simulate cryptographic generation
  const generateHex = (length) => {
    const chars = "0123456789abcdef";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateAccount = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newAccount = {
      id: Date.now(),
      name: newName,
      address: "0x" + generateHex(40),
      publicKey: "pub_" + generateHex(64),
      privateKey: "prv_" + generateHex(64),
      createdAt: new Date().toLocaleDateString(),
    };

    setAccounts([newAccount, ...accounts]);
    setNewName("");
    if (afficherNotification) afficherNotification("Account created successfully!");
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    if (afficherNotification) afficherNotification(`${label} copied!`);
  };

  const deleteAccount = (id) => {
    setAccounts(accounts.filter(acc => acc.id !== id));
    if (afficherNotification) afficherNotification("Account removed");
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="flex flex-col gap-8 w-full max-w-5xl mx-auto p-4"
    >
      {/* HEADER & CREATION FORM */}
      <section className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-8 shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-teal-500 p-3 rounded-2xl text-white shadow-lg shadow-teal-500/20">
            <UserPlus size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Identity Manager</h2>
            <p className="text-xs font-bold text-teal-600 uppercase tracking-widest">Create Secure Blockchain Accounts</p>
          </div>
        </div>

        <form onSubmit={handleCreateAccount} className="flex gap-4">
          <div className="relative flex-1">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Enter Account Name (e.g. My Ledger)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-white/60 border border-white/80 rounded-2xl py-4 pl-12 pr-4 text-slate-800 font-medium focus:ring-2 ring-teal-400 outline-none transition-all"
            />
          </div>
          <button className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-black px-8 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
            Generate Keys
          </button>
        </form>
      </section>

      {/* ACCOUNTS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {accounts.map((acc) => (
            <motion.div
              key={acc.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/80 backdrop-blur-md border border-white rounded-[2rem] p-6 shadow-xl flex flex-col gap-4 relative group"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-teal-600 font-black text-lg">
                    {acc.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 leading-none">{acc.name}</h3>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{acc.createdAt}</span>
                  </div>
                </div>
                <button 
                  onClick={() => deleteAccount(acc.id)}
                  className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* DATA FIELDS */}
              <div className="space-y-3 mt-2">
                <DataField 
                  label="Public Address" 
                  value={acc.address} 
                  icon={<Fingerprint size={14}/>} 
                  onCopy={() => copyToClipboard(acc.address, "Address")}
                />
                <DataField 
                  label="Public Key" 
                  value={acc.publicKey} 
                  icon={<ShieldCheck size={14}/>} 
                  onCopy={() => copyToClipboard(acc.publicKey, "Public Key")}
                />
                <DataField 
                  label="Private Key" 
                  value={acc.privateKey} 
                  icon={<Key size={14}/>} 
                  isSecret 
                  onCopy={() => copyToClipboard(acc.privateKey, "Private Key")}
                />
              </div>

              <div className="mt-2 pt-4 border-t border-slate-100 flex justify-between items-center">
                 <span className="text-[9px] font-black text-emerald-500 uppercase flex items-center gap-1">
                   <CheckCircle2 size={12}/> Ready for Signing
                 </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {accounts.length === 0 && (
        <div className="text-center py-20 opacity-40 italic text-slate-600">
          No accounts created yet. Use the form above to get started.
        </div>
      )}
    </motion.div>
  );
};

// Sub-component for the info rows
const DataField = ({ label, value, icon, onCopy, isSecret = false }) => {
  const [show, setShow] = useState(!isSecret);

  return (
    <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 group/field">
      <div className="flex justify-between items-center mb-1">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
          {icon} {label}
        </label>
        <div className="flex gap-2">
          {isSecret && (
            <button onClick={() => setShow(!show)} className="text-[9px] font-bold text-teal-600 hover:underline">
              {show ? "Hide" : "Reveal"}
            </button>
          )}
          <button onClick={onCopy} className="text-slate-400 hover:text-teal-500 transition-colors">
            <Copy size={12} />
          </button>
        </div>
      </div>
      <div className={`font-mono text-[10px] break-all leading-tight ${show ? "text-slate-600" : "text-slate-200 blur-[3px] select-none"}`}>
        {value}
      </div>
    </div>
  );
};

export default Comptes;