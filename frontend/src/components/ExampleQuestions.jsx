import React from 'react';

const SUGGESTED_QUESTIONS = [
  'Can an employer terminate an employee without notice?',
  'What are the requirements for termination?',
  'What rights does an employee have after termination?',
  'What notice is required for termination?'
];

export default function ExampleQuestions({ onSelectQuestion, disabled }) {
  return (
    <div className="example-questions-container" aria-label="Suggested legal research questions">
      <div className="example-questions-header">
        <svg 
          className="example-icon" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <span>Sample employment law inquiries:</span>
      </div>
      <div className="example-chips" role="list">
        {SUGGESTED_QUESTIONS.map((question, index) => (
          <button
            key={index}
            type="button"
            className="example-chip"
            onClick={() => onSelectQuestion(question)}
            disabled={disabled}
            role="listitem"
            title={`Select query: "${question}"`}
          >
            <span className="chip-bullet">§</span>
            <span className="chip-text">{question}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
