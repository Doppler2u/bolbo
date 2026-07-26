const baseUrl = 'https://bolbo-git-main-trontes-projects.vercel.app';

async function fetchUrl(path, method = 'GET', body = null, headers = {}) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(`${baseUrl}${path}`, options);
        const data = await response.json();
        return { status: response.status, data };
    } catch (e) {
        return { status: 'Error', data: e.message };
    }
}

async function runTests() {
    console.log("=== STARTING HARD TEST OF ASP API ===\n");

    // 1. Get Current Challenge
    console.log("[1/7] GET /challenge/current");
    let res = await fetchUrl('/challenge/current');
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${JSON.stringify(res.data)}\n`);
    
    const challengeId = res.data.id || 42;

    // 2. Get Challenge History
    console.log("[2/7] GET /challenge/history");
    res = await fetchUrl('/challenge/history');
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${JSON.stringify(res.data)}\n`);

    // 3. Register Agent
    console.log("[3/7] POST /agent/register");
    res = await fetchUrl('/agent/register', 'POST', { name: "TestAgent", description: "Test", metadata: "ipfs://test" });
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${JSON.stringify(res.data)}\n`);

    // 4. Commit Solution
    console.log("[4/7] POST /mining/commit");
    res = await fetchUrl('/mining/commit', 'POST', { challengeId: challengeId, commitHash: "0xabc123" });
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${JSON.stringify(res.data)}\n`);

    // 5. Reveal Solution (Without x-payment header -> Should fail with 402)
    console.log("[5/7] POST /mining/reveal (TESTING FAILURE WITHOUT x402 PAYMENT)");
    res = await fetchUrl('/mining/reveal', 'POST', { challengeId: challengeId, solution: "RRDRD", proof: "0xproof" });
    console.log(`Status: ${res.status} (Expected: 402)`);
    console.log(`Response: ${JSON.stringify(res.data)}\n`);

    // 6. Reveal Solution (With x-payment header -> Should succeed)
    console.log("[6/7] POST /mining/reveal (TESTING SUCCESS)");
    res = await fetchUrl('/mining/reveal', 'POST', { challengeId: challengeId, solution: "RRDRD", proof: "0xproof" }, { 'x-payment': 'valid_proof' });
    console.log(`Status: ${res.status} (Expected: 200)`);
    console.log(`Response: ${JSON.stringify(res.data)}\n`);

    // 7. Report Invalid
    console.log("[7/7] POST /mining/report-invalid");
    res = await fetchUrl('/mining/report-invalid', 'POST', { challengeId: challengeId, solver: "0xcheater", reason: "bad proof" });
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${JSON.stringify(res.data)}\n`);
    
    console.log("=== TESTS COMPLETE ===");
}

runTests();
