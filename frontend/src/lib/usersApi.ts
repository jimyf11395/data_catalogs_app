const API_URL = import.meta.env.VITE_API_URL;

async function request<T>(path: string, token: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...opts?.headers },
  });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}

export type UserRole = 'Admin' | 'Editor' | 'Viewer';
export const USER_ROLES: readonly UserRole[] = ['Admin', 'Editor', 'Viewer'];

export interface UserEntry {
  id: string;
  email: string;
  created_at: string;
  role: UserRole;
}

export const usersApi = {
  getMyRole: (token: string) => request<{ role: UserRole }>('/users/me', token),
  getAll: (token: string) => request<UserEntry[]>('/users', token),
  setRole: (token: string, userId: string, role: UserRole) =>
    request<{ user_id: string; role: UserRole }>(`/users/${userId}/role`, token, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),
};
