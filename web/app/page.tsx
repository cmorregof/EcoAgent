'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const [terminalLines, setTerminalLines] = useState<number>(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setTerminalLines(1), 800),
      setTimeout(() => setTerminalLines(2), 2000),
      setTimeout(() => setTerminalLines(3), 2800),
      setTimeout(() => setTerminalLines(4), 3600),
      setTimeout(() => setTerminalLines(5), 4500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="landing-wrapper relative overflow-hidden">
      {/* Background Ambience */}
      <div className="ambient-glow glow-top-right"></div>
      <div className="ambient-glow glow-bottom-left"></div>

      {/* Hero Section */}
      <section className="hero">
        
        {/* Left Column: Copy */}
        <div className="hero-content">
          <div className="hero-eyebrow">
            <div className="status-dot"></div>
            <span className="mono text-obsidian-outline-var" style={{ color: 'var(--clr-outline)' }}>ECOAGENT OPERATIONAL STATUS // ACTIVE</span>
          </div>

          <div className="wordmark-lockup">
            <div className="wordmark-text">
              <span className="wordmark-the">THE VELVETEEN PROJECT</span>
              <span className="wordmark-name">Eco<span className="accent">Agent</span></span>
              <span className="wordmark-project">STOCHASTIC CLIMATE RISK MONITOR</span>
            </div>
          </div>

          <p className="hero-description mt-2">
            Advanced monitoring and stochastic analysis platform for climate risk management.<br/>
            Real-time landslide detection with scientific precision.
          </p>

          <div className="hero-ctas mt-2">
            <Link href="/register" className="btn-landing">
              Initiate Analysis
            </Link>
            <Link href="/login" className="btn-landing-ghost">
              Access Portal
            </Link>
          </div>

          <div className="hero-stats mt-4">
            <div className="stat">
              <span className="stat-value">24/7</span>
              <span className="stat-label">LIVE SENSING</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-value font-mono">CIR+</span>
              <span className="stat-label">SIMULATION MODEL</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-value">A.I.</span>
              <span className="stat-label">VOICE ALERTING</span>
            </div>
          </div>
        </div>

        {/* Right Column: Terminal Visual */}
        <div className="hero-visual">
          <div className="terminal-window">
            <div className="terminal-bar">
              <div className="terminal-dots">
                <div className="dot dot-red"></div>
                <div className="dot dot-yellow"></div>
                <div className="dot dot-green"></div>
              </div>
              <div className="terminal-title">eco_agent_monitor.sys</div>
            </div>
            <div className="terminal-body">
              <div className="terminal-line">
                <span className="term-prompt">❯</span>
                <span className="term-cmd">systemctl start ecoagent.service</span>
              </div>
              
              <div className="term-output">
                {terminalLines >= 1 && (
                  <div className={`term-out-line ${terminalLines >= 1 ? 'visible' : ''}`}>
                    <span className="muted">[INFO]</span> Initializing Supabase telemetry... OK.
                  </div>
                )}
                {terminalLines >= 2 && (
                  <div className={`term-out-line ${terminalLines >= 2 ? 'visible' : ''}`}>
                    <span className="muted">[INFO]</span> Synchronizing with Open-Meteo API... <span className="success">SYNCED</span>
                  </div>
                )}
                {terminalLines >= 3 && (
                  <div className={`term-out-line ${terminalLines >= 3 ? 'visible' : ''}`}>
                    <span className="muted">[INFO]</span> Loading CIR-Jump-Diffusion (LandslideRisk) model... OK.
                  </div>
                )}
                {terminalLines >= 4 && (
                  <div className={`term-out-line highlight ${terminalLines >= 4 ? 'visible' : ''}`}>
                    <span className="muted">[WARN]</span> Anomalous precipitation detected: Manizales Station (25.4mm)
                  </div>
                )}
                {terminalLines >= 5 && (
                  <div className={`term-out-line success mt-2 ${terminalLines >= 5 ? 'visible' : ''}`}>
                    <span className="success">✔</span> Early Warning dispatched to Telegram gateway.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}
