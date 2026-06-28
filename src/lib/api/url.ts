const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, '').replace(/\/api$/, '');
}

function normalizeEndpoint(endpoint: string) {
  const normalized = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return normalized.startsWith('/api/') ? normalized : `/api${normalized}`;
}

export function buildApiUrl(endpoint: string) {
  return `${normalizeBaseUrl(API_BASE_URL)}${normalizeEndpoint(endpoint)}`;
}
