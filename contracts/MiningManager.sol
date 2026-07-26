// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./BolboToken.sol";
import "./ChallengeRegistry.sol";
import "./DifficultyController.sol";
import "./RewardDistributor.sol";
import "./AgentRegistry.sol";

contract MiningManager is Ownable {
    BolboToken public token;
    ChallengeRegistry public challengeRegistry;
    DifficultyController public difficultyController;
    RewardDistributor public rewardDistributor;
    AgentRegistry public agentRegistry;
    
    IERC20 public usdtToken; // Testnet USDT0
    uint256 public constant SUBMISSION_FEE = 0.001 * 10 ** 18; // Mock 18 decimals for USDT0 fee

    uint256 public currentActiveChallengeId;
    
    // Commit-Reveal mapping: ChallengeID -> (Miner Address -> Commit Hash)
    mapping(uint256 => mapping(address => bytes32)) public solutionCommits;

    event SolutionCommitted(uint256 indexed challengeId, address indexed committer);
    event ChallengeSolved(uint256 indexed challengeId, address indexed solver, uint256 reward);
    event NextChallengeGenerated(uint256 indexed challengeId, uint256 difficulty);

    constructor(
        address _token,
        address _challengeRegistry,
        address _difficultyController,
        address _rewardDistributor,
        address _agentRegistry,
        address _usdtToken
    ) Ownable(msg.sender) {
        token = BolboToken(_token);
        challengeRegistry = ChallengeRegistry(_challengeRegistry);
        difficultyController = DifficultyController(_difficultyController);
        rewardDistributor = RewardDistributor(_rewardDistributor);
        agentRegistry = AgentRegistry(_agentRegistry);
        usdtToken = IERC20(_usdtToken);
    }

    function commitSolution(uint256 challengeId, bytes32 commitHash) external {
        require(challengeId == currentActiveChallengeId, "Not the active challenge");
        solutionCommits[challengeId][msg.sender] = commitHash;
        emit SolutionCommitted(challengeId, msg.sender);
    }

    function revealSolution(
        uint256 challengeId,
        string memory solution,
        bytes memory proof
    ) external {
        require(challengeId == currentActiveChallengeId, "Not the active challenge");
        
        // 1. MEV Protection: Verify the commit hash matches the revealed solution
        bytes32 expectedHash = keccak256(abi.encodePacked(solution, msg.sender));
        require(solutionCommits[challengeId][msg.sender] == expectedHash, "Invalid commit reveal or MEV attempted");
        
        // Clear the commit to prevent replay
        delete solutionCommits[challengeId][msg.sender];

        // Charge x402 API Fee in USDT (6 decimals for official USDT: 0.001 USDT = 1000)
        uint256 fee = 1000;
        require(usdtToken.transferFrom(msg.sender, address(this), fee), "Fee payment failed");

        // 3. Verify ZK Proof (Off-chain computation validity)
        bool isValid = _verifyZKProof(challengeId, solution, proof);
        require(isValid, "Invalid ZK proof");

        // 4. Distribution and State Updates
        uint256 reward = rewardDistributor.calculateReward();
        challengeRegistry.markSolved(challengeId, msg.sender, reward);
        token.mint(msg.sender, reward);
        difficultyController.recordSolveTime();
        agentRegistry.updateAgentStats(msg.sender, reward);

        emit ChallengeSolved(challengeId, msg.sender, reward);

        _generateNextChallenge();
    }

    function _verifyZKProof(uint256 challengeId, string memory solution, bytes memory proof) internal view returns (bool) {
        // ZK Verification logic placeholder
        // In a real environment, we would use RiscZero or SP1 verifier contracts here
        return bytes(solution).length > 0 && proof.length > 0;
    }

    function generateNextChallenge() external onlyOwner {
        _generateNextChallenge();
    }

    function _generateNextChallenge() internal {
        // 1. Select challenge type (random or rotating). Mocked as 0 (GridPath)
        uint8 challengeType = 0; 
        
        // 2. Generate seed
        bytes32 seed = keccak256(abi.encodePacked(block.timestamp, blockhash(block.number - 1)));
        
        // 3. Get current difficulty
        uint256 difficulty = difficultyController.getCurrentDifficulty();
        
        // 4. Create challenge on-chain
        currentActiveChallengeId = challengeRegistry.createChallenge(challengeType, seed, difficulty);
        
        emit NextChallengeGenerated(currentActiveChallengeId, difficulty);
    }
}
