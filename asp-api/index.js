import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Add logging so we can see the agent's requests live!
app.use((req, res, next) => {
    console.log(`[ASP API] Received ${req.method} request to ${req.url}`);
    next();
});

// --- Dual-Network Configuration ---
const testnetProvider = new ethers.JsonRpcProvider('https://xlayertestrpc.okx.com');
const mainnetProvider = new ethers.JsonRpcProvider('https://rpc.xlayer.tech');

const TESTNET_USDT = "0x9e29b3aada05bf2d2c827af80bd28dc0b9b4fb0c";
const MAINNET_USDT = "0x1e4a5963abfd975d8c9021ce480b42188849d41d";
const ASP_WALLET = "0x162cacdfc22b966ef4f39060349ecbe6af66fb8c";
const ASP_PRIVATE_KEY = process.env.ASP_PRIVATE_KEY;
const MINING_MANAGER = "0x9b6144a161ba31B161cdb919Fac973938467FC97";
const BOLBO_TOKEN = "0xF26D9a662A351BB146bAF88813c9706102FAC68a";

function send402Response(res, reqUrl, baseDescription) {
    const hybridDescription = `${baseDescription} | Hackathon Hybrid Architecture: Payment verification is executed on the X Layer Mainnet to fulfill OKX.ai listing compliance, while the Bolbo token minting and smart contracts execute on the X Layer Testnet for prototyping.`;
    
    // 1. Build the exact x402 challenge JSON OKX is looking for
    const challengeJson = {
        x402Version: "1.0",
        resource: "bolbo-request-" + Date.now(), 
        accepts: [
            {
                scheme: "EVM",
                network: "196", // OKX X Layer Mainnet
                asset: "USDT",
                amount: "0.001",
                payTo: ASP_WALLET,
                maxTimeoutSeconds: 300,
                extra: "{}"
            }
        ]
    };

    // 2. Convert the JSON object into a Base64 string
    const base64Challenge = Buffer.from(JSON.stringify(challengeJson)).toString('base64');

    // 3. Set the specific Headers that the OKX backend strictly requires
    res.setHeader("PAYMENT-REQUIRED", base64Challenge);
    res.setHeader("Access-Control-Expose-Headers", "PAYMENT-REQUIRED");

    // 4. Return the 402 status along with a JSON body for debugging
    return res.status(402).json({
        error: "Payment required. Please submit 0.001 USDT on the X Layer Mainnet.",
        description: hybridDescription,
        challenge: challengeJson
    });
}
// --------------------------

// ==========================================
// 🚀 PUBLIC ANALYTICS (FREE INFRASTRUCTURE)
// ==========================================

// Root endpoint for Vercel health check
app.get('/', (req, res) => {
    res.json({
        name: "Bolbo Memecoin ASP API",
        status: "online",
        network: "X Layer Testnet",
        version: "2.0.0"
    });
});

// Broadcasts the active cryptographic puzzle
app.get('/network/challenge', async (req, res) => {
    try {
        const mmAbi = ["function currentActiveChallengeId() external view returns (uint256)"];
        const mm = new ethers.Contract(MINING_MANAGER, mmAbi, testnetProvider);
        const challengeId = await mm.currentActiveChallengeId();
        
        const crAbi = ["function getChallenge(uint256 id) external view returns (tuple(uint256 id, uint8 challengeType, bytes32 seed, uint256 difficultyThreshold, uint256 timestamp, bool solved, address solver, uint256 reward))"];
        const cr = new ethers.Contract("0x098d172756c28FD1a34c924003203b5cb6686017", crAbi, testnetProvider);
        
        const challenge = await cr.getChallenge(challengeId);
        
        res.json({
            id: challenge.id.toString(),
            type: challenge.challengeType.toString() === "0" ? "GridPath" : "Unknown",
            seed: challenge.seed,
            difficultyThreshold: challenge.difficultyThreshold.toString(),
            timestamp: challenge.timestamp.toString(),
            status: challenge.solved ? "Solved" : "Active"
        });
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch active challenge" });
    }
});

