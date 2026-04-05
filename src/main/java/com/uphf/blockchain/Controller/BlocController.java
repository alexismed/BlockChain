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

    @GetMapping("/toggle")
    public Boolean toggleMining() {
        blocService.isMining = !blocService.isMining;
        return blocService.isMining;
    }

    @GetMapping("/generer")
    public Bloc genererBloc() {
        blocService.remplirMempool();
        return blocService.genererBlocTest();
    }

    @PostMapping("/changerDifficulte")
    public ResponseEntity<String> changeTarget(
            @RequestParam int target) {
                
        System.out.println("Target Before:" + blocService.difficulty);
        blocService.difficulty = target;
        System.out.println("Target:" + blocService.difficulty);
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
        System.out.println("Adresse:" + adresse);
        int index = blocService.obtenirIndex(adresse);
        System.out.println("index:" + index);
        if(index<0)
        {
            return new ArrayList<>();
        }
        System.out.println("HI:");
        return blocService.obtenirTransactions(index);
    }

    @GetMapping("/getCoinBaseTransactions")
    public List<Integer> getCBTransactionsUser(@RequestParam("adresse") String adresse){
        blocService.chargerDepuisJson();
        int index = blocService.obtenirIndex(adresse);
        System.out.println("index:" + index);
        if(index<0)
        {
            return new ArrayList<>();
        }
        System.out.println("HI2:");
        return blocService.obtenirCoinbaseBlocks(index);
    }

    @GetMapping("/getFrais")
    public double getFraisBlock(@RequestParam("index") int index){
        blocService.chargerDepuisJson();
        Bloc bloc = blocService.blockchain.get(index); 
        return blocService.obtenirFraisTotaux(bloc);
    }
}