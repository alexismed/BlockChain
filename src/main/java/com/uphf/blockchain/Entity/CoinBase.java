package com.uphf.blockchain.Entity;

public class CoinBase{
    String Mineur;
    Double Recompense;
    int ExtraNonce;

    public CoinBase(String mineur, Double recompense, int extraNonce) {
        Mineur = mineur;
        Recompense = recompense;
        ExtraNonce = extraNonce;
    }

    public CoinBase() {}

    public String getMineur() {
        return Mineur;
    }

    public void setMineur(String mineur) {
        Mineur = mineur;
    }

    public Double getRecompense() {
        return Recompense;
    }

    public void setRecompense(Double recompense) {
        Recompense = recompense;
    }

    public int getExtraNonce() {
        return ExtraNonce;
    }

    public void setExtraNonce(int extraNonce) {
        ExtraNonce = extraNonce;
    }
}
