// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract DifficultyController is Ownable {
    uint256 public currentDifficulty = 500;
    uint256 public constant MINIMUM_DIFFICULTY = 10;
    uint256 public constant TARGET_SOLVE_TIME = 60; // seconds
    uint256 public constant ADJUSTMENT_WINDOW = 100; // solves
    
    uint256 public solveCount;
    uint256 public lastAdjustmentTimestamp;
    
    address public miningManager;

    constructor() Ownable(msg.sender) {
        lastAdjustmentTimestamp = block.timestamp;
    }

    function setMiningManager(address _miningManager) external onlyOwner {
        miningManager = _miningManager;
    }

    modifier onlyMiningManager() {
        require(msg.sender == miningManager, "Only MiningManager");
        _;
    }

    function getCurrentDifficulty() external view returns (uint256) {
        return currentDifficulty;
    }

    function recordSolveTime() external onlyMiningManager {
        solveCount++;
        
        if (solveCount % ADJUSTMENT_WINDOW == 0) {
            uint256 timeSinceLastAdjustment = block.timestamp - lastAdjustmentTimestamp;
            uint256 averageSolveTime = timeSinceLastAdjustment / ADJUSTMENT_WINDOW;
            
            if (averageSolveTime < 60) {
                // Increase difficulty by 5%
                currentDifficulty = (currentDifficulty * 105) / 100;
            } else if (averageSolveTime > 120) {
                // Decrease difficulty by 5%
                currentDifficulty = (currentDifficulty * 95) / 100;
                if (currentDifficulty < MINIMUM_DIFFICULTY) {
                    currentDifficulty = MINIMUM_DIFFICULTY;
                }
            }
            
            lastAdjustmentTimestamp = block.timestamp;
        }
    }
}
