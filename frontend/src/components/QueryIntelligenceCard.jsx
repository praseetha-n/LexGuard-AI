import React from 'react';

/**
 * Mapping for canonical Sri Lankan employment law areas to human-readable labels.
 */
const LEGAL_AREA_LABELS = {
  termination: 'Termination',
  leave: 'Leave',
  wages: 'Wages',
  working_hours: 'Working Hours',
  gratuity: 'Gratuity',
  unknown: 'Unknown',
};

/**
 * Converts machine-friendly legal area identifiers (e.g. 'working_hours')
 * into formatted, human-readable display titles.
 */
function formatLegalArea(area) {
  if (!area || typeof area !== 'string') {
    return 'Unknown';
  }
  const key = area.trim().toLowerCase();
  if (LEGAL_AREA_LABELS[key]) {
    return LEGAL_AREA_LABELS[key];
  }
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Formats a keyword into Title Case for presentation as a search concept badge.
 */
function formatKeyword(keyword) {
  if (!keyword || typeof keyword !== 'string') {
    return '';
  }
  return keyword.trim().replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * QueryIntelligenceCard - Displays the structured output from the Query Intelligence Agent.
 *
 * Renders detected legal domain and normalized search concept pills.
 * Gracefully handles missing fields and renders nothing if queryAnalysis is absent.
 */
export default function QueryIntelligenceCard({ queryAnalysis }) {
  if (!queryAnalysis || typeof queryAnalysis !== 'object') {
    return null;
  }

  const { legal_area, keywords } = queryAnalysis;
  const displayLegalArea = formatLegalArea(legal_area);
  const keywordList = Array.isArray(keywords)
    ? keywords.filter((k) => typeof k === 'string' && k.trim().length > 0)
    : [];

  return (
    <article
      className="result-card query-intelligence-card"
      aria-labelledby="query-intelligence-heading"
    >
      <div className="qi-header">
        <div className="qi-header-left">
          <div className="qi-icon" aria-hidden="true">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h3 id="query-intelligence-heading" className="qi-title">
            Query Intelligence
          </h3>
        </div>
        <span className="qi-agent-tag">Query Agent</span>
      </div>

      <div className="qi-body">
        <div className="qi-row qi-area-row">
          <span className="qi-field-label">Detected Legal Area:</span>
          <span className="qi-area-badge">{displayLegalArea}</span>
        </div>

        <div className="qi-row qi-concepts-row">
          <span className="qi-field-label">Search Concepts:</span>
          <div className="qi-concepts-list" role="list">
            {keywordList.length > 0 ? (
              keywordList.map((keyword, index) => (
                <span key={index} className="qi-keyword-pill" role="listitem">
                  {formatKeyword(keyword)}
                </span>
              ))
            ) : (
              <span className="qi-empty-concepts">None detected</span>
            )}
          </div>
        </div>
      </div>

      <div className="qi-footer">
        <p className="qi-supporting-text">
          Your question was interpreted and converted into legal search concepts before evidence retrieval.
        </p>
      </div>
    </article>
  );
}
