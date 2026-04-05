# Projet de Blockchain

Projet educatif simulant le fonctionnement d'une blockchain avec minage par Preuve de Travail (Proof of Work)
- Lien github: https://github.com/alexismed/BlockChain

## Technologies

- Backend : Java 17+, Spring Boot
- Frontend : React.js, Tailwind CSS
- Persistance : Fichiers JSON locaux

## Installation et Lancement

### 1. Lancer le Backend (Java)
1. Ouvrez le dossier backend dans votre IDE (IntelliJ, Eclipse...).
2. Lancez le fichier principal `BlockChainApplication.java`.
3. Le serveur backend demarrera sur `http://localhost:8080`.

### 2. Lancer le Frontend (React)
1. Ouvrez un terminal dans le dossier du frontend.
2. Installez les dependances avec la commande :
   npm install
3. Demarrez le serveur local avec la commande :
   npm run dev
4. Ouvrez votre navigateur a l'adresse indiquee (generalement `http://localhost:5173`).

## Comment tester l'application ?

1. Connectez-vous sur le panneau de gauche avec les identifiants : `admin` / `azerty`.
2. Cliquez sur "Recevoir fonds" pour vous verser des Bitcoins de test.
3. Copiez l'adresse de test "Bob" fournie sur l'interface.
4. Entrez un montant et cliquez sur "Signer & Envoyer".
5. Observez votre transaction en attente dans le panneau "Mempool" a droite.
6. Patientez pendant que le serveur Java mine automatiquement le bloc en arriere-plan.
7. Votre transaction sera validee et apparaitra dans un nouveau bloc au centre de l'ecran !