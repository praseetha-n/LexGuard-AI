import React, { useEffect } from 'react';

export default function ArchitectureModal({ isOpen, onClose, activeTab = 'architecture', setActiveTab }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-backdrop" 
      onClick={onClose} 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="modal-title"
    >
      <div 
        className="modal-container" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-icon-badge" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C28E2B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </div>
            <div>
              <h2 id="modal-title" className="modal-title">
                LexGuard AI System Overview
              </h2>
              <p className="modal-subtitle">
                Academic Project • Evidence-Verified Multi-Agent Legal Research Assistant
              </p>
            </div>
          </div>

          <button 
            type="button" 
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <div className="modal-nav-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'architecture'}
            className={`tab-btn ${activeTab === 'architecture' ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab('architecture')}
          >
            Multi-Agent Architecture
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'about'}
            className={`tab-btn ${activeTab === 'about' ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            Responsible AI & Scope
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'architecture' ? (
            <div className="tab-pane architecture-pane">
              <div className="arch-flow-diagram">
                <div className="arch-node arch-node--client">
                  <span className="arch-node-badge">User Client</span>
                  <strong>React Frontend</strong>
                  <span className="arch-node-meta">Vite • Vanilla CSS • Port 5173</span>
                </div>

                <div className="arch-arrow">
                  <span>HTTP REST POST /ask</span>
                  <div className="arrow-line" />
                </div>

                <div className="arch-node arch-node--hub">
                  <span className="arch-node-badge">Coordinator</span>
                  <strong>Orchestrator Service</strong>
                  <span className="arch-node-meta">FastAPI • Port 8000</span>
                </div>

                <div className="arch-split-row">
                  <div className="arch-agent-card arch-agent-card--active">
                    <div className="agent-status-tag agent-status-tag--online">Active Agent</div>
                    <strong>Retrieval Agent</strong>
                    <span className="agent-port">Port 8002</span>
                    <p className="agent-desc">
                      Hybrid search (BM25 keyword + dense semantic embeddings) over employment law statutes.
                    </p>
                  </div>

                  <div className="arch-agent-card arch-agent-card--pending">
                    <div className="agent-status-tag agent-status-tag--dev">In Development</div>
                    <strong>Explanation Agent</strong>
                    <span className="agent-port">Port 8003</span>
                    <p className="agent-desc">
                      Synthesizes natural legal discourse and draft answers based strictly on retrieved context.
                    </p>
                  </div>

                  <div className="arch-agent-card arch-agent-card--active">
                    <div className="agent-status-tag agent-status-tag--online">Active Agent</div>
                    <strong>Verification Agent</strong>
                    <span className="agent-port">Port 8004</span>
                    <p className="agent-desc">
                      Evaluates claim-to-passage alignment, detects statutory contradictions, and generates audits.
                    </p>
                  </div>
                </div>
              </div>

              <div className="arch-details-box">
                <h4>Pipeline Integration Note:</h4>
                <p>
                  In the current working prototype, the <strong>Orchestrator (:8000)</strong> queries the 
                  <strong> Retrieval Agent (:8002)</strong> and directly forwards retrieved evidence to the 
                  <strong> Verification Agent (:8004)</strong>. The frontend is built modularly to seamlessly 
                  display synthesized explanations when the <strong>Explanation Agent (:8003)</strong> is integrated.
                </p>
              </div>
            </div>
          ) : (
            <div className="tab-pane about-pane">
              <div className="about-grid">
                <div className="about-card">
                  <div className="about-card-icon">🎯</div>
                  <h4>Research Objective</h4>
                  <p>
                    Addressing hallucinations and ungrounded claims in legal AI applications by enforcing 
                    pre-presentation verification of all textual claims against authoritative legal documents.
                  </p>
                </div>

                <div className="about-card">
                  <div className="about-card-icon">⚖️</div>
                  <h4>Domain Scope</h4>
                  <p>
                    Employment law, statutory termination rights, notice periods, and fair dismissal requirements 
                    under codified legislative statutes.
                  </p>
                </div>

                <div className="about-card">
                  <div className="about-card-icon">🛡️</div>
                  <h4>Responsible AI</h4>
                  <p>
                    Built with strict transparency: evidence sufficiency flags, conflicting source detection, 
                    prominent disclaimers, and clear unverified claim warnings.
                  </p>
                </div>

                <div className="about-card">
                  <div className="about-card-icon">🎓</div>
                  <h4>University Project</h4>
                  <p>
                    Designed for academic rigor, maintainability, and clean separation between autonomous multi-agent 
                    backends and a client interface.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
