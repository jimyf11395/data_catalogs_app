const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const CATALOG_TYPES = ['Source', 'Bronce', 'Silver', 'Gold'] as const;
export type CatalogType = typeof CATALOG_TYPES[number];

export interface CatalogEntry {
  id: string;
  source_system: string | null;
  db_name: string | null;
  schema_name: string;
  table_name: string;
  type: CatalogType | null;
  description: string | null;
  owner: string | null;
  tags: string[];
  created_at: string;
  created_by: string;
  modified_at: string | null;
  modified_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  user_id: string;
}

export type CatalogInput = Pick<
  CatalogEntry,
  'source_system' | 'db_name' | 'schema_name' | 'table_name' | 'type' | 'description' | 'owner' | 'tags'
>;

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

export const catalogApi = {
  getAll: (token: string) =>
    request<CatalogEntry[]>('/catalog', token),
  create: (token: string, entry: CatalogInput) =>
    request<CatalogEntry>('/catalog', token, { method: 'POST', body: JSON.stringify(entry) }),
  bulk: (token: string, entries: CatalogInput[]) =>
    request<CatalogEntry[]>('/catalog/bulk', token, { method: 'POST', body: JSON.stringify(entries) }),
  update: (token: string, id: string, entry: Partial<CatalogInput>) =>
    request<CatalogEntry>(`/catalog/${id}`, token, { method: 'PUT', body: JSON.stringify(entry) }),
  delete: (token: string, id: string) =>
    request<void>(`/catalog/${id}`, token, { method: 'DELETE' }),
};
