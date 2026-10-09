/**
 * LexGuard AI - API Service
 * 
 * Handles HTTP communication with the Orchestrator backend service.
 * In development, calls relative paths (/ask, /health) which are proxied
 * by the Vite development server to http://127.0.0.1:8000 to eliminate
 * CORS preflight (OPTIONS) issues. Supports override via VITE_API_URL.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Submits a legal research query to the Orchestrator.
 * 
 * @param {string} query - The legal research question.
 * @param {AbortSignal} [signal] - Optional abort signal for cancelling the request.
 * @returns {Promise<{ ok: boolean, data?: any, error?: string, isNetworkError?: boolean, status?: number }>}
 */
export async function askLexGuard(query, signal) {
  const trimmed = (query || '').trim();
  if (!trimmed) {
    return {
      ok: false,
      error: 'Please enter a legal research question.',
      isNetworkError: false,
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query: trimmed }),
      signal,
    });

    if (!response.ok) {
      let errorDetail = `Server responded with status ${response.status}`;
      try {
        const errorJson = await response.json();
        if (errorJson && errorJson.detail) {
          errorDetail = typeof errorJson.detail === 'string' 
            ? errorJson.detail 
            : JSON.stringify(errorJson.detail);
        }
      } catch {
        // Fallback to response status text if JSON parsing fails
        if (response.statusText) {
          errorDetail = `${response.status}: ${response.statusText}`;
        }
      }

      return {
        ok: false,
        error: errorDetail,
        isNetworkError: false,
        status: response.status,
      };
    }

    const data = await response.json();
    return {
      ok: true,
      data,
    };
  } catch (err) {
    if (err.name === 'AbortError') {
      return {
        ok: false,
        error: 'Research request was cancelled.',
        isNetworkError: false,
      };
    }

    // Network error (CORS issue, connection refused, offline backend)
    return {
      ok: false,
      error: 'LexGuard AI is temporarily unavailable.',
      details: 'Please make sure the backend services are running and try again.',
      isNetworkError: true,
    };
  }
}

/**
 * Checks backend health status.
 * 
 * @returns {Promise<{ isHealthy: boolean, data?: any }>}
 */
export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (response.ok) {
      const data = await response.json();
      return { isHealthy: true, data };
    }
    return { isHealthy: false };
  } catch {
    return { isHealthy: false };
  }
}

export { API_BASE_URL };
