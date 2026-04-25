const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const GLOSSARY_STATUSES = ['Draft', 'Approved', 'Deprecated'] as const;
export type GlossaryStatus = typeof GLOSSARY_STATUSES[number];

export interface GlossaryEntry {
  id: string;
  term: string;
  definition: string | null;
  business_owner: string | null;
  data_owner: string | null;
  domain: string | null;
  status: GlossaryStatus | null;
  related_terms: string[];
  tags: string[];
  created_at: string; created_by: string;
  modified_at: string | null; modified_by: string | null;
  deleted_at: string | null; deleted_by: string | null;
  user_id: string;
}

export type GlossaryInput = Pick<GlossaryEntry, 'term' | 'definition' | 'business_owner' | 'data_owner' | 'domain' | 'status' | 'related_terms' | 'tags'>;

async function request<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { ...options, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options?.headers } });
  if (!res.ok) { const err = await res.json().catch(() => ({ error: 'Request failed' })); throw new Error(err.error || 'Request failed'); }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const glossaryApi = {
  getAll: (token: string) => request<GlossaryEntry[]>('/glossary', token),
  create: (token: string, entry: GlossaryInput) => request<GlossaryEntry>('/glossary', token, { method: 'POST', body: JSON.stringify(entry) }),
  bulk: (token: string, entries: GlossaryInput[]) =>
    request<GlossaryEntry[]>('/glossary/bulk', token, { method: 'POST', body: JSON.stringify(entries) }),
  update: (token: string, id: string, entry: Partial<GlossaryInput>) => request<GlossaryEntry>(`/glossary/${id}`, token, { method: 'PUT', body: JSON.stringify(entry) }),
  delete: (token: string, id: string) => request<void>(`/glossary/${id}`, token, { method: 'DELETE' }),
};
