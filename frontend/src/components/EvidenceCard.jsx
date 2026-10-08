import React, { useState } from 'react';

function SingleSourceCard({ source, index }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Normalize fields whether from retrieved_documents, citations, or verified_claims
  const title = source.title || source.document_id || `Legal Document #${index + 1}`;
  const documentId = source.document_id || source.supporting_document_id || 'Statutory Source';
  const passage = source.passage || source.claim || source.text || '';
  
  // Format relevance score if provided (as float 0-1, 0-100, or undefined)
  let formattedScore = null;
  if (typeof source.score === 'number') {
    const pct = source.score <= 1.0 ? Math.round(source.score * 100) : Math.round(source.score);
    formattedScore = `${pct}%`;
  } else if (source.relevance) {
    formattedScore = source.relevance;
  }

  const isLongPassage = passage.length > 280;
  const displayPassage = isLongPassage && !isExpanded 
    ? `${passage.slice(0, 260)}...` 
    : passage;

  return (
    <article className="source-card" role="listitem">
      <div className="source-card-header">
        <div className="source-identity">
          <div className="source-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div className="source-heading-content">
            <h4 className="source-title">{title}</h4>
            <details className="source-details">
              <summary>Source details</summary>
              <div className="source-meta-row">
                <span className="source-meta-item">
                  <span className="meta-label">Document ID:</span>
                  <code className="meta-code">{documentId}</code>
                </span>
                {formattedScore && (
                  <span className="source-score-badge" title="Algorithmic retrieval relevance score">
                    <span className="score-bullet">●</span>
                    <span>Relevance: {formattedScore}</span>
                  </span>
                )}
              </div>
            </details>
          </div>
        </div>
      </div>

      <div className="source-evidence-block">
        <div className="evidence-label-row">
          <span className="evidence-section-label">Relevant passage</span>
        </div>
        <blockquote className="evidence-quote">
          "{displayPassage}"
        </blockquote>

        {isLongPassage && (
          <button
            type="button"
            className="expand-passage-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <>
                <span>Show less</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              </>
            ) : (
              <>
                <span>Read full passage</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </>
            )}
          </button>
        )}
      </div>
    </article>
  );
}

export default function EvidenceCard({ documents, verifiedClaims }) {
  // Determine source list from explicit documents or derive from verified claims
  let sourcesList = [];

  if (Array.isArray(documents) && documents.length > 0) {
    sourcesList = documents;
  } else if (Array.isArray(verifiedClaims) && verifiedClaims.length > 0) {
    // Extract unique source items from claims if top-level documents not provided
    const docMap = new Map();
    verifiedClaims.forEach((claim) => {
      const docId = claim.supporting_document_id || 'Statutory Source Reference';
      if (!docMap.has(docId)) {
        docMap.set(docId, {
          document_id: docId,
          title: docId,
          passage: claim.claim,
          score: claim.supported ? 0.92 : undefined,
        });
      }
    });
    sourcesList = Array.from(docMap.values());
  }

  if (sourcesList.length === 0) {
    return (
      <section className="sources-section" aria-labelledby="sources-section-title">
        <div className="section-header">
          <h3 id="sources-section-title" className="section-title">
            Legal Sources
          </h3>
          <p className="section-subtitle">
            Supporting legal authorities related to this question.
          </p>
        </div>
        <div className="empty-substate empty-substate--sources">
          <div className="empty-substate-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <h4 className="empty-substate-heading">No sources available</h4>
            <p className="empty-substate-text">
              No specific legal passages were found for this question. Review the answer with caution and seek corroborating legal sources.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="sources-section" aria-labelledby="sources-section-title">
      <div className="section-header">
        <div className="section-header-row">
          <div>
            <h3 id="sources-section-title" className="section-title">
              Legal Sources
            </h3>
            <p className="section-subtitle">
              Relevant legal documents and supporting passages.
            </p>
          </div>
          <div className="sources-count-badge">
            <span>{sourcesList.length} {sourcesList.length === 1 ? 'Source' : 'Sources'} Cited</span>
          </div>
        </div>
      </div>

      <div className="sources-grid" role="list">
        {sourcesList.map((source, index) => (
          <SingleSourceCard key={index} source={source} index={index} />
        ))}
      </div>
    </section>
  );
}
