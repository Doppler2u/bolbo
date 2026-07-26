const { ethers } = require('ethers');

const provider = new ethers.JsonRpcProvider('https://xlayertestrpc.okx.com');
const MINING_MANAGER = "0xC0784Bd84BBad8053aB21dB97562ba1345a07132";

async function run() {
    const abi = [
        "function challengeRegistry() external view returns (address)",
        "function difficultyController() external view returns (address)",
        "function agentRegistry() external view returns (address)",
        "function rewardDistributor() external view returns (address)"
    ];
    const mm = new ethers.Contract(MINING_MANAGER, abi, provider);
    
    console.log("ChallengeRegistry:", await mm.challengeRegistry());
    console.log("DifficultyController:", await mm.difficultyController());
    console.log("AgentRegistry:", await mm.agentRegistry());
    console.log("RewardDistributor:", await mm.rewardDistributor());
}

run().catch(console.error);
