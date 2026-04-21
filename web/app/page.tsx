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
          <div className="hero-context mono">
            <span className="hero-context-prefix">{t('topbar.region_prefix')}</span>
            <span className="hero-context-divider">·</span>
            <span className="hero-context-name">{t('topbar.region_name')}</span>
          </div>

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
              <div>
                <div className="artifact-kicker">{t('landing.region_label')}</div>
                <div className="artifact-title">{t('landing.visual_title')}</div>
              </div>
              <div className="artifact-status risk">
                <div className="status-dot"></div>
                {t('landing.visual_status')}
              </div>
            </div>

            <div className="artifact-scene">
              <div className="terrain-panel">
                <div className="scene-rain">
                  {Array.from({ length: 20 }).map((_, idx) => (
                    <span
                      key={`rain-${idx}`}
                      className={`rain-streak ${idx % 5 === 0 ? 'heavy' : ''}`}
                      style={{ left: `${4 + idx * 4.6}%`, animationDelay: `${idx * 0.18}s` }}
                    />
                  ))}
                </div>

                <div className="terrain-grid"></div>
                <div className="terrain-contours">
                  <span className="contour-line contour-1"></span>
                  <span className="contour-line contour-2"></span>
                  <span className="contour-line contour-3"></span>
                  <span className="contour-line contour-4"></span>
                </div>

                <div className="slope-body">
                  <div className="slope-highlight slope-highlight-primary"></div>
                  <div className="slope-highlight slope-highlight-secondary"></div>
                </div>

                <div className="slope-sector sector-primary">
                  <span>{t('landing.sector_primary')}</span>
                  <strong>68%</strong>
                </div>
                <div className="slope-sector sector-secondary">
                  <span>{t('landing.sector_secondary')}</span>
                  <strong>54%</strong>
                </div>

                <div className="risk-zone risk-zone-watch">
                  <div className="risk-zone-pulse"></div>
                  <span>{t('landing.zone_watch')}</span>
                </div>
                <div className="risk-zone risk-zone-warning">
                  <div className="risk-zone-pulse"></div>
                  <span>{t('landing.zone_warning')}</span>
                </div>

                <div className="drainage-flow"></div>
                <div className="terrain-footprint"></div>
              </div>

              <div className="scene-sidebar">
                <div className="rain-gauge">
                  <span className="rain-gauge-label">{t('landing.rain_label')}</span>
                  <strong>{t('landing.rain_value')}</strong>
                  <div className="rain-gauge-track">
                    <div className="rain-gauge-fill"></div>
                  </div>
                </div>
                <p className="scene-caption">{t('landing.map_caption')}</p>
              </div>
            </div>

            {/* Workflow Chain */}
            <div className="workflow-chain">
              <div className={`workflow-step ${activeStep >= 0 ? 'active' : ''}`}>
                <div className="step-dot">1</div>
                <div className="step-label">{t('landing.workflow_meteo')}</div>
              </div>
              <div className={`workflow-step ${activeStep >= 1 ? 'active' : ''}`}>
                <div className="step-dot">2</div>
                <div className="step-label">{t('landing.workflow_soil')}</div>
              </div>
              <div className={`workflow-step ${activeStep >= 2 ? 'active' : ''}`}>
                <div className="step-dot">3</div>
                <div className="step-label">{t('landing.workflow_model')}</div>
              </div>
              <div className={`workflow-step ${activeStep >= 3 ? 'active' : ''}`}>
                <div className="step-dot">4</div>
                <div className="step-label">{t('landing.workflow_risk')}</div>
              </div>
            </div>

            <p className="artifact-summary">{t('landing.panel_summary')}</p>

            {/* Metrics */}
            <div className="artifact-metrics">
              <div className="metric-item">
                <span className="metric-label">{t('landing.metric_rain')}</span>
                <span className="metric-value">{t('landing.rain_value')}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">{t('landing.metric_saturation')}</span>
                <span className="metric-value">68%</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">{t('landing.metric_sector')}</span>
                <span className="metric-value">MNZ-N2</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">{t('landing.metric_alert')}</span>
                <span className="metric-value metric-value-alert">{t('landing.metric_alert_value')}</span>
              </div>
            </div>
          </div>
        </div>

      </section>

    </div>
  );
}
