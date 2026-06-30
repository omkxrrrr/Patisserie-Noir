/**
 * src/api/client.js
 * ───────────────────────────────────────────────────────────────────
 * Every network call to the backend goes through here. Two important
 * details:
 *
 * 1. POST requests use `Content-Type: text/plain` on purpose. Apps
 *    Script web apps don't implement doOptions(), so a JSON content
 *    type would trigger a CORS preflight that simply fails. text/plain
 *    is a "simple request" and skips preflight; Code.gs parses the
 *    body as JSON regardless of the header.
 * 2. Every request carries `secret`, matched against the Script
 *    Property of the same name on the backend, so the public /exec
 *    URL can't be driven by anyone who doesn't have this build.
 * ───────────────────────────────────────────────────────────────────
 */

const BASE_URL = import.meta.env.VITE_APPS_SCRIPT_URL;
const API_SECRET = import.meta.env.VITE_API_SECRET;

class ApiError extends Error {}

function assertConfigured() {
  if (!BASE_URL) {
    throw new ApiError(
      'VITE_APPS_SCRIPT_URL is not set. Copy .env.example to .env.local and add your deployed Apps Script Web App URL.'
    );
  }
}

export async function apiGet(action, params = {}) {
  assertConfigured();
  const query = new URLSearchParams({ action, secret: API_SECRET, ...flatten(params) });
  const res = await fetch(`${BASE_URL}?${query.toString()}`, { method: 'GET' });
  return unwrap(res);
}

export async function apiPost(action, payload = {}) {
  assertConfigured();
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, secret: API_SECRET, ...payload })
  });
  return unwrap(res);
}

function flatten(params) {
  // URLSearchParams can't take booleans/numbers directly in all browsers reliably; stringify.
  const out = {};
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) out[k] = String(v);
  });
  return out;
}

async function unwrap(res) {
  if (!res.ok) {
    throw new ApiError(`Network error (${res.status}). Please try again.`);
  }
  let json;
  try {
    json = await res.json();
  } catch {
    throw new ApiError('The server returned an unexpected response.');
  }
  if (!json.success) {
    throw new ApiError(json.error || 'Something went wrong.');
  }
  return json.data;
}

export { ApiError };
