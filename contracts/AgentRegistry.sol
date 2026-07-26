// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AgentRegistry is Ownable {
    
    struct Agent {
        address wallet;
        uint256 totalMinted;
        uint256 solves;
        uint256 score;
        string metadata; // IPFS hash or URL
        uint256 stakedAmount; // Staked OKB for sybil protection
    }

    mapping(address => Agent) public agents;
    address public miningManager;

    constructor() Ownable(msg.sender) {}

    function setMiningManager(address _miningManager) external onlyOwner {
        miningManager = _miningManager;
    }

    modifier onlyMiningManager() {
        require(msg.sender == miningManager, "Only MiningManager");
        _;
    }

    function registerAgent(string memory metadata) external payable {
        require(agents[msg.sender].wallet == address(0), "Already registered");
        // Removed: require(msg.value >= 0.01 ether, "Requires 0.01 OKB stake");
        
        agents[msg.sender] = Agent({
            wallet: msg.sender,
            totalMinted: 0,
            solves: 0,
            score: 0,
            metadata: metadata,
            stakedAmount: msg.value // Will typically be 0 now
        });
    }

    function updateAgentStats(address wallet, uint256 mintedAmount) external onlyMiningManager {
        if (agents[wallet].wallet == address(0)) {
            // Auto-register if not registered
            agents[wallet] = Agent({
                wallet: wallet,
                totalMinted: 0,
                solves: 0,
                score: 0,
                metadata: "",
                stakedAmount: 0 // Auto-registered by manager has no stake
            });
        }
        
        agents[wallet].totalMinted += mintedAmount;
        agents[wallet].solves += 1;
        agents[wallet].score += 10; // Simple scoring metric
    }
}
