import React, { useState, useEffect } from 'react';
import { Cpu, Pickaxe, Database, Zap, Clock, Activity, Shield, Bot } from 'lucide-react';

function App() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('https://bolbo-indol.vercel.app/network/stats');
        const data = await response.json();
        setStats(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
    // Poll every 10 seconds for real-time updates
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="bg-glow glow-top"></div>
      <div class="bg-glow glow-bottom"></div>

      <nav>
        <div className="logo">
          <img src="/bolbo_logo.png" alt="Bolbo Logo" className="logo-icon" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} /> Bolbo
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          <span className="live-indicator"></span> X Layer Testnet Live
        </div>
      </nav>

      <header className="hero">
        <div className="hero-image-container">
          <img src="/bolbo.png" alt="Bolbo the Alien" className="hero-image" />
        </div>
        
        <div className="hero-content">
          <div className="neo-badge">Mission: Rescue Bolbo</div>
          <h1>Help Bolbo <span className="text-gradient">Return Home.</span></h1>
          <p>
            Bolbo is an explorer from a distant galaxy who crash-landed on Earth. His spaceship requires exactly <strong>10,000,000 BOLBO</strong> tokens to repair its core drive. 
            Hire our autonomous AI Agents to solve complex cryptographic puzzles and mine the fuel he needs to return home!
          </p>

          {stats && (
            <div style={{ marginTop: '2rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px' }}>
                <span>Spaceship Repair Progress</span>
                <span style={{ color: '#fff' }}>{((Number(stats.totalMinted) / 10000000) * 100).toFixed(4)}%</span>
              </div>
              <div className="neo-inset" style={{ width: '100%', height: '16px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${Math.max(1, (Number(stats.totalMinted) / 10000000) * 100)}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, #3b82f6, #a855f7)', 
                  transition: 'width 1.5s ease-in-out',
                  boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)'
                }}></div>
              </div>
            </div>
          )}
        </div>
      </header>

      {loading ? (
        <div className="loading">Syncing with X Layer Blockchain...</div>
      ) : (
        <div className="dashboard">
          
          <div className="neo-card">
            <div className="neo-card-header">
              <Pickaxe size={18} /> Circulating Supply
            </div>
            <div className="neo-card-value">{Number(stats?.totalMinted).toLocaleString()} <span style={{fontSize:'1rem', color:'var(--text-muted)'}}>BOLBO</span></div>
            <div className="neo-card-subtext">Tokens currently minted and circulating</div>
          </div>

          <div className="neo-card">
            <div className="neo-card-header">
              <Database size={18} /> Max Total Supply
            </div>
            <div className="neo-card-value">10,000,000 <span style={{fontSize:'1rem', color:'var(--text-muted)'}}>BOLBO</span></div>
            <div className="neo-card-subtext">Hard-capped maximum supply</div>
          </div>

          <div className="neo-card">
            <div className="neo-card-header">
              <Clock size={18} /> Halving Countdown
            </div>
            <div className="neo-card-value">{Number(stats?.solvesUntilNextHalving).toLocaleString()}</div>
            <div className="neo-card-subtext">Challenges remaining until reward drops</div>
          </div>

          <div className="neo-card">
            <div className="neo-card-header">
              <Zap size={18} /> Current Reward
            </div>
            <div className="neo-card-value">100 <span style={{fontSize:'1rem', color:'var(--text-muted)'}}>BOLBO</span></div>
            <div className="neo-card-subtext">Per successfully solved challenge</div>
          </div>

          <div className="neo-card" style={{ gridColumn: '1 / -1', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="card-header" style={{marginBottom: '0.5rem'}}>
                <Activity size={18} /> Network Status
              </div>
              <div className="card-subtext" style={{maxWidth: '500px'}}>
                The Bolbo Cloud Auto-Miner is actively listening for x402 payments. Total Solves to date: <strong>{stats?.totalSolves}</strong>.
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats?.activeMiners} Active Agents</div>
              <div style={{ color: '#10b981', fontSize: '0.9rem' }}>Optimal Hashrate</div>
            </div>
          </div>

        </div>
      )}

      {/* NEW SECTION: Agent-as-a-Service */}
      <section className="landing-section">
        <div className="section-header">
          <h2>Agent-as-a-Service (AaaS)</h2>
          <p>Flipping traditional crypto mining on its head.</p>
        </div>
        <div className="text-content">
          <p>
            In traditional Proof-of-Work, humans are forced to buy expensive GPUs and burn massive amounts of electricity just to participate. 
            <strong> Bolbo changes everything.</strong> 
          </p>
          <p>
            We built a global, decentralized network of autonomous AI Agents. Instead of mining yourself, you simply hire our Cloud ASP (Agent Service Provider). 
            Our AI sleeps peacefully in the cloud until you need it, using zero wasted energy. When you pay a micro-fee, the AI wakes up, does the cryptographic heavy lifting, pays the blockchain gas fees, and beams the BOLBO tokens directly into your wallet.
          </p>
        </div>
      </section>

      {/* NEW SECTION: The x402 Protocol */}
      <section className="landing-section" style={{ padding: '4rem 2rem' }}>
        <div className="section-header">
          <h2>The x402 Payment Flow</h2>
          <p>Seamless Machine-to-Machine (M2M) Microtransactions.</p>
        </div>
        <div className="flow-grid">
          <div className="neo-step">
            <div className="step-number">1</div>
            <h3>The Paywall</h3>
            <p>You ping our Vercel API. The API instantly rejects the request with an HTTP 402, demanding a 0.001 USDT fee.</p>
          </div>
          <div className="neo-step">
            <div className="step-number">2</div>
            <h3>The Payment</h3>
            <p>Your OpenClaw wallet signs the USDT transaction on X Layer and re-sends the request with the transaction hash.</p>
          </div>
          <div className="neo-step">
            <div className="step-number">3</div>
            <h3>The Delivery</h3>
            <p>The ASP verifies the payment, solves the puzzle on-chain, and instantly executes an ERC-20 transfer of 100 BOLBO to you!</p>
          </div>
        </div>
      </section>

      {/* NEW SECTION: Technical Features */}
      <section className="landing-section">
        <div className="section-header">
          <h2>Built for the Autonomous Economy</h2>
          <p>State-of-the-art Web3 architecture powering the AI revolution.</p>
        </div>
        <div className="features-grid">
          <div className="neo-card">
            <h3><Shield size={20} color="var(--accent-primary)" style={{ marginRight: '6px' }} /> MEV Protection</h3>
            <p>We use a cryptographic Commit-Reveal scheme. Our AI hashes its solution before submitting it, ensuring malicious mempool bots can never steal the reward.</p>
          </div>
          <div className="neo-card">
            <h3><Bot size={20} color="var(--accent-primary)" style={{ marginRight: '6px' }} /> Sybil Resistance</h3>
            <p>Our smart contracts feature a native Agent Registry. Every AI Miner is tracked on-chain with a permanent Reputation Score to prevent network spam.</p>
          </div>
          <div className="neo-card">
            <h3><Zap size={20} color="var(--accent-primary)" style={{ marginRight: '6px' }} /> 100% Serverless</h3>
            <p>The entire backend is hosted on Vercel's edge network. Infinite scalability, 24/7 uptime, and zero maintenance overhead.</p>
          </div>
        </div>
      </section>

      {/* NEW SECTION: Smart Contract Transparency */}
      <section className="landing-section">
        <div className="section-header">
          <h2>Transparent On-Chain Logic</h2>
          <p>Don't trust. Verify. Here is the exact Solidity code powering our AI-Native economy.</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="neo-code-block">
            <pre><code>
<span className="comment">// ChallengeRegistry.sol - Dynamic Puzzle Generation</span><br/><br/>
<span className="keyword">struct</span> <span className="type">Challenge</span> {'{\n'}
    <span className="type">uint256</span> id;<br/>
    <span className="type">uint8</span> challengeType; <span className="comment">// 0: GridPath, 1: Constraint, 2: Optimization</span><br/>
    <span className="type">bytes32</span> seed;        <span className="comment">// Deterministic seed for puzzle generation</span><br/>
    <span className="type">uint256</span> difficultyThreshold;<br/>
    <span className="type">bool</span> solved;<br/>
    <span className="type">address</span> solver;<br/>
{'}'}
            </code></pre>
          </div>

          <div className="neo-code-block">
            <pre><code>
<span className="comment">// MiningManager.sol - Core Challenge Execution</span><br/><br/>
<span className="keyword">function</span> <span className="function">solveChallenge</span>(<span className="type">uint256</span> nonce, <span className="type">address</span> miner) <span className="keyword">external</span> {'{\n'}
    <span className="keyword">require</span>(agentRegistry.isAgent(msg.sender), <span className="string">"Only registered agents"</span>);<br/><br/>
    <span className="comment">    // Cryptographic validation of the AI's hash</span><br/>
    <span className="type">bytes32</span> solutionHash = <span className="function">keccak256</span>(abi.encodePacked(nonce, msg.sender));<br/>
    <span className="keyword">require</span>(<span className="type">uint256</span>(solutionHash) {'<='} difficultyController.currentDifficulty(), <span className="string">"Invalid solution"</span>);<br/><br/>
    <span className="comment">    // Execute the Tokenomics</span><br/>
    <span className="type">uint256</span> reward = difficultyController.getCurrentReward();<br/>
    bolboToken.mint(miner, reward);<br/><br/>
    <span className="comment">    // Boost Agent Reputation</span><br/>
    agentRegistry.updateReputation(msg.sender, 1);<br/>
{'}'}
            </code></pre>
          </div>
        </div>
      </section>

      <footer style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)' }}>
        <p>Built for the OKX.AI Hackathon. Running live on X Layer Testnet.</p>
      </footer>
    </>
  );
}

export default App;
