const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface LineageEntry {
  id: string;
  name: string;
  source_system: string | null;
  source_table: string | null;
  target_system: string | null;
  target_table: string | null;
  transformation: string | null;
  pipeline_name: string | null;
  schedule: string | null;
  owner: string | null;
  status: 'Active' | 'Deprecated' | null;
  tags: string[];
  created_at: string; created_by: string;
  modified_at: string | null; modified_by: string | null;
  deleted_at: string | null; deleted_by: string | null;
  user_id: string;
}

export type LineageInput = Pick<LineageEntry, 'name' | 'source_system' | 'source_table' | 'target_system' | 'target_table' | 'transformation' | 'pipeline_name' | 'schedule' | 'owner' | 'status' | 'tags'>;

async function request<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { ...options, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options?.headers } });
  if (!res.ok) { const err = await res.json().catch(() => ({ error: 'Request failed' })); throw new Error(err.error || 'Request failed'); }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const lineageApi = {
  getAll: (token: string) => request<LineageEntry[]>('/lineage', token),
  create: (token: string, entry: LineageInput) => request<LineageEntry>('/lineage', token, { method: 'POST', body: JSON.stringify(entry) }),
  bulk: (token: string, entries: LineageInput[]) =>
    request<LineageEntry[]>('/lineage/bulk', token, { method: 'POST', body: JSON.stringify(entries) }),
  update: (token: string, id: string, entry: Partial<LineageInput>) => request<LineageEntry>(`/lineage/${id}`, token, { method: 'PUT', body: JSON.stringify(entry) }),
  delete: (token: string, id: string) => request<void>(`/lineage/${id}`, token, { method: 'DELETE' }),
};
