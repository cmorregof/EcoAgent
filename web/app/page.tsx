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
              <span className="stat-value">{t('landing.stat_live_value')}</span>
              <span className="stat-label">{t('landing.stat_live')}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-value stat-value-wide">{t('landing.stat_model_value')}</span>
              <span className="stat-label">{t('landing.stat_model')}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-value">{t('landing.stat_alert_value')}</span>
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
                  {Array.from({ length: 14 }).map((_, idx) => (
                    <span
                      key={`rain-${idx}`}
                      className={`rain-streak ${idx % 4 === 0 ? 'heavy' : ''}`}
                      style={{ left: `${6 + idx * 6.4}%`, animationDelay: `${idx * 0.22}s` }}
                    />
                  ))}
                </div>

                <div className="terrain-haze"></div>
                <div className="terrain-contours">
                  <span className="contour-line contour-1"></span>
                  <span className="contour-line contour-2"></span>
                  <span className="contour-line contour-3"></span>
                </div>

                <div className="slope-mass slope-mass-back"></div>
                <div className="slope-mass slope-mass-front">
                  <div className="slope-monitor-band">
                    <span>{t('landing.sector_primary')}</span>
                    <strong>{t('landing.sector_status')}</strong>
                  </div>
                  <div className="risk-scar risk-scar-secondary"></div>
                  <div className="risk-scar risk-scar-major"></div>
                  <div className="runoff-trace runoff-trace-main"></div>
                  <div className="runoff-trace runoff-trace-secondary"></div>
                </div>

                <div className="rain-readout">
                  <span>{t('landing.rain_label')}</span>
                  <strong>{t('landing.rain_value')}</strong>
                </div>

                <div className="risk-zone risk-zone-watch">
                  <div className="risk-zone-pulse"></div>
                  <span>{t('landing.zone_watch')}</span>
                </div>
                <div className="risk-zone risk-zone-warning">
                  <div className="risk-zone-pulse"></div>
                  <span>{t('landing.zone_warning')}</span>
                </div>

                <div className="terrain-caption">{t('landing.map_caption')}</div>

                <div className="urban-edge">
                  {Array.from({ length: 12 }).map((_, idx) => (
                    <span
                      key={`urban-${idx}`}
                      className="urban-block"
                      style={{
                        height: `${12 + (idx % 4) * 6}px`,
                        width: `${12 + (idx % 3) * 5}px`,
                      }}
                    />
                  ))}
                </div>

                <div className="alert-banner">
                  <span className="alert-banner-label">{t('landing.workflow_risk')}</span>
                  <strong>{t('landing.alert_banner')}</strong>
                </div>
              </div>
            </div>

            <div className="signal-strip">
              <div className={`signal-item ${activeStep >= 0 ? 'active' : ''}`}>
                <span className="signal-index">01</span>
                <span className="signal-label">{t('landing.workflow_meteo')}</span>
              </div>
              <div className={`signal-item ${activeStep >= 1 ? 'active' : ''}`}>
                <span className="signal-index">02</span>
                <span className="signal-label">{t('landing.workflow_soil')}</span>
              </div>
              <div className={`signal-item ${activeStep >= 2 ? 'active' : ''}`}>
                <span className="signal-index">03</span>
                <span className="signal-label">{t('landing.workflow_model')}</span>
              </div>
              <div className={`signal-item ${activeStep >= 3 ? 'active' : ''}`}>
                <span className="signal-index">04</span>
                <span className="signal-label">{t('landing.workflow_risk')}</span>
              </div>
            </div>

            <p className="artifact-summary">{t('landing.panel_summary')}</p>

            <div className="artifact-footer">
              <div className="footer-metric">
                <span className="metric-label">{t('landing.metric_rain')}</span>
                <span className="metric-value">{t('landing.rain_value')}</span>
              </div>
              <div className="footer-metric">
                <span className="metric-label">{t('landing.metric_saturation')}</span>
                <span className="metric-value">68%</span>
              </div>
              <div className="footer-metric">
                <span className="metric-label">{t('landing.metric_sector')}</span>
                <span className="metric-value">{t('landing.metric_sector_value')}</span>
              </div>
            </div>
          </div>
        </div>

      </section>

    </div>
  );
}
