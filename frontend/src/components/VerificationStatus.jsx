import React from 'react';

export default function VerificationStatus({ evidenceSufficient, conflictingSources }) {
  const isVerified = Boolean(evidenceSufficient);
  const hasConflict = Boolean(conflictingSources);

  return (
    <div className="verification-status-group" aria-label="Evidence verification status">
      {/* Primary Evidence Sufficiency Card */}
      <div 
        className={`verification-banner ${isVerified ? 'verification-banner--verified' : 'verification-banner--insufficient'}`}
        role="region"
        aria-labelledby="verification-status-heading"
      >
        <div className="verification-banner-icon" aria-hidden="true">
          {isVerified ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          )}
        </div>

        <div className="verification-banner-content">
          <div className="verification-header-row">
            <h3 id="verification-status-heading" className="verification-title">
              {isVerified ? '✓ Evidence Verified' : '⚠ Evidence Insufficient'}
            </h3>
            <span className={`status-pill ${isVerified ? 'status-pill--success' : 'status-pill--warning'}`}>
              {isVerified ? 'Sufficient Evidence' : 'Needs Corroboration'}
            </span>
          </div>
          <p className="verification-description">
            {isVerified
              ? 'The response claims were matched against the retrieved legal evidence.'
              : 'Some claims could not be fully verified against the available evidence.'}
          </p>
        </div>
      </div>

      {/* Conflicting Sources Detection Alert */}
      {hasConflict && (
        <div 
          className="conflict-banner" 
          role="alert" 
          aria-labelledby="conflict-heading"
        >
          <div className="conflict-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="conflict-content">
            <h4 id="conflict-heading" className="conflict-title">
              ⚠ Conflicting Sources Detected
            </h4>
            <p className="conflict-text">
              The retrieved legal sources may contain conflicting statutory provisions or differing exceptions. 
              The system does not adjudicate legal contradictions; please review the cited legal sources carefully.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
