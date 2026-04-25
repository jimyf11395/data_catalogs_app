const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const DQ_RULE_TYPES = ['Completeness', 'Uniqueness', 'Validity', 'Consistency', 'Timeliness', 'Accuracy'] as const;
export const DQ_SEVERITIES = ['Critical', 'High', 'Medium', 'Low'] as const;
export type DqRuleType = typeof DQ_RULE_TYPES[number];
export type DqSeverity = typeof DQ_SEVERITIES[number];

export interface DqRuleEntry {
  id: string;
  name: string;
  rule_type: DqRuleType | null;
  description: string | null;
  target_table: string | null;
  target_column: string | null;
  condition: string | null;
  severity: DqSeverity | null;
  owner: string | null;
  tags: string[];
  created_at: string; created_by: string;
  modified_at: string | null; modified_by: string | null;
  deleted_at: string | null; deleted_by: string | null;
  user_id: string;
}

export type DqRuleInput = Pick<DqRuleEntry, 'name' | 'rule_type' | 'description' | 'target_table' | 'target_column' | 'condition' | 'severity' | 'owner' | 'tags'>;

async function request<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { ...options, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options?.headers } });
  if (!res.ok) { const err = await res.json().catch(() => ({ error: 'Request failed' })); throw new Error(err.error || 'Request failed'); }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const dqRulesApi = {
  getAll: (token: string) => request<DqRuleEntry[]>('/dq-rules', token),
  create: (token: string, entry: DqRuleInput) => request<DqRuleEntry>('/dq-rules', token, { method: 'POST', body: JSON.stringify(entry) }),
  bulk: (token: string, entries: DqRuleInput[]) =>
    request<DqRuleEntry[]>('/dq-rules/bulk', token, { method: 'POST', body: JSON.stringify(entries) }),
  update: (token: string, id: string, entry: Partial<DqRuleInput>) => request<DqRuleEntry>(`/dq-rules/${id}`, token, { method: 'PUT', body: JSON.stringify(entry) }),
  delete: (token: string, id: string) => request<void>(`/dq-rules/${id}`, token, { method: 'DELETE' }),
};