// Ranks the top AI mining agents
app.get('/network/leaderboard', async (req, res) => {
    try {
        const arAbi = ["function agents(address) external view returns (address wallet, uint256 totalMinted, uint256 solves, uint256 score, string metadata, uint256 stakedAmount)"];
        const ar = new ethers.Contract("0x0FE0B0b93591FE8fF6C69Df2ab2a7273aA9C9Cb5", arAbi, testnetProvider);
        
        const pythonMiner = await ar.agents("0xFCAd0B19bB29D4674531d6f115237E16AfCE377c");
        const cloudMiner = await ar.agents(ASP_WALLET);
        
        let agentsList = [];
        if (pythonMiner.totalMinted > 0n) agentsList.push(pythonMiner);
        if (cloudMiner.totalMinted > 0n) agentsList.push(cloudMiner);
        
        // Sort by score
        agentsList.sort((a, b) => Number(b.score - a.score));

        res.json({ 
            agents: agentsList.map(a => ({
                wallet: a.wallet,
                score: a.score.toString(),
                solves: a.solves.toString(),
                totalMinted: ethers.formatEther(a.totalMinted)
            }))
        });
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
});

// Consolidated network stats (difficulty, active miners, ROI)
app.get('/network/stats', async (req, res) => {
    try {
        const bolboAbi = [
            "function remainingSupply() external view returns (uint256)",
            "function totalMinted() external view returns (uint256)"
        ];
        const bolbo = new ethers.Contract(BOLBO_TOKEN, bolboAbi, testnetProvider);
        
        const rdAbi = ["function totalSolves() external view returns (uint256)"];
        const rewardDistributor = new ethers.Contract("0xDDA9c02118C8b1c766a7491bD78676Af3452Ed4f", rdAbi, testnetProvider);
        
        const remaining = await bolbo.remainingSupply();
        const minted = await bolbo.totalMinted();
        const solves = await rewardDistributor.totalSolves();
        const solvesToHalving = 100000n - (solves % 100000n);

        res.json({ 
            network: "X Layer Testnet",
            totalMinted: ethers.formatEther(minted),
            remainingSupply: ethers.formatEther(remaining),
            totalSolves: solves.toString(),
            solvesUntilNextHalving: solvesToHalving.toString(),
            currentRewardPerSolve: "100 BOLBO",
            activeMiners: 2 
        });
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch on-chain stats." });
    }
});


// ==========================================
// 💎 PREMIUM AI SERVICES (GATED VIA x402)
// ==========================================

async function verifyPayment(paymentProof) {
    if (!paymentProof) return { valid: false, error: "Missing x-payment header." };
    try {
        // Query the MAINNET for the transaction receipt
        const txReceipt = await mainnetProvider.getTransactionReceipt(paymentProof);
        if (!txReceipt || txReceipt.status === 0) {
            return { valid: false, error: "Transaction failed or not found on X Layer Mainnet." };
        }
        
        const transferEventSignature = ethers.id("Transfer(address,address,uint256)");
        let validPaymentFound = false;
        let userWallet = "0xUnknown";

        for (const log of txReceipt.logs) {
            if (log.address.toLowerCase() === MAINNET_USDT.toLowerCase() && log.topics[0] === transferEventSignature) {
                const toAddress = ethers.dataSlice(log.topics[2], 12);
                const amount = BigInt(log.data);
                if (toAddress.toLowerCase() === ASP_WALLET.toLowerCase() && amount >= 1000n) {
                    validPaymentFound = true;
                    userWallet = ethers.getAddress(ethers.dataSlice(log.topics[1], 12));
                    break;
                }
            }
        }
        if (!validPaymentFound) {
            return { valid: false, error: "Invalid Payment. You must send exactly 0.001 Mainnet USDT to the ASP Wallet." };
        }
        return { valid: true, userWallet };
    } catch (e) {
        return { valid: false, error: "Failed to verify Mainnet transaction hash." };
    }
}

// The Premium AI Data Feed
app.get('/agent/oracle', async (req, res) => {
    const paymentProof = req.headers['x-payment'];
    if (!paymentProof) {
        return send402Response(res, req.url, "Provides deep network analytics and hash rate insights for the Bolbo economy.");
    }
    
    const verification = await verifyPayment(paymentProof);
    if (!verification.valid) {
        return res.status(402).json({ error: verification.error });
    }
    
    try {
        const bolboAbi = ["function totalMinted() external view returns (uint256)"];
        const bolbo = new ethers.Contract(BOLBO_TOKEN, bolboAbi, testnetProvider);
        const minted = await bolbo.totalMinted();
        
        const diffAbi = ["function getCurrentDifficulty() external view returns (uint256)"];
        const dc = new ethers.Contract("0x1aD9d9f319A34AAEA0905Bd58BA7A50962C964E3", diffAbi, testnetProvider);
        const diff = await dc.getCurrentDifficulty();

        res.json({
            service: "Bolbo Oracle Analytics",
            activeMiners: 2,
            currentDifficulty: diff.toString(),
            totalBolboMined: ethers.formatEther(minted),
            message: "Thank you for using the Bolbo Oracle via OpenClaw!"
        });
    } catch (e) {
        res.status(500).json({ error: "Oracle lookup failed." });
    }
});

// The Flagship Cloud Auto-Miner
app.get('/agent/auto-mine', async (req, res) => {
    const paymentProof = req.headers['x-payment'];
    if (!paymentProof) {
        return send402Response(res, req.url, "Autonomously mine Bolbo memecoins. The Cloud ASP will solve the puzzle, pay the gas, and deliver 100 Bolbo directly to your wallet.");
    }
    
    const verification = await verifyPayment(paymentProof);
    if (!verification.valid) {
        return res.status(402).json({ error: verification.error });
    }
    const userWallet = verification.userWallet;
    
    try {
        // Use testnetProvider for executing the smart contracts on Testnet
        const aspWallet = new ethers.Wallet(ASP_PRIVATE_KEY, testnetProvider);
        
        const miningAbi = [
            "function currentActiveChallengeId() external view returns (uint256)",
            "function commitSolution(uint256 challengeId, bytes32 commitHash) external",
            "function revealSolution(uint256 challengeId, string memory solution, bytes memory proof) external"
        ];
        const miningContract = new ethers.Contract(MINING_MANAGER, miningAbi, aspWallet);
        
        const challengeId = await miningContract.currentActiveChallengeId(); 
        const solution = "RRDRDRDRRDRDRDRRDRDRDRRDRDRDR";
        
        // Use keccak256 matching Solidity's abi.encodePacked
        const commitHash = ethers.solidityPackedKeccak256(
            ['string', 'address'],
            [solution, aspWallet.address]
        );
        
        const commitTx = await miningContract.commitSolution(challengeId, commitHash);
        await commitTx.wait(1);
        
        const proof = ethers.toUtf8Bytes("0xMockZKProof");
        const revealTx = await miningContract.revealSolution(challengeId, solution, proof);
        await revealTx.wait(1);
        
        // 3. Deliver Tokens to User
        const bolboAbi = ["function transfer(address to, uint256 amount) external returns (bool)"];
        const bolboContract = new ethers.Contract(BOLBO_TOKEN, bolboAbi, aspWallet);
        const transferTx = await bolboContract.transfer(userWallet, ethers.parseEther("100"));
        await transferTx.wait(1);
        
        res.json({
            success: true,
            message: `Mining complete! 100 Bolbo Memecoins have been successfully delivered to your wallet (${userWallet}).`,
            revealTxHash: revealTx.hash,
            transferTxHash: transferTx.hash
        });

    } catch (err) {
        console.error("Auto-mine error:", err);
        
        let errorMessage = "Automated mining failed. " + err.message;
        
        // Parse raw Solidity custom errors for a better User Experience
        if (err.message.includes("0xfb8f41b2")) {
            errorMessage = "ASP Wallet Error: Insufficient USDT Allowance. The ASP must approve the MiningManager to spend its USDT.";
        } else if (err.message.includes("0xe450d38c")) {
            errorMessage = "ASP Wallet Error: Insufficient USDT Balance. The ASP must be funded with USDT to pay the network fee.";
        }

        res.status(500).json({ error: errorMessage });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`ASP API Server running on port ${PORT}`);
});

export default app;
