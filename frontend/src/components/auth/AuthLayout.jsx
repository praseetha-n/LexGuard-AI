import React from 'react';
import { Link } from 'react-router-dom';
import legalBannerImg from '../../assets/legal_login_banner.jpg';

export default function AuthLayout({
  title,
  subtitle,
  badgeText = 'AI-Powered Legal Research Assistant',
  children,
}) {
  return (
    <div className="auth-page-container">
      {/* ── Background Banner Layer with legal theme, blur & atmospheric overlays ── */}
      <div className="auth-bg-layer" aria-hidden="true">
        <img
          src={legalBannerImg}
          alt=""
          className="auth-bg-image"
          loading="eager"
        />
        <div className="auth-bg-overlay" />
        <div className="auth-bg-ambient-glow" />
        <div className="auth-bg-grid" />
      </div>

      {/* ── Foreground Content ── */}
      <main className="auth-content-wrapper" role="main">
        {/* Subtle status badge indicating AI Legal Assistant identity */}
        <div className="auth-system-badge" aria-label="LexGuard platform status">
          <span className="auth-system-badge-dot" aria-hidden="true" />
          <span className="auth-system-badge-text">{badgeText}</span>
        </div>

        <div className="auth-card">
          <div className="auth-card-header">
            <Link to="/" className="auth-brand" aria-label="LexGuard AI - Return to home">
              <div className="auth-brand-icon">
                <svg
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M16 2.5L5 6.5V14.5C5 21.8 9.7 28.5 16 30C22.3 28.5 27 21.8 27 14.5V6.5L16 2.5Z"
                    fill="#0F172A"
                    stroke="#C28E2B"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 9V22M11 11H21M16 22H13M16 22H19"
                    stroke="#C28E2B"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M11 11L8.5 15.5M11 11L13.5 15.5M8 15.5H14C14 17 12.6 17.5 11 17.5C9.4 17.5 8 17 8 15.5Z"
                    stroke="#E2E8F0"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M21 11L18.5 15.5M21 11L23.5 15.5M18 15.5H24C24 17 22.6 17.5 21 17.5C19.4 17.5 18 17 18 15.5Z"
                    stroke="#E2E8F0"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="auth-brand-text">
                <span className="auth-brand-name">LexGuard AI</span>
                <span className="auth-brand-sub">Legal Research Security</span>
              </div>
            </Link>
            <h1 className="auth-title">{title}</h1>
            {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          </div>

          <div className="auth-card-body">
            {children}
          </div>
        </div>

        {/* ── Security & Verification Trust Footer ── */}
        <footer className="auth-security-footer" aria-label="System security specifications">
          <div className="auth-security-item">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>256-bit Encrypted Research Session</span>
          </div>
          <span className="auth-security-divider" aria-hidden="true">•</span>
          <div className="auth-security-item">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Evidence-Verified Citations</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
