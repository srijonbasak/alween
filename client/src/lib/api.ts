export const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');

export async function safeParseResponse(res: Response): Promise<{ data: any; ok: boolean; status: number }> {
  const contentType = res.headers.get('content-type') || '';
  let data: any;

  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = { error: 'Invalid JSON response from server.' };
    }
  } else {
    const text = await res.text();
    if (res.status === 401) {
      data = { error: 'Session expired or authentication required.' };
    } else if (res.status === 403) {
      data = { error: 'Access denied. Administrator privileges required.' };
    } else if (res.status === 404) {
      data = { error: 'Requested resource was not found on server.' };
    } else {
      data = { error: text || `Server returned non-JSON error (${res.status}).` };
    }
  }

  return { data, ok: res.ok, status: res.status };
}
