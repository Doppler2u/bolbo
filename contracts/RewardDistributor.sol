// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract RewardDistributor is Ownable {
    uint256 public constant INITIAL_REWARD = 100 * 10 ** 18; // 100 BOLBO
    uint256 public constant HALVING_INTERVAL = 100_000; // solves
    
    uint256 public totalSolves;
    
    address public miningManager;

    constructor() Ownable(msg.sender) {}

    function setMiningManager(address _miningManager) external onlyOwner {
        miningManager = _miningManager;
    }

    modifier onlyMiningManager() {
        require(msg.sender == miningManager, "Only MiningManager");
        _;
    }

    function calculateReward() external onlyMiningManager returns (uint256) {
        uint256 halvings = totalSolves / HALVING_INTERVAL;
        uint256 currentReward = INITIAL_REWARD >> halvings; // Divides by 2^halvings
        
        totalSolves++;
        
        return currentReward;
    }
}
