package com.uphf.blockchain.Entity;

import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.Signature;
import java.util.Base64;

public class Transaction {
    String Expediteur;
    String Destinataire;
    Double Quantite;
    Double Frais;
    String SignatureTx;

    public Transaction() {}

    public Transaction(String expediteur, String destinataire, Double quantite, Double frais) {
        this.Expediteur = expediteur;
        this.Destinataire = destinataire;
        this.Quantite = quantite;
        this.Frais = frais;
    }

    public void signerTransaction(PrivateKey privateKey) {
        try {
            String donnees = Expediteur + Destinataire + Quantite;
            Signature rsa = Signature.getInstance("SHA256withRSA");
            rsa.initSign(privateKey);
            rsa.update(donnees.getBytes());
            byte[] signatureBytes = rsa.sign();
            this.SignatureTx = Base64.getEncoder().encodeToString(signatureBytes);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la signature", e);
        }
    }

    public boolean verifierSignature(PublicKey publicKey) {
        if (this.SignatureTx == null) return false;
        try {
            String donnees = Expediteur + Destinataire + Quantite;
            Signature rsa = Signature.getInstance("SHA256withRSA");
            rsa.initVerify(publicKey);
            rsa.update(donnees.getBytes());
            byte[] signatureBytes = Base64.getDecoder().decode(this.SignatureTx);
            return rsa.verify(signatureBytes);
        } catch (Exception e) {
            return false;
        }
    }

    public Double getQuantite() {
        return Quantite;
    }

    public void setQuantite(Double quantite) {
        Quantite = quantite;
    }

    public Double getFrais() {
        return Frais;
    }

    public void setFrais(Double frais) {
        Frais = frais;
    }

    public String getDestinataire() {
        return Destinataire;
    }

    public void setDestinataire(String destinataire) {
        Destinataire = destinataire;
    }

    public String getExpediteur() {
        return Expediteur;
    }

    public void setExpediteur(String expediteur) {
        Expediteur = expediteur;
    }

    public String getSignatureTx() {
        return SignatureTx;
    }

    public void setSignatureTx(String signatureTx) {
        SignatureTx = signatureTx;
    }
}