/**
 * LexGuard AI — Conversation & Message Persistence Service (Phase 2)
 *
 * Provides all database operations for conversations and messages.
 * Designed to be fully independent of the internal agent pipeline.
 * Future Query Agent / Explanation Agent integration will NOT require
 * changes to this service — the database contract is:
 *
 *   role = 'user'      → original question as typed by the user
 *   role = 'assistant' → final human-readable answer displayed to user
 *
 * No service-role keys are used. All operations use the authenticated
 * user's JWT session, enforced by Supabase RLS policies.
 */

import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// Conversation Operations
// ---------------------------------------------------------------------------

/**
 * Load all conversations for the currently authenticated user,
 * ordered by most-recently-updated first (updated_at DESC).
 *
 * @returns {Promise<{ data: Array|null, error: Error|null }>}
 */
export async function fetchUserConversations() {
  const { data, error } = await supabase
    .from('conversations')
    .select('id, title, created_at, updated_at')
    .order('updated_at', { ascending: false });

  return { data, error };
}

/**
 * Create a new conversation for the authenticated user.
 * A conversation is ONLY created when the user submits their first question —
 * never on page load or when "New Research" is clicked.
 *
 * @param {string} userId       — auth.uid() of the current user
 * @param {string} title        — title derived from the first user question
 * @returns {Promise<{ data: object|null, error: Error|null }>}
 */
export async function createConversation(userId, title) {
  const safeTitle = (title || 'Legal Research').substring(0, 120);

  const { data, error } = await supabase
    .from('conversations')
    .insert([{ user_id: userId, title: safeTitle }])
    .select('id, title, created_at, updated_at')
    .single();

  return { data, error };
}

// ---------------------------------------------------------------------------
// Message Operations
// ---------------------------------------------------------------------------

/**
 * Load all messages belonging to a specific conversation, ordered
 * chronologically (created_at ASC) for correct display order.
 *
 * RLS ensures only the conversation's owner can read its messages.
 *
 * @param {string} conversationId
 * @returns {Promise<{ data: Array|null, error: Error|null }>}
 */
export async function fetchConversationMessages(conversationId) {
  const { data, error } = await supabase
    .from('messages')
    .select('id, role, content, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  return { data, error };
}

/**
 * Save a single message (user or assistant) into an existing conversation.
 *
 * The database trigger `update_conversation_updated_at` automatically
 * updates conversations.updated_at when a new message is inserted.
 *
 * @param {string} conversationId
 * @param {'user'|'assistant'} role
 * @param {string} content
 * @returns {Promise<{ data: object|null, error: Error|null }>}
 */
export async function saveMessage(conversationId, role, content) {
  const { data, error } = await supabase
    .from('messages')
    .insert([{ conversation_id: conversationId, role, content }])
    .select('id, role, content, created_at')
    .single();

  return { data, error };
}

// ---------------------------------------------------------------------------
// Derived / Utility
// ---------------------------------------------------------------------------

/**
 * Generate a concise, useful title from the first question the user asked.
 * Truncates to 80 characters maximum.
 *
 * @param {string} firstQuestion
 * @returns {string}
 */
export function deriveTitleFromQuestion(firstQuestion) {
  const cleaned = (firstQuestion || '').trim().replace(/\s+/g, ' ');
  if (cleaned.length <= 80) return cleaned;
  // Truncate at a word boundary near character 80
  const truncated = cleaned.substring(0, 80);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 40 ? truncated.substring(0, lastSpace) : truncated) + '\u2026';
}
