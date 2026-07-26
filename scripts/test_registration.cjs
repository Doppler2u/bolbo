const { ethers } = require('ethers');

const provider = new ethers.JsonRpcProvider('https://xlayertestrpc.okx.com');
const AGENT_REGISTRY = "0x29E7D46456dB21962e2205de9aC7d4097F47Cdc1";
const ASP_WALLET = "0x3308C4d202F0572062Fc72BC5Ec413525a223fD9";

async function run() {
    console.log("Querying AgentRegistry for Cloud ASP Wallet: " + ASP_WALLET + "...\n");
    
    const arAbi = ["function agents(address) external view returns (address wallet, uint256 totalMinted, uint256 solves, uint256 score, string metadata, uint256 stakedAmount)"];
    const registry = new ethers.Contract(AGENT_REGISTRY, arAbi, provider);
    
    const aspData = await registry.agents(ASP_WALLET);
    
    if (aspData.wallet === ethers.ZeroAddress) {
        console.log("❌ ASP is NOT registered yet.");
    } else {
        console.log("✅ ASP IS FULLY REGISTERED!");
        console.log("-----------------------------------");
        console.log("Wallet Address:", aspData.wallet);
        console.log("Total Tokens Minted:", ethers.formatEther(aspData.totalMinted), "BOLBO");
        console.log("Total Puzzles Solved:", aspData.solves.toString());
        console.log("Agent Reputation Score:", aspData.score.toString());
        console.log("-----------------------------------");
    }
}

run().catch(console.error);
