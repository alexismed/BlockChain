package com.uphf.blockchain.Entity;

public class Bloc {
    Header BlockHeader;
    Body BlockBody;
    String HashBlock;

    public Bloc(Header blockHeader, Body blockBody) {
        BlockHeader = blockHeader;
        BlockBody = blockBody;
        HashBlock = "00000f5df79a42d6e45525898813a818ce604c4692960d6f4c6b29471039ea33";
    }

    public Body getBlockBody() {
        return BlockBody;
    }

    public void setBlockBody(Body blockBody) {
        BlockBody = blockBody;
    }

    public Header getBlockHeader() {
        return BlockHeader;
    }

    public void setBlockHeader(Header blockHeader) {
        BlockHeader = blockHeader;
    }

    public void setHashBlock(String hash) {
        HashBlock = hash;
    }

    public String getHashBlock() {
        return HashBlock;
    }
}
