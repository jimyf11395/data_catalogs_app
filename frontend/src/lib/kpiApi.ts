const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const KPI_FREQUENCIES = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'] as const;
export type KpiFrequency = typeof KPI_FREQUENCIES[number];

export interface KpiEntry {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  formula: string | null;
  unit: string | null;
  owner: string | null;
  frequency: KpiFrequency | null;
  tags: string[];
  created_at: string;
  created_by: string;
  modified_at: string | null;
  modified_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  user_id: string;
}

export type KpiInput = Pick<KpiEntry, 'name' | 'description' | 'category' | 'formula' | 'unit' | 'owner' | 'frequency' | 'tags'>;

async function request<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const kpiApi = {
  getAll: (token: string) => request<KpiEntry[]>('/kpis', token),
  create: (token: string, entry: KpiInput) =>
    request<KpiEntry>('/kpis', token, { method: 'POST', body: JSON.stringify(entry) }),
  bulk: (token: string, entries: KpiInput[]) =>
    request<KpiEntry[]>('/kpis/bulk', token, { method: 'POST', body: JSON.stringify(entries) }),
  update: (token: string, id: string, entry: Partial<KpiInput>) =>
    request<KpiEntry>(`/kpis/${id}`, token, { method: 'PUT', body: JSON.stringify(entry) }),
  delete: (token: string, id: string) =>
    request<void>(`/kpis/${id}`, token, { method: 'DELETE' }),
};
