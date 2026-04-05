package com.uphf.blockchain.Controller;

import com.uphf.blockchain.Entity.*;
import com.uphf.blockchain.Service.AuthService;
import com.uphf.blockchain.Service.BlocService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/bloc")
@CrossOrigin(origins = "http://localhost:5173")
public class BlocController {

    @Autowired
    private BlocService blocService;

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestParam String user, @RequestParam String password) {
        String token = authService.login(user, password);
        if (token != null) {
            return ResponseEntity.ok(token);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Identifiants incorrects");
    }

    @PostMapping("/transaction")
    public ResponseEntity<String> creerTransaction(
            @RequestParam String token,
            @RequestParam String destinataire,
            @RequestParam Double montant) {

        if (!authService.isTokenValide(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Acces refuse");
        }

        Wallet monWallet = new Wallet();
        Transaction tx = new Transaction(monWallet.getAdressePublique(), destinataire, montant, montant);
        tx.signerTransaction(monWallet.getPrivateKey());

        if (tx.verifierSignature(monWallet.getPublicKey())) {
            blocService.mempool.add(tx);
            return ResponseEntity.ok("Transaction validee et ajoutee");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Signature invalide");
        }
    }

    @GetMapping("/all")
    public List<Bloc> getAllBlocs() {
        blocService.chargerDepuisJson();
        return blocService.blockchain;
    }

    @GetMapping("/toggleSimulation")
    public Boolean toggleSimulation() {
        blocService.simActive = !blocService.simActive;
        return blocService.simActive;
    }

    @GetMapping("/generer")
    public Bloc genererBloc() {
        blocService.remplirMempool();
        return blocService.genererBlocTest();
    }

    @PostMapping("/changerDifficulte")
    public ResponseEntity<String> changeTarget(
            @RequestParam int target) {
                
        System.out.println("Target Before:" + blocService.pendingTarget);
        blocService.pendingTarget = target;
        System.out.println("Target:" + blocService.pendingTarget);
        return ResponseEntity.ok("Difficulté changé");
    }

    @GetMapping("/miner")
    public Bloc minerBloc(){
        Bloc bloc = blocService.genererBlocTest();
        String merkleroot = blocService.trouverMerkle(
                bloc.getBlockBody().getTransactionList(),
                0, bloc.getBlockBody().getTransactionList().size() - 1
        );
        bloc.getBlockHeader().setMerkleRoot(merkleroot);
        blocService.proofOfWork(bloc);
        blocService.blockchain.add(bloc);
        blocService.sauvegarderEnJson();
        return bloc;
    }

    @GetMapping("/3")
    public void afficher3(){
        blocService.test3();
    }

    @GetMapping("/4")
    public void afficher4(){
        blocService.remplirMempool();
        blocService.test4();
    }

    @GetMapping("/5")
    public void afficher5(){
        blocService.remplirMempool();
        blocService.mempool.add(blocService.genererTransactionTest());
        blocService.mempool.add(blocService.genererTransactionTest());
        System.out.println("------ ---- MEMPOOL SIZE:" + blocService.mempool.size());
        Bloc test = blocService.genererBlocTest();
        blocService.afficherBlock(test);
    }

    @GetMapping("/7")
    public void toggle(){
        blocService.isMining = !blocService.isMining;
        System.out.println("isMining:" + blocService.isMining);
        System.out.println("Users:" + blocService.userList.size());
        System.out.println("Blocks:" + blocService.blockchain.size());
        System.out.println("Txs:" + blocService.mempool.size());
    }

    @GetMapping("/clear")
    public void clear(){
        blocService.isMining = false;
        blocService.userList.clear();
        blocService.blockchain.clear();
        blocService.mempool.clear();
        blocService.sauvegarderEnJson();
    }


    @GetMapping("/mempool")
    public List<Transaction> getMempool() {
        return blocService.mempool;
    }

    @GetMapping("/validate")
    public void testValider(){
        blocService.testValidation();
    }

    @GetMapping("/hasher")
    public String getHash(@RequestParam("str") String str){
        return blocService.hasher(str);
    }

    @GetMapping("/getTransactions")
    public List<Transaction> getTransactionsUser(@RequestParam("adresse") String adresse){
        blocService.chargerDepuisJson();
        int index = blocService.obtenirIndex(adresse);
        if(index<0)
        {
            return new ArrayList<>();
        }
        return blocService.obtenirTransactions(index);
    }

    @GetMapping("/getCoinBaseTransactions")
    public List<Integer> getCBTransactionsUser(@RequestParam("adresse") String adresse){
        blocService.chargerDepuisJson();
        int index = blocService.obtenirIndex(adresse);
        if(index<0)
        {
            return new ArrayList<>();
        }
        return blocService.obtenirCoinbaseBlocks(index);
    }

    @GetMapping("/getFrais")
    public double getFraisBlock(@RequestParam("index") int index){
        blocService.chargerDepuisJson();
        Bloc bloc = blocService.blockchain.get(index); 
        return blocService.obtenirFraisTotaux(bloc);
    }

    @PostMapping("/deleteTransaction")
    public ResponseEntity<String> deleteTransaction(@RequestParam String txID) {
        blocService.chargerDepuisJson();
        for(int i = 0 ; i<blocService.mempool.size();i++)
        {
            if(txID.equals(blocService.mempool.get(i).getTxID()))
            {
                blocService.mempool.remove(i);
                blocService.remplirMempool();
                blocService.sauvegarderEnJson();
                return ResponseEntity.ok("Transaction supprimée");
            }
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Transaction non trouvée");
    }

    @PostMapping("/toggleMining")
    public ResponseEntity<String> toggleMining(@RequestBody MineRequest request)
    {
        blocService.chargerDepuisJson();
        System.out.println("OUI! NEW OUI!!!!");
        List<String> ids = request.getTxIDs();
        int target = request.getTarget();
        System.out.println("size:" + ids.size());
        System.out.println("target:" + target);
        if(ids.size()>0)
        {
            System.out.println("first:" + ids.get(0));
            System.out.println("first mempool:" + blocService.mempool.get(0).getTxID());
        }
        if(blocService.mineLock)
        {
            blocService.mineLock = false;
            blocService.isMining = false;
            return ResponseEntity.ok("Mining off");
        }
        blocService.pendingTransactions = ids; 
        blocService.pendingTarget = target;
        blocService.pendingMineur = -1;
        blocService.mineLock = true;
        blocService.isMining = true;
        System.out.println("FINI!");
        return ResponseEntity.ok("Mining on");
    }
}