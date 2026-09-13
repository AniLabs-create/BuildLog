/**
 * API Service Client
 *
 * Provides a typed HTTP request helper that:
 * 1. Points to the FastAPI backend URL (defaults to http://localhost:8000/api).
 * 2. Automatically attaches the stored JWT token in the Authorization header.
 * 3. Handles JSON serialization and parses error details from FastAPI responses.
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://buildlog-zab9.onrender.com/api';

interface RequestOptions extends RequestInit {
  data?: unknown;
}

interface FastAPIErrorPayload {
  detail?: string | Array<{ msg?: string } | string>;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { data, headers: customHeaders, ...customConfig } = options;

  // Retrieve stored JWT token
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  // If token exists, inject Bearer header
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...customConfig,
    headers,
  };

  if (data !== undefined) {
    config.body = JSON.stringify(data);
  }

  // Ensure endpoint starts with a slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const response = await fetch(url, config);

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  let responseData: unknown = null;
  try {
    responseData = await response.json();
  } catch {
    // Response had no JSON body (e.g. an empty error response) — keep null.
  }

  if (!response.ok) {
    // If backend sent a FastAPI error structure { "detail": "..." }
    let errorMessage = 'An unexpected network error occurred.';
    const errorPayload = responseData as FastAPIErrorPayload | null;

    if (errorPayload?.detail) {
      if (typeof errorPayload.detail === 'string') {
        errorMessage = errorPayload.detail;
      } else if (Array.isArray(errorPayload.detail)) {
        errorMessage = errorPayload.detail
          .map((err) => (typeof err === 'object' && err?.msg ? err.msg : String(err)))
          .join(', ');
      }
    }
    throw new Error(errorMessage);
  }

  return responseData as T;
}
