import React from 'react';

export default function EmptyState({ onSelectExample }) {
  return (
    <section className="empty-state-section" aria-label="Research guidelines and features">
      <div className="empty-state-card">
        <div className="empty-state-symbol" aria-hidden="true">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#C28E2B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z" />
            <path d="M2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z" />
            <path d="M7 21h10" />
            <path d="M12 3v18" />
            <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
          </svg>
        </div>

        <h2 className="empty-state-title">Ready to research</h2>
        <p className="empty-state-desc">
          Ask LexGuard AI an employment-related legal question to retrieve and verify relevant legal evidence.
        </p>

        <div className="empty-state-pillars">
          <div className="pillar-item">
            <div className="pillar-header">
              <span className="pillar-badge">01</span>
              <h3 className="pillar-title">Evidence Retrieval</h3>
            </div>
            <p className="pillar-body">
              Targeted retrieval across employment statutory acts, termination regulations, and legal passages.
            </p>
          </div>

          <div className="pillar-item">
            <div className="pillar-header">
              <span className="pillar-badge">02</span>
              <h3 className="pillar-title">Citation Verification</h3>
            </div>
            <p className="pillar-body">
              Independent Verification Agent confirms that every assertion directly correlates to retrieved passages.
            </p>
          </div>

          <div className="pillar-item">
            <div className="pillar-header">
              <span className="pillar-badge">03</span>
              <h3 className="pillar-title">Source Transparency</h3>
            </div>
            <p className="pillar-body">
              Automatic contradiction alerts, evidence insufficiency warnings, and full source traceability.
            </p>
          </div>
        </div>

        <div className="empty-state-quickstart">
          <span className="quickstart-label">Try starting with:</span>
          <div className="quickstart-buttons">
            <button
              type="button"
              className="quickstart-btn"
              onClick={() => onSelectExample('Can an employer terminate an employee without notice?')}
            >
              Termination without notice →
            </button>
            <button
              type="button"
              className="quickstart-btn"
              onClick={() => onSelectExample('What notice is required for termination?')}
            >
              Notice requirements →
            </button>
            <button
              type="button"
              className="quickstart-btn"
              onClick={() => onSelectExample('What rights does an employee have after termination?')}
            >
              Employee rights →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
