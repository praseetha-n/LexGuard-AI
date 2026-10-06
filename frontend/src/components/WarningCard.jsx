import React from 'react';

export default function WarningCard({ warning }) {
  // If warning is null, undefined, or empty, do not render anything
  if (!warning || typeof warning !== 'string' || !warning.trim()) {
    return null;
  }

  return (
    <div className="warning-panel" role="alert" aria-labelledby="warning-heading">
      <div className="warning-panel-icon" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>
      <div className="warning-panel-body">
        <h4 id="warning-heading" className="warning-panel-title">
          Advisory Notice
        </h4>
        <p className="warning-panel-message">{warning}</p>
      </div>
    </div>
  );
}
