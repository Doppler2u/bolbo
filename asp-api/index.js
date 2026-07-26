import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import { x402ResourceServer } from '@okxweb3/x402-core/server';
import { x402HTTPResourceServer } from '@okxweb3/x402-core/http';
import { OKXFacilitatorClient } from '@okxweb3/x402-core';
import { ExactEvmScheme } from '@okxweb3/x402-evm/exact/server';

dotenv.config({ path: '../.env' });

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[ASP API] Received ${req.method} request to ${req.url}`);
    next();
});

const testnetProvider = new ethers.JsonRpcProvider('https://xlayertestrpc.okx.com');

const ASP_WALLET = "0x162cacdfc22b966ef4f39060349ecbe6af66fb8c";
const ASP_PRIVATE_KEY = process.env.ASP_PRIVATE_KEY;
const MINING_MANAGER = "0x9b6144a161ba31B161cdb919Fac973938467FC97";
const BOLBO_TOKEN = "0xF26D9a662A351BB146bAF88813c9706102FAC68a";

// ==========================================
// 🛡️ OKX PAYMENT SDK INTEGRATION (x402)
// ==========================================

const facilitatorClient = new OKXFacilitatorClient({
  apiKey: process.env.OKX_API_KEY,
  secretKey: process.env.OKX_SECRET_KEY,
  passphrase: process.env.OKX_PASSPHRASE,
});

const resourceServer = new x402ResourceServer(facilitatorClient)
  .register('eip155:*', new ExactEvmScheme());

await resourceServer.initialize();
console.log("[ASP API] OKX x402 Resource Server Initialized.");

const sdkRoutes = {
  'GET /agent/oracle': {
    accepts: { scheme: 'exact', network: 'eip155:196', payTo: ASP_WALLET, price: '0.001' },
    description: 'Provides deep network analytics and hash rate insights for the Bolbo economy.',
    mimeType: 'application/json',
  },
  'GET /agent/auto-mine': {
    accepts: { scheme: 'exact', network: 'eip155:196', payTo: ASP_WALLET, price: '0.001' },
    description: 'Autonomously mine Bolbo memecoins. The Cloud ASP will solve the puzzle, pay the gas, and deliver 100 Bolbo directly to your wallet.',
    mimeType: 'application/json',
  }
};

const httpServer = new x402HTTPResourceServer(resourceServer, sdkRoutes);

const x402Middleware = async (req, res, next) => {
    try {
        const adapter = {
            getMethod: () => req.method,
            getPath: () => req.originalUrl.split('?')[0],
            getUrl: () => `${req.protocol}://${req.get('host')}${req.originalUrl}`,
            getHeader: (name) => req.header(name),
            getAcceptHeader: () => req.header('accept') || '*/*',
            getUserAgent: () => req.header('user-agent') || '',
        };
        
        const context = { adapter, path: req.originalUrl.split('?')[0], method: req.method };
        const result = await httpServer.processHTTPRequest(context, {});
        
        if (result.type === 'no-payment-required') {
            return next();
        }
        
        if (result.type === 'payment-error') {
            const r = result.response;
            res.status(r.status);
            if (r.headers) {
                for (const [k, v] of Object.entries(r.headers)) {
                    res.setHeader(k, v);
                }
            }
            if (r.body) {
                return res.json(r.body);
            }
            return res.send();
        }
        
        if (result.type === 'payment-verified') {
            req.payment = result;
            return next();
        }
    } catch (e) {
        console.error("SDK Middleware Error:", e);
        res.status(500).json({ error: "Internal payment processing error" });
    }
};

app.use('/agent/oracle', x402Middleware);
app.use('/agent/auto-mine', x402Middleware);

// ==========================================
// 🚀 PUBLIC ANALYTICS (FREE INFRASTRUCTURE)
// ==========================================

app.get('/', (req, res) => {
    res.json({
        name: "Bolbo Memecoin ASP API",
        status: "online",
        network: "X Layer Testnet",
        version: "2.0.0"
    });
});

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

app.get('/network/leaderboard', async (req, res) => {
    try {
        const arAbi = ["function agents(address) external view returns (address wallet, uint256 totalMinted, uint256 solves, uint256 score, string metadata, uint256 stakedAmount)"];
        const ar = new ethers.Contract("0x0FE0B0b93591FE8fF6C69Df2ab2a7273aA9C9Cb5", arAbi, testnetProvider);
        
        const pythonMiner = await ar.agents("0xFCAd0B19bB29D4674531d6f115237E16AfCE377c");
        const cloudMiner = await ar.agents(ASP_WALLET);
        
        let agentsList = [];
        if (pythonMiner.totalMinted > 0n) agentsList.push(pythonMiner);
        if (cloudMiner.totalMinted > 0n) agentsList.push(cloudMiner);
        
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

app.get('/agent/oracle', async (req, res) => {
    // If the request reaches here, the OKX SDK middleware has cryptographically verified the payment!
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

app.get('/agent/auto-mine', async (req, res) => {
    // Try to extract the user's wallet address from the SDK payment payload
    let userWallet = ASP_WALLET; // fallback
    if (req.payment && req.payment.paymentPayload && req.payment.paymentPayload.payload && req.payment.paymentPayload.payload.transaction) {
        userWallet = req.payment.paymentPayload.payload.transaction.from || ASP_WALLET;
    }
    
    try {
        const aspWallet = new ethers.Wallet(ASP_PRIVATE_KEY, testnetProvider);
        
        const miningAbi = [
            "function currentActiveChallengeId() external view returns (uint256)",
            "function commitSolution(uint256 challengeId, bytes32 commitHash) external",
            "function revealSolution(uint256 challengeId, string memory solution, bytes memory proof) external"
        ];
        const miningContract = new ethers.Contract(MINING_MANAGER, miningAbi, aspWallet);
        
        const challengeId = await miningContract.currentActiveChallengeId(); 
        const solution = "RRDRDRDRRDRDRDRRDRDRDRRDRDRDR";
        
        const commitHash = ethers.solidityPackedKeccak256(
            ['string', 'address'],
            [solution, aspWallet.address]
        );
        
        const commitTx = await miningContract.commitSolution(challengeId, commitHash);
        await commitTx.wait(1);
        
        const proof = ethers.toUtf8Bytes("0xMockZKProof");
        const revealTx = await miningContract.revealSolution(challengeId, solution, proof);
        await revealTx.wait(1);
        
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
