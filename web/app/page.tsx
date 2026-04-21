'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function LandingPage() {
  const { language, setLanguage, t } = useLanguage();

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
                <div className="terrain-atmosphere"></div>

                <div className="scene-rain">
                  {Array.from({ length: 12 }).map((_, idx) => (
                    <span
                      key={`rain-${idx}`}
                      className={`rain-streak ${idx % 4 === 0 ? 'heavy' : ''}`}
                      style={{ left: `${8 + idx * 7.1}%`, animationDelay: `${idx * 0.24}s` }}
                    />
                  ))}
                </div>

                <div className="ridge ridge-back"></div>
                <div className="ridge ridge-mid"></div>
                <div className="ridge ridge-front"></div>
                <div className="slope-monitor-line"></div>

                <div className="risk-focus">
                  <div className="risk-focus-ring"></div>
                  <div className="risk-focus-core"></div>
                </div>

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
