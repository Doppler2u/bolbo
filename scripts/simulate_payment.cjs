const { ethers } = require('ethers');

const provider = new ethers.JsonRpcProvider('https://xlayertestrpc.okx.com');
// Using the Python Miner wallet to simulate a user paying the ASP
const userWallet = new ethers.Wallet('0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', provider);
const ASP_WALLET = "0x3308C4d202F0572062Fc72BC5Ec413525a223fD9";

async function run() {
    console.log("1. Simulating OpenClaw User Payment...");
    // Just send a 0-value transaction to act as our "proof of payment" for the hackathon MVP
    const tx = await userWallet.sendTransaction({
        to: ASP_WALLET,
        value: 0
    });
    console.log("Payment Tx Hash:", tx.hash);
    await tx.wait(1);
    
    console.log("\n2. Calling Vercel ASP Auto-Miner...");
    // Use the native fetch API to hit the Vercel backend
    const response = await fetch("https://bolbo-gules.vercel.app/agent/auto-mine", {
        method: "GET",
        headers: {
            "x-payment": tx.hash
        }
    });
    
    const data = await response.json();
    console.log("ASP Response:", data);
    
    if (data.success) {
        console.log("\n3. Fetching updated blockchain stats...");
        const statsRes = await fetch("https://bolbo-gules.vercel.app/network/stats");
        const statsData = await statsRes.json();
        console.log("Updated Stats:", statsData);
    }
}

run().catch(console.error);
