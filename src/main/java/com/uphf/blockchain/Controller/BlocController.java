package com.uphf.blockchain.Controller;

import com.uphf.blockchain.Entity.*;
import com.uphf.blockchain.Service.AuthService;
import com.uphf.blockchain.Service.BlocService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/miner")
    public Bloc minerBloc(){
        Bloc bloc = blocService.genererBlocTest();
        String merkleroot = blocService.trouverMerkle(
                bloc.getBlockBody().getTransactionList(),
                0, bloc.getBlockBody().getTransactionList().size() - 1
        );
        bloc.getBlockHeader().setMerkleRoot(merkleroot);
        blocService.consensus(bloc);
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
    @GetMapping("/mempool")
    public List<Transaction> getMempool() {
        return blocService.mempool;
    }

    @GetMapping("/validate")
    public void testValider(){
        blocService.testValidation();
    }
}