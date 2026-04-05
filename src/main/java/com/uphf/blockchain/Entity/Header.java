package com.uphf.blockchain.Entity;
import java.time.LocalDateTime;


public  class Header {
    String MerkleRoot;
    LocalDateTime TimeStamp;
    String HashPre;
    int  Target;
    int Nonce ;

    public Header(String merkleRoot, LocalDateTime timeStamp, String hashPre, int target, int nonce) {
        MerkleRoot = merkleRoot;
        TimeStamp = timeStamp;
        HashPre = hashPre;
        Target = target;
        Nonce = nonce;
    }

    public Header() {}

    public String getMerkleRoot() {
        return MerkleRoot;
    }

    public void setMerkleRoot(String merkleRoot) {
        MerkleRoot = merkleRoot;
    }

    public LocalDateTime getTimeStamp() {
        return TimeStamp;
    }

    public void setTimeStamp(LocalDateTime timeStamp) {
        TimeStamp = timeStamp;
    }

    public String getHashPre() {
        return HashPre;
    }

    public void setHashPre(String hashPre) {
        HashPre = hashPre;
    }

    public int  getTarget() {
        return Target;
    }

    public void setTarget(int target) {
        Target = target;
    }

    public int getNonce() {
        return Nonce;
    }

    public void setNonce(int nonce) {
        Nonce = nonce;
    }
}
