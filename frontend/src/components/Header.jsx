import React from 'react';

export default function Header({ onOpenArchitecture, onOpenAbout, onReset, isConnected }) {
  return (
    <header className="site-header" role="banner">
      <div className="header-container">
        <button 
          type="button" 
          className="brand-link" 
          onClick={onReset}
          aria-label="LexGuard AI - Return to home"
        >
          <div className="brand-icon-wrapper" aria-hidden="true">
            {/* Legal Shield + Scales of Justice SVG */}
            <svg 
              className="brand-icon" 
              viewBox="0 0 32 32" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M16 2.5L5 6.5V14.5C5 21.8 9.7 28.5 16 30C22.3 28.5 27 21.8 27 14.5V6.5L16 2.5Z" 
                fill="#0F172A" 
                stroke="#C28E2B" 
                strokeWidth="1.5" 
                strokeLinejoin="round"
              />
              {/* Scales of Justice balance beam */}
              <path 
                d="M16 9V22M11 11H21M16 22H13M16 22H19" 
                stroke="#C28E2B" 
                strokeWidth="1.5" 
                strokeLinecap="round"
              />
              {/* Left pan */}
              <path 
                d="M11 11L8.5 15.5M11 11L13.5 15.5M8 15.5H14C14 17 12.6 17.5 11 17.5C9.4 17.5 8 17 8 15.5Z" 
                stroke="#E2E8F0" 
                strokeWidth="1.2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              {/* Right pan */}
              <path 
                d="M21 11L18.5 15.5M21 11L23.5 15.5M18 15.5H24C24 17 22.6 17.5 21 17.5C19.4 17.5 18 17 18 15.5Z" 
                stroke="#E2E8F0" 
                strokeWidth="1.2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-title">LexGuard AI</span>
            <span className="brand-tagline">Evidence-Verified Legal Research</span>
          </div>
        </button>

        <div className="header-actions">
          <div 
            className="status-badge" 
            title={isConnected === false ? "Orchestrator offline" : "Evidence verification engine ready"}
          >
            <span 
              className={`status-dot ${isConnected === false ? 'status-dot--warning' : 'status-dot--active'}`} 
              aria-hidden="true" 
            />
            <span className="status-label">Evidence-Verified AI</span>
          </div>

          <nav className="header-nav" aria-label="Main Navigation">
            <button 
              type="button" 
              className="nav-btn" 
              onClick={onReset}
            >
              Research
            </button>
            <button 
              type="button" 
              className="nav-btn" 
              onClick={onOpenArchitecture}
              title="View multi-agent pipeline architecture"
            >
              Architecture
            </button>
            <button 
              type="button" 
              className="nav-btn" 
              onClick={onOpenAbout}
              title="About this academic project"
            >
              About
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
