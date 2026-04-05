import axios from 'axios';

const API_BASE_URL = "http://localhost:8080/api/bloc/";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

export const apiAffiche = {
    generer: () => api.get("generer"),
    miner: () => api.get("miner"),
    getBlockChain: () => api.get("all"),
    getMempool: () => api.get("mempool"), // NOUVELLE ROUTE ICI !
    toggleMining: () => api.get("toggle"),
    clearBlockchain: () => api.get("clear"),
    hasher: (str) => api.get(`hasher?str=${str}`),
    getTransactions: (str) => api.get(`getTransactions?adresse=${str}`),
    getCoinBaseTransactions: (str) => api.get(`getCoinBaseTransactions?adresse=${str}`),
    getFraisBlock: (index) => api.get(`getFrais?index=${index}`),

    changerDifficulte: (target) =>
        api.post(`changerDifficulte?target=${target}`),

    creerTransaction: (token, destinataire, montant) =>
        api.post(`transaction?token=${token}&destinataire=${destinataire}&montant=${montant}`)
};

export default api;