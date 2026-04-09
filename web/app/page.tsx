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
            <span className="mono text-obsidian-outline-var" style={{ color: 'var(--clr-outline)' }}>ECOAGENT ENGINE CORE · ONLINE</span>
          </div>

          <div className="wordmark-lockup">
            <div className="globe-art" style={{ filter: 'drop-shadow(0 0 12px rgba(59,130,246,0.3))' }}>
              🌧️
            </div>
            <div className="wordmark-text">
              <span className="wordmark-the">THE VELVETEEN PROJECT</span>
              <span className="wordmark-name">Eco<span className="accent">Agent</span></span>
              <span className="wordmark-project">CLIMATE RISK DETECTOR</span>
            </div>
          </div>

          <p className="hero-description mt-2">
            Plataforma avanzada de monitoreo y análisis estocástico para la gestión del riesgo climático.<br/>
            Monitoreo en tiempo real de deslizamientos con precisión científica.
          </p>

          <div className="hero-ctas mt-2">
            <Link href="/register" className="btn-landing">
              Comenzar Análisis
            </Link>
            <Link href="/login" className="btn-landing-ghost">
              Portal de Acceso
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
              <div className="terminal-title">eco_agent_daemon.py</div>
            </div>
            <div className="terminal-body">
              <div className="terminal-line">
                <span className="term-prompt">❯</span>
                <span className="term-cmd">python3 main.py --env production --daemon</span>
              </div>
              
              <div className="term-output">
                {terminalLines >= 1 && (
                  <div className={`term-out-line ${terminalLines >= 1 ? 'visible' : ''}`}>
                    <span className="muted">[INFO]</span> Inicializando base de datos Supabase... OK.
                  </div>
                )}
                {terminalLines >= 2 && (
                  <div className={`term-out-line ${terminalLines >= 2 ? 'visible' : ''}`}>
                    <span className="muted">[INFO]</span> Conectando con API de Open-Meteo... <span className="success">CONECTADO</span>
                  </div>
                )}
                {terminalLines >= 3 && (
                  <div className={`term-out-line ${terminalLines >= 3 ? 'visible' : ''}`}>
                    <span className="muted">[INFO]</span> Cargando modelo CIR-Jump-Diffusion (LandslideRisk)... OK.
                  </div>
                )}
                {terminalLines >= 4 && (
                  <div className={`term-out-line highlight ${terminalLines >= 4 ? 'visible' : ''}`}>
                    <span className="muted">[WARN]</span> Precipitación anómala detectada en Estación Manizales (25.4mm)
                  </div>
                )}
                {terminalLines >= 5 && (
                  <div className={`term-out-line success mt-2 ${terminalLines >= 5 ? 'visible' : ''}`}>
                    <span className="success">✔</span> Alerta Temprana disparada al canal de Telegram.
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
