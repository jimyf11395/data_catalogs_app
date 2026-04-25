const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const REPORT_STATUSES = ['Active', 'Deprecated', 'Under Review'] as const;
export type ReportStatus = typeof REPORT_STATUSES[number];

export interface ReportEntry {
  id: string;
  name: string;
  tool: string | null;
  url: string | null;
  description: string | null;
  owner: string | null;
  business_users: string | null;
  source_tables: string[];
  status: ReportStatus | null;
  refresh_frequency: string | null;
  tags: string[];
  created_at: string; created_by: string;
  modified_at: string | null; modified_by: string | null;
  deleted_at: string | null; deleted_by: string | null;
  user_id: string;
}

export type ReportInput = Pick<ReportEntry, 'name' | 'tool' | 'url' | 'description' | 'owner' | 'business_users' | 'source_tables' | 'status' | 'refresh_frequency' | 'tags'>;

async function request<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { ...options, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options?.headers } });
  if (!res.ok) { const err = await res.json().catch(() => ({ error: 'Request failed' })); throw new Error(err.error || 'Request failed'); }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const reportsApi = {
  getAll: (token: string) => request<ReportEntry[]>('/reports', token),
  create: (token: string, entry: ReportInput) => request<ReportEntry>('/reports', token, { method: 'POST', body: JSON.stringify(entry) }),
  bulk: (token: string, entries: ReportInput[]) =>
    request<ReportEntry[]>('/reports/bulk', token, { method: 'POST', body: JSON.stringify(entries) }),
  update: (token: string, id: string, entry: Partial<ReportInput>) => request<ReportEntry>(`/reports/${id}`, token, { method: 'PUT', body: JSON.stringify(entry) }),
  delete: (token: string, id: string) => request<void>(`/reports/${id}`, token, { method: 'DELETE' }),
};
