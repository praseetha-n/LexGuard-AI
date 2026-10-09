import React from 'react';

export default function VerifiedClaims({ claims }) {
  if (!claims || !Array.isArray(claims) || claims.length === 0) {
    return (
      <section className="claims-section" aria-labelledby="claims-section-title">
        <div className="section-header">
          <h3 id="claims-section-title" className="section-title">
            Verified Claims
          </h3>
          <p className="section-subtitle">
            Cross-examination of individual claims against retrieved evidence passages.
          </p>
        </div>
        <div className="empty-substate">
          <p>No individual claims were extracted for verification.</p>
        </div>
      </section>
    );
  }

  const supportedCount = claims.filter((c) => c.supported).length;
  const totalCount = claims.length;

  return (
    <section className="claims-section" aria-labelledby="claims-section-title">
      <div className="section-header">
        <div className="section-header-row">
          <div>
            <h3 id="claims-section-title" className="section-title">
              Verified Claims Breakdown
            </h3>
            <p className="section-subtitle">
              Assertion-by-assertion verification against retrieved legal authority.
            </p>
          </div>
          <div className="claims-ratio-pill">
            <span className="ratio-score">{supportedCount} / {totalCount}</span>
            <span className="ratio-label">supported by evidence</span>
          </div>
        </div>
      </div>

      <div className="claims-grid" role="list">
        {claims.map((item, index) => {
          const isSupported = Boolean(item.supported);
          const docId = item.supporting_document_id;

          return (
            <article 
              key={index} 
              className={`claim-card ${isSupported ? 'claim-card--supported' : 'claim-card--unverified'}`}
              role="listitem"
            >
              <div className="claim-card-header">
                <div className="claim-status-badge">
                  {isSupported ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>✓ Supported by retrieved evidence</span>
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <span>⚠ Not verified</span>
                    </>
                  )}
                </div>

                {docId && (
                  <div className="claim-document-id" title={`Supporting document: ${docId}`}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span className="doc-id-label">Source ID:</span>
                    <code className="doc-id-code">{docId}</code>
                  </div>
                )}
              </div>

              <div className="claim-body">
                <p className="claim-text">
                  <span className="claim-quote-mark">“</span>
                  {item.claim}
                  <span className="claim-quote-mark">”</span>
                </p>
              </div>

              <div className="claim-card-footer">
                <span className="claim-disclaimer-note">
                  {isSupported
                    ? 'Verified against statutory text. Does not constitute guaranteed legal determination.'
                    : 'Uncorroborated: The available retrieval corpus does not contain direct textual evidence.'}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
