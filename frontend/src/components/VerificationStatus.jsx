import React from 'react';

export default function VerificationStatus({ evidenceSufficient, conflictingSources }) {
  const isVerified = Boolean(evidenceSufficient);
  const hasConflict = Boolean(conflictingSources);

  return (
    <div className="verification-status-group" aria-label="Evidence verification status">
      <div
        className={`verification-banner ${isVerified ? 'verification-banner--verified' : 'verification-banner--insufficient'}`}
        role="status"
        aria-labelledby="verification-status-heading"
      >
        <span className="verification-status-indicator" aria-hidden="true">
          {isVerified ? '✓' : '!'}
        </span>
        <h3 id="verification-status-heading" className="verification-title">
          {isVerified ? 'Evidence Verified' : 'Needs Corroboration'}
        </h3>
        {!isVerified && (
          <p className="verification-description">
            Some claims could not be fully verified against the available evidence.
          </p>
        )}
      </div>

      {hasConflict && (
        <details className="conflict-details">
          <summary>Conflicting sources detected</summary>
          <p className="conflict-text">
            The retrieved legal sources may contain conflicting statutory provisions or differing exceptions.
            The system does not adjudicate legal contradictions; please review the cited legal sources carefully.
          </p>
        </details>
      )}
    </div>
  );
}
