import React, { useState } from "react";
import { apiAffiche } from "../api";
import { motion, AnimatePresence } from "framer-motion";


const Principes = ({ afficherNotification }) => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState('');

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setInputText(value); // Updates the typing textbox
    
    if(!value)
    {
        setOutputText("");
        return;
    }

    const result = await apiAffiche.hasher(value); // Calls your function
    setOutputText(result.data); // Updates the result textbox
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="flex flex-col gap-8 w-full max-w-5xl mx-auto p-4"
    >
      {/* HEADER & CREATION FORM */}
      <section className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-8 shadow-2xl">
        
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Texte à Hasher"
              value={inputText}
              onChange={handleInputChange}
              className="w-full bg-white/60 border border-white/80 rounded-2xl py-4 pl-12 pr-4 text-slate-800 font-medium focus:ring-2 ring-teal-400 outline-none transition-all"
            />
         
            <input
              type="text"
              placeholder="Résultat"
              value={outputText}
              readOnly
              className="w-full bg-white/60 border border-white/80 rounded-2xl py-4 pl-12 pr-4 text-slate-800 font-medium focus:ring-2 ring-teal-400 outline-none transition-all"
            />
        </div>
      </section>
    </motion.div>
  );
};

export default Principes;