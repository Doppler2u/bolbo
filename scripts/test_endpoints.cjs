async function testEndpoints() {
    const API_URL = "https://bolbo-indol.vercel.app";
    const dummyPayment = "0x5e300b6a765f2d819b27f34bab3d547d6a047bc4ec93ffff38450fba938bfa86";

    console.log("🔍 Running Comprehensive Health Check on Bolbo Vercel API...\n");

    // 1. /network/challenge
    try {
        console.log("1️⃣ Testing GET /network/challenge...");
        const res = await fetch(`${API_URL}/network/challenge`);
        const data = await res.json();
        console.log("✅ Status:", res.status, "Response:", data);
    } catch (e) { console.log("❌ Failed:", e.message); }

    // 2. /network/leaderboard
    try {
        console.log("\n2️⃣ Testing GET /network/leaderboard...");
        const res = await fetch(`${API_URL}/network/leaderboard`);
        const data = await res.json();
        console.log("✅ Status:", res.status, "Agents found:", data.agents ? data.agents.length : 0);
    } catch (e) { console.log("❌ Failed:", e.message); }

    // 3. /network/stats
    try {
        console.log("\n3️⃣ Testing GET /network/stats...");
        const res = await fetch(`${API_URL}/network/stats`);
        const data = await res.json();
        console.log("✅ Status:", res.status, "Total Minted:", data.totalMinted);
    } catch (e) { console.log("❌ Failed:", e.message); }

    // 4. /agent/oracle (Without Payment - Should 402)
    try {
        console.log("\n4️⃣ Testing GET /agent/oracle (No Payment)...");
        const res = await fetch(`${API_URL}/agent/oracle`);
        console.log(res.status === 402 ? "✅ Status: 402 (Correctly blocked)" : "❌ Failed to block.");
    } catch (e) { console.log("❌ Failed:", e.message); }

    // 5. /agent/oracle (With Payment)
    try {
        console.log("\n5️⃣ Testing GET /agent/oracle (With Payment)...");
        const res = await fetch(`${API_URL}/agent/oracle`, {
            headers: { "x-payment": dummyPayment }
        });
        const data = await res.json();
        console.log("✅ Status:", res.status, "Difficulty:", data.currentDifficulty);
    } catch (e) { console.log("❌ Failed:", e.message); }

    console.log("\n🎉 All tests completed!");
}

testEndpoints();
