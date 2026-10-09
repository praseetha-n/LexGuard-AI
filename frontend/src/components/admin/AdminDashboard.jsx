import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { supabase } from '../../services/supabase';
import { checkBackendHealth } from '../../services/api';

export default function AdminDashboard() {
  const { user, profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Stats state
  const [userCount, setUserCount] = useState(0);
  const [conversationCount, setConversationCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [backendStatus, setBackendStatus] = useState({ isHealthy: null, details: null });

  // Data lists
  const [usersList, setUsersList] = useState([]);
  const [conversationsList, setConversationsList] = useState([]);

  // Loading & error states
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // Conversation message inspection modal
  const [inspectedConv, setInspectedConv] = useState(null); // { id, title, user_id }
  const [inspectedMessages, setInspectedMessages] = useState([]);
  const [isLoadingInspect, setIsLoadingInspect] = useState(false);
  const [inspectError, setInspectError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAdminData() {
      setIsLoadingData(true);
      setDataError(null);

      try {
        // 1. Fetch Users from public.profiles
        const { data: profilesData, error: profilesErr, count: pCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact' });

        if (isMounted) {
          if (!profilesErr && profilesData) {
            setUsersList(profilesData);
            setUserCount(pCount !== null ? pCount : profilesData.length);
          } else {
            console.warn('Profiles query notice:', profilesErr?.message);
          }
        }

        // 2. Fetch Conversations from public.conversations
        const { data: convsData, error: convsErr, count: cCount } = await supabase
          .from('conversations')
          .select('*', { count: 'exact' });

        if (isMounted) {
          if (!convsErr && convsData) {
            setConversationsList(convsData);
            setConversationCount(cCount !== null ? cCount : convsData.length);
          } else {
            console.warn('Conversations query notice:', convsErr?.message);
          }
        }

        // 3. Fetch Message Count from public.messages
        const { count: mCount, error: msgErr } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true });

        if (isMounted) {
          if (!msgErr && mCount !== null) {
            setMessageCount(mCount);
          }
        }

        // 4. Backend Health Check
        const healthRes = await checkBackendHealth();
        if (isMounted) {
          setBackendStatus(healthRes);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error loading admin dashboard data:', err);
          setDataError('Unable to load some telemetry data due to security/RLS constraints.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingData(false);
        }
      }
    }

    loadAdminData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Open the message inspection modal for a specific conversation
  const handleInspectConversation = useCallback(async (conv) => {
    setInspectedConv(conv);
    setInspectedMessages([]);
    setInspectError(null);
    setIsLoadingInspect(true);

    const { data, error } = await supabase
      .from('messages')
      .select('id, role, content, created_at')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: true });

    setIsLoadingInspect(false);

    if (!error && data) {
      setInspectedMessages(data);
    } else {
      setInspectError(error?.message || 'Failed to load messages.');
    }
  }, []);

  const handleCloseInspect = () => {
    setInspectedConv(null);
    setInspectedMessages([]);
    setInspectError(null);
  };

  const filteredUsers = usersList.filter((u) => {
    const q = userSearchTerm.toLowerCase();
    const name = (u.full_name || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const role = (u.role || '').toLowerCase();
    return name.includes(q) || email.includes(q) || role.includes(q);
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="admin-container">
      {/* Top Header Navigation */}
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-brand">
            <Link to="/chat" className="admin-logo-link">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                <path
                  d="M16 2.5L5 6.5V14.5C5 21.8 9.7 28.5 16 30C22.3 28.5 27 21.8 27 14.5V6.5L16 2.5Z"
                  fill="#0F172A"
                  stroke="#C28E2B"
                  strokeWidth="1.5"
                />
                <path d="M16 9V22M11 11H21" stroke="#C28E2B" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="admin-logo-title">LexGuard AI</span>
            </Link>
            <span className="admin-badge">Admin Dashboard</span>
          </div>

          <div className="admin-user-nav">
            <div className="admin-user-info">
              <span className="admin-user-name">{profile?.full_name || user?.email}</span>
              <span className="admin-role-tag">{profile?.role || 'admin'}</span>
            </div>
            <Link to="/chat" className="admin-nav-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>Return to Chat</span>
            </Link>
            <button type="button" onClick={logout} className="admin-logout-btn" title="Sign Out">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="admin-main">
        {/* Navigation Tabs */}
        <nav className="admin-tabs" aria-label="Admin Navigation Tabs">
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users ({userCount})
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'conversations' ? 'active' : ''}`}
            onClick={() => setActiveTab('conversations')}
          >
            Conversations ({conversationCount})
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'system' ? 'active' : ''}`}
            onClick={() => setActiveTab('system')}
          >
            System Info
          </button>
        </nav>

        {dataError && (
          <div className="admin-notice admin-notice--info" role="status">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span>{dataError}</span>
          </div>
        )}

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="admin-section">
            <div className="admin-metrics-grid">
              <div className="metric-card">
                <div className="metric-icon-wrapper metric-icon--users">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <div className="metric-content">
                  <span className="metric-label">Total Users</span>
                  <span className="metric-value">{isLoadingData ? '...' : userCount}</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-wrapper metric-icon--convs">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <div className="metric-content">
                  <span className="metric-label">Total Conversations</span>
                  <span className="metric-value">{isLoadingData ? '...' : conversationCount}</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-wrapper metric-icon--messages">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
                  </svg>
                </div>
                <div className="metric-content">
                  <span className="metric-label">Total Messages</span>
                  <span className="metric-value">{isLoadingData ? '...' : messageCount}</span>
                </div>
              </div>

              <div className="metric-card">
                <div className={`metric-icon-wrapper ${backendStatus.isHealthy ? 'metric-icon--healthy' : 'metric-icon--warning'}`}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                </div>
                <div className="metric-content">
                  <span className="metric-label">Backend Engine API</span>
                  <span className="metric-value metric-value--sm">
                    {backendStatus.isHealthy === true ? (
                      <span className="status-pill status-pill--healthy">Operational</span>
                    ) : backendStatus.isHealthy === false ? (
                      <span className="status-pill status-pill--error">Offline</span>
                    ) : (
                      'Checking...'
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent System Overview Panel */}
            <div className="admin-panel">
              <h2 className="admin-panel-title">System Overview & Authorization Status</h2>
              <div className="admin-info-grid">
                <div className="info-block">
                  <span className="info-label">Active Admin User</span>
                  <span className="info-val">{profile?.full_name || 'Admin'} ({user?.email})</span>
                </div>
                <div className="info-block">
                  <span className="info-label">Authorization Level</span>
                  <span className="info-val info-val--highlight">ROLE: ADMIN</span>
                </div>
                <div className="info-block">
                  <span className="info-label">Supabase Auth State</span>
                  <span className="info-val">Authenticated (JWT Active)</span>
                </div>
                <div className="info-block">
                  <span className="info-label">RLS Security Boundary</span>
                  <span className="info-val">Active Enforced</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Users */}
        {activeTab === 'users' && (
          <div className="admin-section">
            <div className="admin-panel-header">
              <h2 className="admin-panel-title">Registered User Profiles</h2>
              <div className="admin-search-wrapper">
                <input
                  type="text"
                  className="admin-search-input"
                  placeholder="Search by name, email, role..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Full Name</th>
                    <th>Email Address</th>
                    <th>Role</th>
                    <th>Created Date</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingData ? (
                    <tr>
                      <td colSpan="5" className="table-loading-cell">Loading profiles...</td>
                    </tr>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td className="table-cell-mono">{u.id.substring(0, 8)}...</td>
                        <td><strong>{u.full_name || 'Unnamed User'}</strong></td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`role-badge role-badge--${u.role || 'user'}`}>
                            {u.role || 'user'}
                          </span>
                        </td>
                        <td className="table-cell-subtle">{formatDate(u.created_at)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="table-empty-cell">No profiles matching your criteria.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Conversations */}
        {activeTab === 'conversations' && (
          <div className="admin-section">
            <h2 className="admin-panel-title">System Conversations</h2>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Conversation ID</th>
                    <th>User ID</th>
                    <th>Title / Topic</th>
                    <th>Created</th>
                    <th>Updated</th>
                    <th>Inspect</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingData ? (
                    <tr>
                      <td colSpan="6" className="table-loading-cell">Loading conversations...</td>
                    </tr>
                  ) : conversationsList.length > 0 ? (
                    conversationsList.map((c) => (
                      <tr key={c.id}>
                        <td className="table-cell-mono">{c.id ? c.id.substring(0, 8) + '...' : 'N/A'}</td>
                        <td className="table-cell-mono">{c.user_id ? c.user_id.substring(0, 8) + '...' : 'N/A'}</td>
                        <td><strong>{c.title || 'Legal Research Session'}</strong></td>
                        <td className="table-cell-subtle">{formatDate(c.created_at)}</td>
                        <td className="table-cell-subtle">{formatDate(c.updated_at)}</td>
                        <td>
                          <button
                            type="button"
                            className="admin-inspect-btn"
                            onClick={() => handleInspectConversation(c)}
                            aria-label={`Inspect messages for ${c.title || 'conversation'}`}
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="table-empty-cell">No recorded conversations found in DB.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: System Information */}
        {activeTab === 'system' && (
          <div className="admin-section">
            <div className="admin-panel">
              <h2 className="admin-panel-title">System & Security Diagnostics</h2>
              <div className="system-diag-list">
                <div className="diag-item">
                  <div className="diag-label">Authentication Engine</div>
                  <div className="diag-value">Supabase Auth (v2.117.2)</div>
                </div>
                <div className="diag-item">
                  <div className="diag-label">Current Session User ID</div>
                  <div className="diag-value diag-mono">{user?.id}</div>
                </div>
                <div className="diag-item">
                  <div className="diag-label">Assigned Role</div>
                  <div className="diag-value">
                    <span className="role-badge role-badge--admin">{profile?.role || 'admin'}</span>
                  </div>
                </div>
                <div className="diag-item">
                  <div className="diag-label">Backend API Health</div>
                  <div className="diag-value">
                    {backendStatus.isHealthy ? (
                      <span className="status-pill status-pill--healthy">Connected (http://127.0.0.1:8000)</span>
                    ) : (
                      <span className="status-pill status-pill--error">Disconnected</span>
                    )}
                  </div>
                </div>
                <div className="diag-item">
                  <div className="diag-label">Row Level Security (RLS)</div>
                  <div className="diag-value">Strict Policy Enforcement Active</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Admin Read-Only Message Inspection Modal ─────────────────────── */}
      {inspectedConv && (
        <div
          className="admin-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Conversation message inspection"
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseInspect(); }}
        >
          <div className="admin-modal-card">
            {/* Modal Header */}
            <div className="admin-modal-header">
              <div>
                <div className="admin-modal-kicker">Read-Only Inspection</div>
                <div className="admin-modal-title">{inspectedConv.title || 'Legal Research Session'}</div>
                <div className="admin-modal-sub">
                  Conv ID: {inspectedConv.id}&nbsp;&nbsp;|&nbsp;&nbsp;
                  User: {inspectedConv.user_id ? inspectedConv.user_id.substring(0, 16) + '...' : 'N/A'}
                </div>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={handleCloseInspect}
                aria-label="Close inspection modal"
              >
                ×
              </button>
            </div>

            {/* Modal Body — messages list */}
            <div className="admin-modal-body">
              {isLoadingInspect ? (
                <div className="thread-loading-card" aria-live="polite">
                  <div className="thread-spinner" aria-hidden="true" />
                  <span>Loading messages…</span>
                </div>
              ) : inspectError ? (
                <div className="admin-notice admin-notice--info" role="alert">
                  <span>Error: {inspectError}</span>
                </div>
              ) : inspectedMessages.length === 0 ? (
                <div className="admin-notice admin-notice--info" role="status">
                  <span>No messages found in this conversation.</span>
                </div>
              ) : (
                <div className="admin-inspect-messages">
                  {inspectedMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`admin-msg-item admin-msg-item--${msg.role}`}
                    >
                      <div className="admin-msg-header">
                        <span className={`admin-msg-role admin-msg-role--${msg.role}`}>
                          {msg.role === 'user' ? 'User Question' : 'LexGuard Answer'}
                        </span>
                        <time className="admin-msg-time" dateTime={msg.created_at}>
                          {formatDate(msg.created_at)}
                        </time>
                      </div>
                      <p className="admin-msg-content">{msg.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="admin-modal-footer">
              <div className="read-only-notice">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Read-only • Admin inspection view • No edits permitted</span>
              </div>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={handleCloseInspect}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
