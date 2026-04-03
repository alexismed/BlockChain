package com.uphf.blockchain.Service;
import org.springframework.scheduling.annotation.Scheduled;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.uphf.blockchain.Entity.*;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;


import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Random;

@Service
public class BlocService {

    public int difficulty = 2;
    public Boolean isMining = false;
    public List<Bloc> blockchain = new ArrayList<>();
    public List<Transaction> mempool = new ArrayList<>();
    public List<String> userList = new ArrayList<>();
    private ObjectMapper objectMapper;
    private final String FILE_NAME_BLOCKCHAIN = "blockchain.json";
    private final String FILE_NAME_MEMPOOL = "mempool.json";

    public BlocService() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule()); // Obligatoire pour lire les "LocalDate"
    }
    @PostConstruct
    public void chargerDepuisJson() {
        File fichier = new File(FILE_NAME_MEMPOOL);
        if (fichier.exists()) {
            try {
                mempool = objectMapper.readValue(fichier, new TypeReference<List<Transaction>>() {});
                System.out.println(" Mempool chargé depuis le JSON ! (" + mempool.size() + " transactions)");
            } catch (IOException e) {
                System.out.println(" Erreur de lecture du JSON : " + e.getMessage());
            }
        } else {
            remplirMempool();
            System.out.println(" Aucun fichier JSON trouvé, démarrage d'un mempool vide.");
        }
        fichier = new File(FILE_NAME_BLOCKCHAIN);
        if (fichier.exists()) {
            try {
                blockchain = objectMapper.readValue(fichier, new TypeReference<List<Bloc>>() {});
                System.out.println(" Blockchain chargée depuis le JSON ! (" + blockchain.size() + " blocs)");
            } catch (IOException e) {
                System.out.println(" Erreur de lecture du JSON : " + e.getMessage());
            }
        } else {
            blockchain.add(genererBlocTest());
            System.out.println(" Aucun fichier JSON trouvé, démarrage d'une blockchain vide.");
        }
    }
    public void sauvegarderEnJson() {
        try {
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(new File(FILE_NAME_MEMPOOL), mempool);
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(new File(FILE_NAME_BLOCKCHAIN), blockchain);
            System.out.println(" Blockchain sauvegardée dans " + FILE_NAME_BLOCKCHAIN);
        } catch (IOException e) {
            System.out.println(" Erreur d'écriture du JSON : " + e.getMessage());
        }
    }

    public void remplirMempool()
    {
        for(int i = 0; i < (2 * userList.size()) ; i++ )
        {
            if(mempool.size() >= 200) break;
            ajouterTransaction();
        }
        Collections.sort(mempool, new SortByFee());
    }

    public Bloc genererBlocTest()
    {
        Header headertest = genererHeaderTest();
        Body bodyTest = genererBodyTest();
        Bloc bloc = new Bloc(headertest  , bodyTest);
        return bloc;
    }

    public String genererRandomString()
    {
        String charPool = "0123456789abcdefghijklmnopqrstuvwxyz";
        Random randomNumbers = new Random();
        char[] ransString = new char[10];
        for(int i = 0; i<10; i++)
        {
            ransString[i] = charPool.charAt(randomNumbers.nextInt(charPool.length()));
        }
        String result = new String(ransString);
        return hasher(result);
    }

    public Header genererHeaderTest()
    {
        Random randNumber = new Random();
        Header header = new Header(
            genererRandomString(), 
            LocalDateTime.now(),
            genererRandomString(),
                5,
            randNumber.nextInt(1000) );
        return header;
    }

    public Transaction genererTransactionTest()
    {
        Random randNumber = new Random();
        Transaction transaction = new Transaction(
            genererRandomString(), 
            genererRandomString(), 
            randNumber.nextDouble()*100,
            randNumber.nextDouble()*10
        );
        return transaction;
    } 

    public CoinBase genererCoinbaseTest()
    {
        Random randNumber = new Random();
        CoinBase coinbase = new CoinBase(
            genererRandomString(),
            randNumber.nextDouble()*100 , 
            0);
        return coinbase;
    }


    public Body genererBodyTest()
    {
        List<Transaction> transList = new ArrayList<>();
        remplirMempool();
        for(int i = 0; i< 4; i++)
        {
            transList.add(mempool.get(i));
        }
        Collections.sort(transList, new SortByFee());
        Body body = new Body(genererCoinbaseTest() , transList);
        return body;
    }
    
    public void afficherHeader(Header header){
        System.out.println(" HEADER:");
        System.out.println("  Hash Precedent:" + header.getHashPre());
        System.out.println("  Merkle Root:" + header.getMerkleRoot());
        System.out.println("  TimeStamp:" + header.getTimeStamp().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        System.out.println("  Target (Complexite):" + header.getTarget());
        System.out.println("  Nonce:" + String.valueOf(header.getNonce()));
    }

    public void afficherCoinbase(CoinBase coinBase){
        System.out.println("  COINBASE:");
        System.out.println("   Mineur:" + coinBase.getMineur());
        System.out.println("   Recompense:" + String.format("%.9f", coinBase.getRecompense()));
        System.out.println("   ExtraNonce:" + String.valueOf(coinBase.getExtraNonce()));
    }

    public void afficherTransaction(Transaction transaction){
        System.out.println("    Expediteur:" + transaction.getExpediteur());
        System.out.println("    Destinataire:" + transaction.getDestinataire());
        System.out.println("    Quantite:" + String.format("%.9f", transaction.getQuantite()));
        System.out.println("    Frais:" + String.format("%.9f", transaction.getFrais()));
    }

    public void afficherBody(Body body){
        System.out.println(" BODY:");
        afficherCoinbase(body.getCoinBaseTrans());
        List<Transaction> transList = body.getTransactionList();
        System.out.println("  TRANSACTIONS:");
        for(int i = 0; i<transList.size(); i++) {
            System.out.println("   Transaction " + String.valueOf(i));
            afficherTransaction(transList.get(i));
        }
    }

    public void afficherBlock(Bloc bloc){
        System.out.println("AFFICHAGE DE BLOC");
        afficherHeader(bloc.getBlockHeader());
        afficherBody(bloc.getBlockBody());
    }

    public String hasher(String mot){
        try{
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodehash = digest.digest(mot.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder(2*encodehash.length);
            for (int i = 0 ; i < encodehash.length ; i++){
                String hex = Integer.toHexString(0xff & encodehash[i]);
                if(hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        }catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Erreur de hachage ", e);
        }
    }

    public String hasherTransaction(Transaction transaction) {
        String result = transaction.getExpediteur() + transaction.getDestinataire();
        result += String.format("%.9f", transaction.getQuantite() + transaction.getFrais());
        return hasher(result);
    }

    public String trouverMerkle(List<Transaction> transList, int start, int end) {
        if (start ==  end ){
            return hasherTransaction(transList.get(start));
        }
        String result = trouverMerkle(transList, start , (start + end)/2);
        result += trouverMerkle(transList, (start + end)/2+1,end);
        return hasher(result);
    }

    public String hasherCoinBase(CoinBase coinBase) {
       String result = coinBase.getMineur();
       result += String.format("%.9f", coinBase.getRecompense());
       result += String.valueOf(coinBase.getExtraNonce());
       return hasher(result);
    }

    public String hasherBody(Body body)
    {
        String result = hasherCoinBase(body.getCoinBaseTrans());
        List<Transaction> transList = body.getTransactionList();
        if(transList.size()<1) return result;
        result += trouverMerkle(transList, 0, transList.size()-1);
        return hasher(result);
    }

    public void  test () {
        Body bodyTest = genererBodyTest();
        String merkleroot = hasherBody(bodyTest);
        System.out.println("Merkle root trouvée:" + merkleroot);
    }

    public boolean validation (List<Bloc> blocList, int position){
        for (int i = 0 ; i<6 ; i++){
            Bloc bloc1 = blocList.get(position-i);
            Bloc bloc2 = blocList.get(position-i-1);
            Header header1 = bloc1.getBlockHeader();
            Header header2 = bloc2.getBlockHeader();
            if (!header1.getHashPre().equals(hasherHeader(header2))){
                return false;
            }
            if(!validateTransactions(bloc1.getBlockBody(),header1.getMerkleRoot())){
                return false;
            }
        }
        return true;
    }

    public String hasherHeader (Header header){
        String result = header.getHashPre() + String.valueOf(header.getNonce());
        result=hasher(result);
        result += header.getMerkleRoot();
        return hasher(result);
    }

    public boolean validateTransactions(Body body,String merkleRoot){
        List<Transaction> transList = body.getTransactionList();
        String hashCoinBase= hasherCoinBase(body.getCoinBaseTrans());

        int upperBound = 1;
        while(upperBound<transList.size())
        {
            upperBound*=2;
        }
        upperBound = upperBound*2 -1;
        MerkleProof merkleProof= fillMerkleProof(
                0,
                transList.size() -1,
                0,
                new MerkleProof(
                transList.size(),
                upperBound
            ),
                transList);
        for (int i = 0 ; i< transList.size() ; i++){
            int actuelle=merkleProof.IndexMapping[i];
            String hash = "";
            while(actuelle>0){
                hash = merkleProof.MerkleTree[actuelle];
                if (actuelle%2==0){
                    hash = merkleProof.MerkleTree[actuelle-1] + hash;
                }else {
                    hash += merkleProof.MerkleTree[actuelle+1];
                }
                hash=hasher(hash);
                actuelle=(actuelle-1)/2;
                if (!merkleProof.MerkleTree[actuelle].equals(hash)){
                    return false;
                }
            }
            hash=hashCoinBase+merkleProof.MerkleTree[actuelle];
            if (!merkleRoot.equals(hasher(hash))){
                return false;
            }

        }
        return true;
    }

    public boolean proofOfWork(Bloc bloc){
        Header header = bloc.getBlockHeader();
        for(int i = 0 ; i<Integer.MAX_VALUE ; i++){
            header.setNonce(i);
            String hash = hasherHeader(header);
            if(validerHash(hash, header.getTarget())){
                bloc.setHashBlock(hash);
                return true;
            }
        }
        Body body = bloc.getBlockBody();

        CoinBase coinBase = body.getCoinBaseTrans();
        int extraNonce= coinBase.getExtraNonce();
        coinBase.setExtraNonce(extraNonce+1);
        body.setCoinBaseTrans(coinBase);
        bloc.setBlockBody(body);
        String merkleroot = hasherBody(body);
        header.setMerkleRoot(merkleroot);
        bloc.setBlockHeader(header);

        return proofOfWork(bloc);

    }
    public boolean validerHash(String hash , int target){
       int position = 0;
        while(target>0){
            if(hash.charAt(position)!='0'){
                return false;
            }
            target--;
            position++;
        }
        return true;
    }

    @Scheduled(fixedRate = 10)
    public void minerBloc()
    {
        if(true)
            return;
        chargerDepuisJson();
        if(blockchain.size()<1)
        {
            blockchain.add(genererBlocTest());
        }
        if(!isMining) 
        {
            return;
        }
        Body body = genererBodyTest();
        Bloc blocPrecedent = blockchain.getLast();
        String hashPrecedent = hasherHeader(blocPrecedent.getBlockHeader());
        String merkleRoot = hasherBody(body);
        Header header = new Header(
            merkleRoot, 
            LocalDateTime.now(),
            hashPrecedent,
                5,
            0);
        Bloc newBloc = new Bloc(header,body);
        if(proofOfWork(newBloc))
        {
            blockchain.add(newBloc);
            sauvegarderEnJson();
            for(int i = 3; i>=0; i--)
            {
                mempool.add(genererTransactionTest());
                mempool.remove(i);
            }
            sauvegarderEnJson();
        }
    }

    public void test2(){
        Bloc bloc = genererBlocTest();
        Header header = bloc.getBlockHeader();
        afficherHeader(header);
        Body bodyTest = bloc.getBlockBody();
        String merkleroot = trouverMerkle(bodyTest.getTransactionList(), 0, bodyTest.getTransactionList().size()-1);
        System.out.println("MerkleRoot " +  merkleroot);
        header.setMerkleRoot(merkleroot);
        bloc.setBlockHeader(header);
        afficherBlock(bloc);
        proofOfWork(bloc);
        afficherHeader(bloc.getBlockHeader());
        System.out.println("Hash de bloc = " + hasherHeader(bloc.getBlockHeader()));
    }

    MerkleProof fillMerkleProof(int start, int end, int index, MerkleProof merkleProof,List<Transaction> transList)
    {
        if(start==end)
        {
            merkleProof.IndexMapping[start]=index;
            merkleProof.MerkleTree[index] = hasherTransaction(transList.get(start));
            return merkleProof;
        }
        merkleProof = fillMerkleProof(start, (start+end)/2, index*2+1, merkleProof,transList);
        merkleProof = fillMerkleProof((start+end)/2+1, end, index*2+2, merkleProof,transList);
        merkleProof.MerkleTree[index] = merkleProof.MerkleTree[index*2+1] + merkleProof.MerkleTree[index*2+2];
        merkleProof.MerkleTree[index]=hasher(merkleProof.MerkleTree[index]);
        return merkleProof;
    }

    public void test3()
    {
        Body body = genererBodyTest();
        List<Transaction> testList = body.getTransactionList();
        System.out.println("tSize:" + testList.size() );
        int upperBound = 1;
        while(upperBound<testList.size())
        {
            upperBound*=2;
        }
        upperBound = upperBound*2 -1;
        System.out.println("Upperbound:" + upperBound );

        MerkleProof merkleProof = fillMerkleProof(
                0,
                testList.size()-1,
                0,
                new MerkleProof(
                        testList.size(),
                        upperBound
                ),testList
        );
        String mroot = trouverMerkle(testList, 0, testList.size()-1);
        System.out.println("Merkle Root:" + mroot );
        String hashBody = hasherBody(body);
        System.out.println("Hash body:" + hashBody );
        System.out.println("Valide:" + validateTransactions(body, hashBody) );
    }

    void afficherBlockChain()
    {
        System.out.println("BLOCKCHAIN COMPLETE" );
        for(int i = 0;i<blockchain.size();i++)
        {
            System.out.println("BLOC "  + i); 
            afficherBlock(blockchain.get(i));
        }
    }

    public void test4()
    {
        System.out.println("TEST 4---------" );
        afficherBlockChain();
        minerBloc();
        afficherBlockChain();
    }

    public void testValidation()
    {
        chargerDepuisJson();
        List<Bloc> blocList = blockchain;
        System.out.println("TEST VALIDATION");
        System.out.println("TEST 1: Blocs normaux  Valide:" + validation(blocList, blocList.size()-1));
        Bloc testBloc = genererBlocTest();
        blocList.add(testBloc);
        System.out.println("TEST 2: Bloc hash precedent incorrect  Valide:" + validation(blocList,blocList.size()-1));
        blocList.removeLast();

        testBloc = blocList.getLast();
        blocList.removeLast();
        Body testBody = genererBodyTest();
        testBloc.setBlockBody(testBody);
        blocList.add(testBloc);
        System.out.println("TEST 3: Body different  Valide:" + validation(blocList,blocList.size()-1));
        blocList.removeLast();

        testBloc = blocList.getLast();
        blocList.removeLast();
        testBody = testBloc.getBlockBody();
        List<Transaction> testTransList = testBody.getTransactionList();
        testTransList.removeLast();
        testTransList.add(genererTransactionTest());
        testBody.setTransactionList(testTransList);
        testBloc.setBlockBody(testBody);
        blocList.add(testBloc);
        System.out.println("TEST 4: Une transaction fausse  Valide:" + validation(blocList,blocList.size()-1));
        blocList.removeLast();
    }

    @Scheduled(fixedRate = 10)
    public void simulateBlockChain()
    {
        if(!isMining)return;
        // Create Body 
        int indexMineur = choisirUtilisateur();
        List<Transaction> transList = choisirTransactions();
        int halving = blockchain.size() / 100;
        double recompense = 50.0;
        while(halving>0)
        {
            recompense /= 2.0;
            halving--;
        }
        CoinBase coinbase = new CoinBase(
            userList.get(indexMineur),
            recompense, 
            0);
        Body body = new Body(coinbase , transList);
        
        // Create Header
        String hashPrecedent = "-";
        if(blockchain.size()>0)
        {
            Bloc blocPrecedent = blockchain.getLast();
            hashPrecedent = blocPrecedent.getHashBlock();
        }
        String merkleRoot = hasherBody(body);
        int target = blockchain.size() < 300 ? 3 : 5;
        Header header = new Header(
            merkleRoot, 
            LocalDateTime.now(),
            hashPrecedent,
                target,
            0);
        Bloc newBlock = new Bloc(header,body);

        // Find Nonce 
        if(proofOfWork(newBlock))
        {
            blockchain.add(newBlock);
        }
        remplirMempool();
        sauvegarderEnJson();
    }

    int choisirUtilisateur()
    {
        Random randomNumbers = new Random();
        int index = randomNumbers.nextInt(userList.size() + 1);
        if(index == userList.size() && index < 2000)
        {
            userList.add(genererRandomString());
        }
        if(index == 2000) return index - 1;
        return index;
    }

    List<Transaction> choisirTransactions()
    {
        List<Transaction> transactions = new ArrayList<>();
        while(mempool.size()>0 && transactions.size()<=100)
        {
            transactions.add(mempool.get(0));
            mempool.remove(0);
        }
        return transactions;
    }

    void ajouterTransaction()
    {
        int expediteur = choisirUtilisateur();
        double solde = obtenirSolde(expediteur);
        if(solde < 0.05)
        {
            return;
        }
        int destinataire = choisirUtilisateur();
        if(expediteur == destinataire) return;
        Random randNumber = new Random();
        double quantite = randNumber.nextDouble()*solde;
        double frais = randNumber.nextDouble()*quantite;
        if(quantite + frais > solde)
        {
            quantite = quantite / 3.0;
            frais = frais / 3.0;
        }
        Transaction transaction = new Transaction(
            userList.get(expediteur), 
            userList.get(destinataire), 
            quantite,
            frais
        );
        mempool.add(transaction);
    }


    public double obtenirSolde(int index)
    {
        double solde = 0.0;
        String adresse = userList.get(index);
        List<Transaction> transactions = new ArrayList<>(); 
        List<CoinBase> coinbaseTrans = new ArrayList<>();

        for(Bloc block : blockchain)
        {
            Body body = block.getBlockBody();
            CoinBase coinBase = body.getCoinBaseTrans();
            if(coinBase.getMineur() == adresse)
            {
                coinbaseTrans.add(coinBase);
            }
            List<Transaction> transList = body.getTransactionList();
            for(Transaction transaction : transList)
            {
                if(
                    transaction.getExpediteur() == adresse ||
                    transaction.getDestinataire() == adresse
                ){
                    transactions.add(transaction);
                }
            } 
        }

        for (CoinBase transaction : coinbaseTrans)
        {
            if(transaction.getMineur() == adresse)
            {
                solde += transaction.getRecompense();
            }
        }
        for (Transaction transaction : transactions)
        {
            if(transaction.getExpediteur() == adresse)
            {
                solde -= (transaction.getQuantite() + transaction.getFrais());
            }
            if(transaction.getDestinataire() == adresse)
            {
                solde += transaction.getQuantite();
            }
        }
        for (Transaction transaction : mempool)
        {
            if(transaction.getExpediteur() == adresse)
            {
                solde -= (transaction.getQuantite() + transaction.getFrais());
            }
            if(transaction.getDestinataire() == adresse)
            {
                solde += transaction.getQuantite();
            }
        }
        return solde;
    }

}

class SortByFee implements Comparator<Transaction>{
    public int compare(Transaction t1, Transaction t2){    
        return Double.compare(t2.getFrais(),t1.getFrais());
    }
}


