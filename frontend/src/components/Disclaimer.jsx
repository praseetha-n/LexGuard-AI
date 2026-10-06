import React from 'react';

export default function Disclaimer() {
  return (
    <aside className="legal-disclaimer" role="note" aria-label="Legal information disclaimer">
      <div className="disclaimer-inner">
        <div className="disclaimer-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div className="disclaimer-content">
          <strong className="disclaimer-title">Legal Disclaimer:</strong>
          <span className="disclaimer-text">
            {' '}LexGuard AI provides legal information and research assistance, not professional legal advice.
            Consult a qualified legal practitioner for formal representation or jurisdiction-specific counsel.
          </span>
        </div>
      </div>
    </aside>
  );
}
