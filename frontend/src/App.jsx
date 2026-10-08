import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute, PublicOnlyRoute } from './components/auth/ProtectedRoutes';
import { useAuth } from './context/useAuth';

// Auth Components
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import AdminDashboard from './components/admin/AdminDashboard';

// Existing LexGuard Chat Components
import Header from './components/Header';
import QueryInput from './components/QueryInput';
import LoadingState from './components/LoadingState';
import EmptyState from './components/EmptyState';
import QueryIntelligenceCard from './components/QueryIntelligenceCard';
import AnswerCard from './components/AnswerCard';
import VerificationStatus from './components/VerificationStatus';
import WarningCard from './components/WarningCard';
import VerifiedClaims from './components/VerifiedClaims';
import EvidenceCard from './components/EvidenceCard';
import Disclaimer from './components/Disclaimer';
import ErrorCard from './components/ErrorCard';
import ArchitectureModal from './components/ArchitectureModal';

// Phase 2: History Components & Service
import ConversationHistory from './components/history/ConversationHistory';
import {
  fetchUserConversations,
  createConversation,
  fetchConversationMessages,
  saveMessage,
  deriveTitleFromQuestion,
} from './services/conversations';

import { askLexGuard, checkBackendHealth } from './services/api';
import './App.css';

// ---------------------------------------------------------------------------
// ConversationThreadView — render historical messages when a past conversation
// is selected. Shown instead of the current research result if the user has
// opened an old conversation AND has not yet submitted a new question in it.
// ---------------------------------------------------------------------------
function ConversationThreadView({ messages, isLoadingMessages, conversationTitle }) {
  if (isLoadingMessages) {
    return (
      <div className="thread-loading-card" aria-live="polite">
        <div className="thread-spinner" aria-hidden="true" />
        <span>Loading conversation…</span>
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return null;
  }

  const formatThreadTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="conversation-thread-container" aria-label="Conversation history">
      <div className="thread-banner">
        <div>
          <div className="thread-kicker">Previous Research Session</div>
          <div className="thread-heading">{conversationTitle || 'Legal Research'}</div>
        </div>
        <span className="thread-badge">{messages.length} messages</span>
      </div>

      <div className="thread-messages-list">
        {messages.map((msg) => (
          <article
            key={msg.id}
            className={`thread-message-card thread-message-card--${msg.role}`}
            aria-label={`${msg.role === 'user' ? 'Your question' : 'LexGuard answer'}`}
          >
            <div className="thread-message-header">
              <div className="thread-message-author">
                <div className={`author-icon author-icon--${msg.role}`} aria-hidden="true">
                  {msg.role === 'user' ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 32 32" fill="none">
                      <path d="M16 2.5L5 6.5V14.5C5 21.8 9.7 28.5 16 30C22.3 28.5 27 21.8 27 14.5V6.5L16 2.5Z" fill="#0F172A" stroke="#C28E2B" strokeWidth="1.5" />
                    </svg>
                  )}
                </div>
                <span className="author-name">
                  {msg.role === 'user' ? 'You' : 'LexGuard AI'}
                </span>
              </div>
              <time className="thread-message-time" dateTime={msg.created_at}>
                {formatThreadTime(msg.created_at)}
              </time>
            </div>

            {msg.role === 'user' ? (
              <p className="user-query-text">{msg.content}</p>
            ) : (
              <div className="assistant-answer-text">
                {msg.content.split('\n').map((line, i) => (
                  line ? <p key={i}>{line}</p> : <br key={i} />
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// NonBlockingPersistenceWarning — shown if message save failed but the
// legal answer was still delivered successfully.
// ---------------------------------------------------------------------------
function NonBlockingPersistenceWarning({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="non-blocking-warning" role="status" aria-live="polite">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <span>{message}</span>
      <button
        type="button"
        className="warning-dismiss-btn"
        onClick={onDismiss}
        aria-label="Dismiss warning"
      >
        ×
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LexGuardChatView — main authenticated chat page
// Preserves all Phase 1 LexGuard functionality.
// Adds Phase 2 conversation history sidebar and message persistence.
// ---------------------------------------------------------------------------
function LexGuardChatView() {
  const { user } = useAuth();

  // ── Existing chat state ──────────────────────────────────────────────────
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

  // ── Phase 2: History state ───────────────────────────────────────────────
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const activeConversationIdRef = useRef(null); // ref to avoid stale closures

  const [historicalMessages, setHistoricalMessages] = useState(null); // messages of a selected past conv
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [selectedConvTitle, setSelectedConvTitle] = useState('');
  const [historyLoading, setHistoryLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Non-blocking persistence warning (does NOT replace the legal answer)
  const [persistWarning, setPersistWarning] = useState(null);

  // Guard against double-submit (React Strict Mode / rapid clicks)
  const isSubmittingRef = useRef(false);

  // Keep the ref in sync with state
  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  // ── Load conversations on mount ──────────────────────────────────────────
  // refreshConversations is also called after each successful chat exchange.
  const refreshConversations = useCallback(async () => {
    if (!user) return;
    const { data } = await fetchUserConversations();
    if (data) setConversations(data);
  }, [user]);

  // Initial load — wrapped in an immediately-invoked async to satisfy linter
  useEffect(() => {
    let active = true;
    async function load() {
      if (!user) return;
      setHistoryLoading(true);
      const { data } = await fetchUserConversations();
      if (active) {
        setHistoryLoading(false);
        if (data) setConversations(data);
      }
    }
    load();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ── Initial backend health ping ──────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    checkBackendHealth().then((res) => {
      if (isMounted) setIsBackendHealthy(res.isHealthy);
    });
    return () => { isMounted = false; };
  }, []);

  // ── Submit handler ───────────────────────────────────────────────────────
  const handleSubmit = async (queryToSubmit) => {
    // Guard: prevent duplicate submissions
    if (isSubmittingRef.current) return;

    const targetQuery = typeof queryToSubmit === 'string' ? queryToSubmit : query;
    const cleanQuery = (targetQuery || '').trim();

    if (!cleanQuery) {
      setValidationError('Please enter a legal research question.');
      return;
    }

    isSubmittingRef.current = true;

    setValidationError(null);
    setError(null);
    setErrorDetails(null);
    setIsNetworkError(false);
    setIsLoading(true);
    setSubmittedQuery(cleanQuery);
    // Clear thread view — new answer will be rendered in the results section
    setHistoricalMessages(null);
    setSelectedConvTitle('');
    setPersistWarning(null);

    // ── STEP 1: Ensure conversation exists ────────────────────────────────
    let conversationId = activeConversationIdRef.current;

    if (!conversationId) {
      // First question in a new session — create a conversation
      if (user) {
        const title = deriveTitleFromQuestion(cleanQuery);
        const { data: newConv, error: convErr } = await createConversation(user.id, title);
        if (!convErr && newConv) {
          conversationId = newConv.id;
          setActiveConversationId(newConv.id);
          activeConversationIdRef.current = newConv.id;
          // Optimistically add to sidebar
          setConversations((prev) => [newConv, ...prev]);
        } else {
          console.warn('Could not create conversation:', convErr?.message);
          // Proceed without persistence — legal answer must still be delivered
        }
      }
    }

    // ── STEP 2: Save user message ─────────────────────────────────────────
    if (conversationId && user) {
      const { error: saveUserMsgErr } = await saveMessage(conversationId, 'user', cleanQuery);
      if (saveUserMsgErr) {
        console.warn('Could not save user message:', saveUserMsgErr.message);
        // Non-blocking: continue with the legal pipeline
      }
    }

    // ── STEP 3: Call existing LexGuard backend (unchanged) ────────────────
    const result = await askLexGuard(cleanQuery);

    setIsLoading(false);

    if (result.ok) {
      setResponse(result.data);
      setIsBackendHealthy(true);

      // ── STEP 4: Save assistant message ───────────────────────────────────
      // Store only the human-readable final answer, not the full JSON.
      if (conversationId && user) {
        const assistantAnswer = result.data?.answer || '';
        if (assistantAnswer) {
          const { error: saveAssistMsgErr } = await saveMessage(conversationId, 'assistant', assistantAnswer);
          if (saveAssistMsgErr) {
            console.warn('Could not save assistant message:', saveAssistMsgErr.message);
            // Show a non-blocking warning — the legal answer was still delivered
            setPersistWarning('Answer delivered, but could not save to history. Your research results are displayed above.');
          }
        }
      }

      // Refresh conversations so updated_at is current in the sidebar
      refreshConversations();

      // Scroll results into view
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      // Backend failed — do NOT save a fake assistant message
      setError(result.error);
      setErrorDetails(result.details || null);
      setIsNetworkError(Boolean(result.isNetworkError));
      if (result.isNetworkError) setIsBackendHealthy(false);
    }

    isSubmittingRef.current = false;
  };

  // ── Reset / New Research ─────────────────────────────────────────────────
  const handleReset = () => {
    setQuery('');
    setSubmittedQuery('');
    setResponse(null);
    setError(null);
    setErrorDetails(null);
    setIsNetworkError(false);
    setValidationError(null);
    setActiveConversationId(null);
    activeConversationIdRef.current = null;
    setHistoricalMessages(null);
    setSelectedConvTitle('');
    setPersistWarning(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Select a past conversation from the sidebar ──────────────────────────
  const handleSelectConversation = async (conv) => {
    if (!conv?.id) return;

    // If same conversation is already active, no need to reload
    if (conv.id === activeConversationIdRef.current) return;

    // Clear current in-progress state
    setResponse(null);
    setError(null);
    setErrorDetails(null);
    setValidationError(null);
    setSubmittedQuery('');
    setQuery('');
    setPersistWarning(null);

    // Set the selected conversation as active
    setActiveConversationId(conv.id);
    activeConversationIdRef.current = conv.id;
    setSelectedConvTitle(conv.title || 'Legal Research');

    // Load its messages
    setIsLoadingMessages(true);
    setHistoricalMessages(null);
    const { data: msgs, error: msgsErr } = await fetchConversationMessages(conv.id);
    setIsLoadingMessages(false);

    if (!msgsErr && msgs) {
      setHistoricalMessages(msgs);
    } else {
      console.warn('Could not load conversation messages:', msgsErr?.message);
      setHistoricalMessages([]);
    }

    // On mobile, close the sidebar after selection
    if (window.innerWidth < 900) {
      setSidebarOpen(false);
    }
  };

  // ── New Research from sidebar ────────────────────────────────────────────
  const handleNewResearch = () => {
    handleReset();
    // On mobile, close the sidebar
    if (window.innerWidth < 900) {
      setSidebarOpen(false);
    }
  };

  // ── Example question selection (existing behaviour) ──────────────────────
  const handleSelectExample = (exampleText) => {
    setQuery(exampleText);
    setValidationError(null);
    handleSubmit(exampleText);
  };

  // ── Show thread view when a past conversation is open (no new result yet) ─
  const showThreadView = historicalMessages !== null && !response && !isLoading && !error;

  return (
    <div className="app-container">
      <Header
        onReset={handleReset}
        onOpenArchitecture={() => { setModalTab('architecture'); setIsModalOpen(true); }}
        onOpenAbout={() => { setModalTab('about'); setIsModalOpen(true); }}
        isConnected={isBackendHealthy}
        onToggleHistory={() => setSidebarOpen((prev) => !prev)}
        sidebarOpen={sidebarOpen}
      />

      <div className="chat-layout-wrapper">
        {/* ── History Sidebar ─────────────────────────────────────────────── */}
        <ConversationHistory
          conversations={conversations}
          activeConversationId={activeConversationId}
          isLoading={historyLoading}
          onNewResearch={handleNewResearch}
          onSelectConversation={handleSelectConversation}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((prev) => !prev)}
        />

        {/* ── Main Chat Content ───────────────────────────────────────────── */}
        <main className="main-content">
          {/* Non-blocking persistence warning */}
          <NonBlockingPersistenceWarning
            message={persistWarning}
            onDismiss={() => setPersistWarning(null)}
          />

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

          {/* ── Historical thread view (past conversation) ────────────────── */}
          {showThreadView && (
            <ConversationThreadView
              messages={historicalMessages}
              isLoadingMessages={isLoadingMessages}
              conversationTitle={selectedConvTitle}
            />
          )}

          {/* ── Current research result ───────────────────────────────────── */}
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
                      <polyline points="1 4 1 10 7 10" />
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                    </svg>
                    <span>New Research</span>
                  </button>
                </div>
              </div>

              <div className="result-question">
                <p className="result-question-label">Your question</p>
                <p className="result-question-text">{submittedQuery || response.query}</p>
              </div>

              <AnswerCard
                answer={response.answer}
              />

              <WarningCard warning={response.warning} />

              <EvidenceCard
                documents={response.retrieved_documents || response.documents || response.sources}
                verifiedClaims={response.verified_claims}
              />

              <VerificationStatus
                evidenceSufficient={response.evidence_sufficient}
                conflictingSources={response.conflicting_sources}
              />

              <details className="result-details">
                <summary>Verification and research details</summary>
                <div className="result-details-content">
                  <VerifiedClaims claims={response.verified_claims} />
                  {response.query_analysis && (
                    <QueryIntelligenceCard queryAnalysis={response.query_analysis} />
                  )}
                </div>
              </details>

              <Disclaimer />
            </section>
          )}

          {/* ── Empty state — no result, not loading, no history selected ── */}
          {!response && !isLoading && !error && !showThreadView && (
            <EmptyState onSelectExample={handleSelectExample} />
          )}
        </main>
      </div>

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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* Reset password */}
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Main Authenticated LexGuard Chat */}
          <Route element={<ProtectedRoute />}>
            <Route path="/chat" element={<LexGuardChatView />} />
          </Route>

          {/* Admin Dashboard */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/chat" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
