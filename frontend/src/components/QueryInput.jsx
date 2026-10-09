import React, { useRef, useEffect } from 'react';
import ExampleQuestions from './ExampleQuestions';

export default function QueryInput({
  query,
  setQuery,
  onSubmit,
  isLoading,
  validationError,
  setValidationError
}) {
  const textareaRef = useRef(null);

  // Auto-resize textarea height to accommodate multi-line queries
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.max(120, Math.min(scrollHeight, 320))}px`;
    }
  }, [query]);

  const handleKeyDown = (e) => {
    // Submit on Cmd+Enter or Ctrl+Enter or plain Enter (if without shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleClear = () => {
    setQuery('');
    if (validationError) setValidationError(null);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSelectExample = (exampleText) => {
    setQuery(exampleText);
    if (validationError) setValidationError(null);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <section className="query-hero-section" aria-labelledby="query-section-heading">
      <div className="hero-copy">
        <h1 id="query-section-heading" className="hero-title">
          Evidence-Verified Legal Research
        </h1>
        <p className="hero-subtitle">
          Ask a legal research question and receive an evidence-backed response with transparent sources.
        </p>
      </div>

      <div className="query-card">
        <form 
          className="query-form" 
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          noValidate
        >
          <div className="textarea-wrapper">
            <label htmlFor="legal-query-input" className="visually-hidden">
              Ask an employment-related legal question
            </label>
            <textarea
              ref={textareaRef}
              id="legal-query-input"
              className={`query-textarea ${validationError ? 'query-textarea--error' : ''}`}
              value={query}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Ask an employment-related legal question..."
              rows={4}
              aria-invalid={!!validationError}
              aria-describedby={validationError ? 'query-validation-error' : undefined}
            />

            {query.length > 0 && !isLoading && (
              <button
                type="button"
                className="clear-input-btn"
                onClick={handleClear}
                title="Clear input"
                aria-label="Clear question text"
              >
                ✕
              </button>
            )}
          </div>

          {validationError && (
            <div id="query-validation-error" className="validation-error" role="alert">
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{validationError}</span>
            </div>
          )}

          <div className="query-form-footer">
            <div className="keyboard-hint">
              <span>Press <kbd>↵ Enter</kbd> to research • <kbd>Shift + ↵</kbd> for new line</span>
            </div>

            <button
              type="submit"
              id="ask-lexguard-btn"
              className="ask-button"
              disabled={isLoading || !query.trim()}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  <span>Researching...</span>
                </>
              ) : (
                <>
                  <svg 
                    className="btn-icon" 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                  <span>Ask LexGuard</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="query-examples-wrapper">
          <ExampleQuestions 
            onSelectQuestion={handleSelectExample} 
            disabled={isLoading} 
          />
        </div>
      </div>
    </section>
  );
}
