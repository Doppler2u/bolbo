import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Cpu, Pickaxe, Database, Zap, Clock, Activity, Shield, Bot } from 'lucide-react';
import Litepaper from './Litepaper';

function App() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('https://bolbo-gules.vercel.app/network/stats');
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
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <img src="/bolbo_logo.png" alt="Bolbo Logo" className="logo-icon" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} /> Bolbo
          </Link>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '1rem' }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: '500' }}>Dashboard</Link>
            <Link to="/litepaper" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: '500' }}>Litepaper</Link>
          </div>
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          <span className="live-indicator"></span> X Layer Testnet Live
        </div>
      </nav>

      <Routes>
        <Route path="/" element={
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
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

          <div style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
            <a href="https://www.okx.ai/agents/9423" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.8rem 1.5rem', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', color: '#fff', textDecoration: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)', transition: 'transform 0.2s ease' }}>
              Agent Live (ID: 9423)
            </a>
          </div>

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
          </div>
        } />
        <Route path="/litepaper" element={<Litepaper />} />
      </Routes>

      <footer style={{ textAlign: 'center', padding: '1rem 2rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
        <p>Built for the OKX.AI Hackathon. Running live on X Layer Testnet.</p>
      </footer>
    </>
  );
}

export default App;
