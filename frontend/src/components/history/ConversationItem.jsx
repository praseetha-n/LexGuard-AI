/**
 * LexGuard AI — ConversationItem Component (Phase 2)
 *
 * Renders a single conversation entry in the history sidebar.
 * Displays the conversation title and timestamp.
 * Highlights when the conversation is currently active.
 */

import React from 'react';

/**
 * Format a date string for the sidebar list.
 * Returns a short human-readable time string.
 *
 * @param {string} dateStr — ISO date string
 * @returns {string}
 */
function formatSidebarTime(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

/**
 * @param {object} props
 * @param {object}   props.conversation  — { id, title, updated_at }
 * @param {boolean}  props.isActive      — whether this is the current open conversation
 * @param {function} props.onSelect      — called with conversation when user clicks
 */
export default function ConversationItem({ conversation, isActive, onSelect }) {
  const handleClick = () => {
    if (onSelect) onSelect(conversation);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={`history-item${isActive ? ' history-item--active' : ''}`}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-pressed={isActive}
      aria-label={`Open conversation: ${conversation.title}`}
      title={conversation.title}
    >
      <div className="history-item-icon" aria-hidden="true">
        {/* Chat bubble icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>

      <div className="history-item-content">
        <span className="history-item-title">{conversation.title || 'Legal Research'}</span>
        <span className="history-item-time">
          {formatSidebarTime(conversation.updated_at || conversation.created_at)}
        </span>
      </div>
    </div>
  );
}
