'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function LandingPage() {
  const { language, setLanguage, t } = useLanguage();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="landing-wrapper relative overflow-hidden">
      {/* Language Toggle */}
      <div className="lang-toggle">
        <span 
          className={`lang-btn ${language === 'en' ? 'active' : ''}`}
          onClick={() => setLanguage('en')}
        >
          EN
        </span>
        <span className="lang-sep">/</span>
        <span 
          className={`lang-btn ${language === 'es' ? 'active' : ''}`}
          onClick={() => setLanguage('es')}
        >
          ES
        </span>
      </div>

      {/* Background Ambience */}
      <div className="ambient-glow glow-top-right"></div>
      <div className="ambient-glow glow-bottom-left"></div>

      {/* Hero Section */}
      <section className="hero">
        
        {/* Left Column: Copy */}
        <div className="hero-content">
          <div className="hero-eyebrow">
            <div className="status-dot"></div>
            <span className="mono text-obsidian-outline-var" style={{ color: 'var(--clr-outline)' }}>
              {t('landing.eyebrow')}
            </span>
          </div>

          <div className="wordmark-lockup">
            <div className="wordmark-text">
              <span className="wordmark-the">{t('landing.parent_brand')}</span>
              <span className="wordmark-name">
                Eco<span className="accent">{t('landing.product_accent')}</span>
              </span>
              <span className="wordmark-project">{t('landing.descriptor')}</span>
            </div>
          </div>

          <p className="hero-description mt-2">
            {t('landing.description')}
          </p>

          <div className="hero-ctas mt-2">
            <Link href="/register" className="btn-landing">
              {t('landing.cta_primary')}
            </Link>
            <Link href="/login" className="btn-landing-ghost">
              {t('landing.cta_secondary')}
            </Link>
          </div>

          <div className="hero-stats mt-4">
            <div className="stat">
              <span className="stat-value">24/7</span>
              <span className="stat-label">{t('landing.stat_live')}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-value font-mono">CIR+</span>
              <span className="stat-label">{t('landing.stat_model')}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-value">A.I.</span>
              <span className="stat-label">{t('landing.stat_alert')}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Cartographic Visual */}
        <div className="hero-visual">
          <div className="monitoring-artifact">
            <div className="artifact-title-row">
              <div className="artifact-title">{t('landing.visual_title')}</div>
              <div className="artifact-status">
                <div className="status-dot"></div>
                {t('landing.visual_status')}
              </div>
            </div>

            <div className="spatial-grid">
              {/* Stylized terrain contours */}
              <svg className="terrain-contour" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Steeper, more irregular peaks for Andean context */}
                <path d="M0 190L60 140L130 160L190 100L260 135L330 80L400 120" stroke="currentColor" strokeWidth="0.5" />
                <path d="M0 160L80 110L150 130L210 70L290 105L350 50L400 90" stroke="currentColor" strokeWidth="0.5" />
                <path d="M0 130L100 80L170 100L230 40L320 75L370 20L400 60" stroke="currentColor" strokeWidth="0.5" />
                
                {/* Monitored Sector Highlight */}
                <path d="M130 160L190 100L260 135Z" fill="var(--accent)" fillOpacity="0.08" stroke="var(--accent)" strokeWidth="0.5" strokeDasharray="3 2" />
              </svg>
              
              {/* Risk Nodes */}
              <div className="risk-node active" style={{ top: '40%', left: '30%' }}></div>
              <div className="risk-node" style={{ top: '65%', left: '70%' }}></div>
              <div className="risk-node" style={{ top: '25%', left: '55%' }}></div>
              
              {/* Scanning Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent w-1/4 animate-scan" style={{ left: '0%' }}></div>
            </div>

            {/* Workflow Chain */}
            <div className="workflow-chain">
              <div className={`workflow-step ${activeStep >= 0 ? 'active' : ''}`}>
                <div className="step-dot">M</div>
                <div className="step-label">{t('landing.workflow_meteo')}</div>
              </div>
              <div className={`workflow-step ${activeStep >= 1 ? 'active' : ''}`}>
                <div className="step-dot">S</div>
                <div className="step-label">{t('landing.workflow_soil')}</div>
              </div>
              <div className={`workflow-step ${activeStep >= 2 ? 'active' : ''}`}>
                <div className="step-dot">C</div>
                <div className="step-label">{t('landing.workflow_model')}</div>
              </div>
              <div className={`workflow-step ${activeStep >= 3 ? 'active' : ''}`}>
                <div className="step-dot">!</div>
                <div className="step-label">{t('landing.workflow_risk')}</div>
              </div>
            </div>

            {/* Metrics */}
            <div className="artifact-metrics">
              <div className="metric-item">
                <span className="metric-label">SATURATION</span>
                <span className="metric-value">42.8%</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">PRECIP_24H</span>
                <span className="metric-value">12.4mm</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">SLOPE_ID</span>
                <span className="metric-value">ALPHA-07</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">RISK_INDEX</span>
                <span className="metric-value" style={{ color: 'var(--accent)' }}>0.14</span>
              </div>
            </div>
          </div>
        </div>

      </section>

      <style jsx>{`
        @keyframes scan {
          0% { left: -25%; }
          100% { left: 100%; }
        }
        .animate-scan {
          animation: scan 4s linear infinite;
        }
      `}</style>
    </div>
  );
}
