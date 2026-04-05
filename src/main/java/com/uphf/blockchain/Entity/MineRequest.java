package com.uphf.blockchain.Entity;

import java.util.List;

public class MineRequest {
    private List<String> txIDs;
    private int target;

    // Getters and Setters (Important for Spring to see the data!)
    public List<String> getTxIDs() { return txIDs; }
    public void setTxIDs(List<String> txIDs) { this.txIDs = txIDs; }
    public int getTarget() { return target; }
    public void setTarget(int target) { this.target = target; }
}
