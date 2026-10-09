import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function Header({ onOpenArchitecture, onOpenAbout, onReset, isConnected, onToggleHistory, sidebarOpen }) {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleBrandClick = () => {
    if (onReset) onReset();
    navigate('/chat');
  };

  return (
    <header className="site-header" role="banner">
      <div className="header-container">
        <button 
          type="button" 
          className="brand-link" 
          onClick={handleBrandClick}
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
            {/* History sidebar toggle — only shown when authenticated */}
            {user && onToggleHistory && (
              <button
                type="button"
                className={`nav-btn nav-btn--history${sidebarOpen ? ' nav-btn--active' : ''}`}
                onClick={onToggleHistory}
                title={sidebarOpen ? 'Hide conversation history' : 'Show conversation history'}
                aria-label="Toggle conversation history panel"
                id="history-toggle-header-btn"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="16" y2="12" />
                  <line x1="3" y1="18" x2="11" y2="18" />
                </svg>
                <span>History</span>
              </button>
            )}
            <button 
              type="button" 
              className="nav-btn" 
              onClick={() => navigate('/chat')}
            >
              Research
            </button>

            {profile?.role === 'admin' && (
              <Link to="/admin" className="nav-btn nav-btn--admin" title="Admin Dashboard">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span>Admin</span>
              </Link>
            )}

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

          {/* User Profile & Logout Area */}
          {user && (
            <div className="user-profile-menu">
              <div className="user-profile-pill" title={`Logged in as ${profile?.full_name || user.email}`}>
                <div className="user-avatar">
                  {(profile?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="user-details-compact">
                  <span className="user-name-compact">{profile?.full_name || user.email.split('@')[0]}</span>
                  {profile?.role === 'admin' && <span className="user-role-badge">Admin</span>}
                </div>
              </div>
              <button
                type="button"
                className="logout-icon-btn"
                onClick={logout}
                title="Log Out"
                aria-label="Log Out"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
