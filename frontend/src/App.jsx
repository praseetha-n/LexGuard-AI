import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import QueryInput from './components/QueryInput';
import LoadingState from './components/LoadingState';
import EmptyState from './components/EmptyState';
import AnswerCard from './components/AnswerCard';
import VerificationStatus from './components/VerificationStatus';
import WarningCard from './components/WarningCard';
import VerifiedClaims from './components/VerifiedClaims';
import EvidenceCard from './components/EvidenceCard';
import Disclaimer from './components/Disclaimer';
import ErrorCard from './components/ErrorCard';
import ArchitectureModal from './components/ArchitectureModal';
import { askLexGuard, checkBackendHealth } from './services/api';
import './App.css';

export default function App() {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [isBackendHealthy, setIsBackendHealthy] = useState(null);

  // Architecture & About modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('architecture');

  const resultsRef = useRef(null);

  // Initial passive connectivity ping to inform user of backend state
  useEffect(() => {
    let isMounted = true;
    checkBackendHealth().then((res) => {
      if (isMounted) {
        setIsBackendHealthy(res.isHealthy);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (queryToSubmit) => {
    const targetQuery = typeof queryToSubmit === 'string' ? queryToSubmit : query;
    const cleanQuery = (targetQuery || '').trim();

    if (!cleanQuery) {
      setValidationError('Please enter a legal research question.');
      return;
    }

    setValidationError(null);
    setError(null);
    setErrorDetails(null);
    setIsNetworkError(false);
    setIsLoading(true);
    setSubmittedQuery(cleanQuery);

    const result = await askLexGuard(cleanQuery);

    setIsLoading(false);

    if (result.ok) {
      setResponse(result.data);
      setIsBackendHealthy(true);
      // Smoothly scroll results into view
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      setError(result.error);
      setErrorDetails(result.details || null);
      setIsNetworkError(Boolean(result.isNetworkError));
      if (result.isNetworkError) {
        setIsBackendHealthy(false);
      }
    }
  };

  const handleReset = () => {
    setQuery('');
    setSubmittedQuery('');
    setResponse(null);
    setError(null);
    setErrorDetails(null);
    setIsNetworkError(false);
    setValidationError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectExample = (exampleText) => {
    setQuery(exampleText);
    setValidationError(null);
    handleSubmit(exampleText);
  };

  return (
    <div className="app-container">
      <Header
        onReset={handleReset}
        onOpenArchitecture={() => {
          setModalTab('architecture');
          setIsModalOpen(true);
        }}
        onOpenAbout={() => {
          setModalTab('about');
          setIsModalOpen(true);
        }}
        isConnected={isBackendHealthy}
      />

      <main className="main-content">
        <QueryInput
          query={query}
          setQuery={setQuery}
          onSubmit={() => handleSubmit(query)}
          isLoading={isLoading}
          validationError={validationError}
          setValidationError={setValidationError}
        />

        {isLoading && <LoadingState />}

        {error && !isLoading && (
          <ErrorCard
            error={error}
            details={errorDetails}
            isNetworkError={isNetworkError}
            onRetry={() => handleSubmit(submittedQuery || query)}
          />
        )}

        {response && !isLoading && (
          <section 
            ref={resultsRef} 
            className="results-container" 
            aria-labelledby="results-main-title"
          >
            <div className="results-toolbar">
              <div className="results-toolbar-left">
                <span className="results-kicker">Research Output</span>
                <h2 id="results-main-title" className="results-heading">
                  Research Result
                </h2>
              </div>

              <div className="results-toolbar-actions">
                <button
                  type="button"
                  className="toolbar-btn toolbar-btn--reset"
                  onClick={handleReset}
                  title="Start a new research query"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <polyline points="1 4 1 10 7 10"></polyline>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                  </svg>
                  <span>New Research</span>
                </button>
              </div>
            </div>

            {/* Synthesized Legal Answer */}
            <AnswerCard 
              answer={response.answer} 
              query={submittedQuery || response.query} 
            />

            {/* Verification Status & Conflict Notice */}
            <VerificationStatus
              evidenceSufficient={response.evidence_sufficient}
              conflictingSources={response.conflicting_sources}
            />

            {/* Backend Advisory Warning (only rendered if non-null) */}
            <WarningCard warning={response.warning} />

            {/* Verified Claims Breakdown */}
            <VerifiedClaims claims={response.verified_claims} />

            {/* Retrieved Source Documents and Evidence Passages */}
            <EvidenceCard
              documents={response.retrieved_documents || response.documents || response.sources}
              verifiedClaims={response.verified_claims}
            />

            {/* Visible In-Flow Legal Disclaimer */}
            <Disclaimer />
          </section>
        )}

        {!response && !isLoading && !error && (
          <EmptyState onSelectExample={handleSelectExample} />
        )}
      </main>

      <footer className="site-footer" role="contentinfo">
        <div className="footer-inner">
          <div className="footer-brand">
            <strong>LexGuard AI</strong>
            <span> — Evidence-Verified Legal Research System</span>
          </div>
          <div className="footer-notes">
            <span>Academic University Project • Employment Law Specialization</span>
          </div>
        </div>
      </footer>

      {/* Architecture & Viva Project Modal */}
      <ArchitectureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activeTab={modalTab}
        setActiveTab={setModalTab}
      />
    </div>
  );
}
