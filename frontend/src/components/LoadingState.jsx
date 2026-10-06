import React, { useState, useEffect } from 'react';

const STAGES = [
  { id: 'analyze', title: 'Analyzing question', desc: 'Parsing legal query semantics and employment terminology' },
  { id: 'search', title: 'Searching legal sources', desc: 'Querying retrieval agent for statutory provisions and case law' },
  { id: 'check', title: 'Checking evidence', desc: 'Verification agent matching claims against retrieved passages' },
  { id: 'prepare', title: 'Preparing response', desc: 'Synthesizing evidence-verified answer with full citation transparency' },
];

export default function LoadingState() {
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    // Progressively highlight pipeline stages for UI feedback
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 2400);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="loading-section" aria-live="polite" aria-busy="true">
      <div className="loading-card">
        <div className="loading-header">
          <div className="loading-badge">
            <span className="pulse-indicator" aria-hidden="true" />
            <span>Multi-Agent Pipeline Active</span>
          </div>
          <h2 className="loading-title">Researching legal evidence...</h2>
          <p className="loading-subtitle">
            Coordinating orchestrator, retrieval, and verification agents to assemble an evidence-backed response.
          </p>
        </div>

        <div className="pipeline-steps">
          {STAGES.map((stage, index) => {
            const isCompleted = index < activeStage;
            const isCurrent = index === activeStage;
            const isPending = index > activeStage;

            return (
              <div 
                key={stage.id} 
                className={`pipeline-step ${isCurrent ? 'pipeline-step--current' : ''} ${isCompleted ? 'pipeline-step--completed' : ''} ${isPending ? 'pipeline-step--pending' : ''}`}
              >
                <div className="step-indicator-col">
                  <div className="step-icon-bubble">
                    {isCompleted ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : isCurrent ? (
                      <span className="step-spinner" aria-hidden="true" />
                    ) : (
                      <span className="step-number">{index + 1}</span>
                    )}
                  </div>
                  {index < STAGES.length - 1 && <div className="step-connector" />}
                </div>

                <div className="step-content">
                  <div className="step-title-row">
                    <span className="step-title">{stage.title}</span>
                    {isCurrent && <span className="step-tag">In progress</span>}
                    {isCompleted && <span className="step-tag step-tag--done">Dispatched</span>}
                  </div>
                  <p className="step-desc">{stage.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="loading-footer-note">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>
            Note: Pipeline stages display active system flow. All claims are verified against retrieved evidence before presentation.
          </span>
        </div>
      </div>
    </section>
  );
}
