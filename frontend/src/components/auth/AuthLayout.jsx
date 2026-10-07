import React from 'react';
import { Link } from 'react-router-dom';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-card-header">
          <Link to="/" className="auth-brand">
            <div className="auth-brand-icon">
              <svg
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
    </div>
  );
}
