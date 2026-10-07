/**
 * LexGuard AI — ConversationHistory Sidebar Component (Phase 2)
 *
 * Left-side collapsible panel that displays the user's past conversations.
 * Groups conversations by date: Today / Yesterday / Earlier.
 * Provides "New Research" button and conversation selection.
 *
 * Props:
 *   conversations       — array of conversation objects from Supabase
 *   activeConversationId — currently selected conversation ID (or null)
 *   isLoading           — whether conversations are being fetched
 *   onNewResearch       — handler for clicking "+ New Research"
 *   onSelectConversation — handler called with the full conversation object
 *   isOpen              — whether the sidebar is expanded
 *   onToggle            — handler to open/close the sidebar
 */

import React, { useMemo } from 'react';
import ConversationItem from './ConversationItem';

/**
 * Classify a conversation into Today / Yesterday / Earlier.
 *
 * @param {string} dateStr — ISO date string (updated_at)
 * @returns {'today'|'yesterday'|'earlier'}
 */
function classifyDate(dateStr) {
  if (!dateStr) return 'earlier';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const itemDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    if (itemDay.getTime() === today.getTime()) return 'today';
    if (itemDay.getTime() === yesterday.getTime()) return 'yesterday';
    return 'earlier';
  } catch {
    return 'earlier';
  }
}

export default function ConversationHistory({
  conversations,
  activeConversationId,
  isLoading,
  onNewResearch,
  onSelectConversation,
  isOpen,
  onToggle,
}) {
  // Group conversations by date label
  const grouped = useMemo(() => {
    const groups = { today: [], yesterday: [], earlier: [] };
    (conversations || []).forEach((conv) => {
      const bucket = classifyDate(conv.updated_at || conv.created_at);
      groups[bucket].push(conv);
    });
    return groups;
  }, [conversations]);

  const hasAny =
    grouped.today.length > 0 ||
    grouped.yesterday.length > 0 ||
    grouped.earlier.length > 0;

  return (
    <>
      {/* Mobile backdrop — closes sidebar when tapping outside on small screens */}
      {isOpen && (
        <div
          className="history-backdrop"
          role="presentation"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      <aside
        className={`history-sidebar${isOpen ? ' history-sidebar--open' : ' history-sidebar--collapsed'}`}
        aria-label="Conversation History"
      >
        {/* Sidebar Header: New Research + collapse toggle */}
        <div className="history-header">
          <button
            type="button"
            className="new-research-btn"
            onClick={onNewResearch}
            title="Start a new legal research session"
            id="new-research-btn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>New Research</span>
          </button>

          <button
            type="button"
            className="history-toggle-btn"
            onClick={onToggle}
            title="Collapse history panel"
            aria-label="Collapse history panel"
            id="history-toggle-collapse-btn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        {/* Conversation List */}
        <div className="history-list-container" role="list" aria-label="Previous conversations">
          {isLoading ? (
            <div className="history-loading-state" aria-live="polite">
              <div className="history-spinner" aria-hidden="true" />
              <span>Loading history…</span>
            </div>
          ) : !hasAny ? (
            <div className="history-empty-state">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>No past conversations yet.</span>
              <span>Ask your first legal question to begin.</span>
            </div>
          ) : (
            <div className="history-groups">
              {grouped.today.length > 0 && (
                <div className="history-group">
                  <div className="history-group-title">Today</div>
                  <div className="history-group-items" role="list">
                    {grouped.today.map((conv) => (
                      <ConversationItem
                        key={conv.id}
                        conversation={conv}
                        isActive={conv.id === activeConversationId}
                        onSelect={onSelectConversation}
                      />
                    ))}
                  </div>
                </div>
              )}

              {grouped.yesterday.length > 0 && (
                <div className="history-group">
                  <div className="history-group-title">Yesterday</div>
                  <div className="history-group-items" role="list">
                    {grouped.yesterday.map((conv) => (
                      <ConversationItem
                        key={conv.id}
                        conversation={conv}
                        isActive={conv.id === activeConversationId}
                        onSelect={onSelectConversation}
                      />
                    ))}
                  </div>
                </div>
              )}

              {grouped.earlier.length > 0 && (
                <div className="history-group">
                  <div className="history-group-title">Earlier</div>
                  <div className="history-group-items" role="list">
                    {grouped.earlier.map((conv) => (
                      <ConversationItem
                        key={conv.id}
                        conversation={conv}
                        isActive={conv.id === activeConversationId}
                        onSelect={onSelectConversation}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
