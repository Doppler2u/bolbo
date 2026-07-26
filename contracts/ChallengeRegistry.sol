// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ChallengeRegistry is Ownable {
    
    struct Challenge {
        uint256 id;
        uint8 challengeType; // 0: GridPath, 1: Constraint, 2: Optimization
        bytes32 seed;
        uint256 difficultyThreshold;
        uint256 timestamp;
        bool solved;
        address solver;
        uint256 reward;
    }

    mapping(uint256 => Challenge) public challenges;
    uint256 public nextChallengeId;
    address public miningManager;

    constructor() Ownable(msg.sender) {}

    function setMiningManager(address _miningManager) external onlyOwner {
        miningManager = _miningManager;
    }

    modifier onlyMiningManager() {
        require(msg.sender == miningManager, "Only MiningManager");
        _;
    }

    function createChallenge(
        uint8 challengeType,
        bytes32 seed,
        uint256 difficultyThreshold
    ) external onlyMiningManager returns (uint256) {
        uint256 id = nextChallengeId++;
        challenges[id] = Challenge({
            id: id,
            challengeType: challengeType,
            seed: seed,
            difficultyThreshold: difficultyThreshold,
            timestamp: block.timestamp,
            solved: false,
            solver: address(0),
            reward: 0
        });
        return id;
    }

    function markSolved(
        uint256 challengeId,
        address solver,
        uint256 reward
    ) external onlyMiningManager {
        require(challengeId < nextChallengeId, "Invalid challenge ID");
        require(!challenges[challengeId].solved, "Already solved");
        
        challenges[challengeId].solved = true;
        challenges[challengeId].solver = solver;
        challenges[challengeId].reward = reward;
    }

    function getChallenge(uint256 id) external view returns (Challenge memory) {
        require(id < nextChallengeId, "Invalid challenge ID");
        return challenges[id];
    }
}
