import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { usersApi, UserEntry, UserRole, USER_ROLES } from '../lib/usersApi';

interface Props { session: Session; }

export default function UsersPage({ session }: Props) {
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState<string | null>(null);
  const token = session.access_token;

  useEffect(() => {
    usersApi.getAll(token)
      .then(setUsers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleRoleChange = async (userId: string, role: UserRole) => {
    setSaving(userId);
    try {
      await usersApi.setRole(token, userId, role);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="todos-container">
      <div className="catalog-top">
        <div>
          <h2 className="section-title">User Management</h2>
          <p className="count">{users.length} user{users.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="loading">Loading users...</p>
      ) : (
        <div className="users-table-wrap">
          <table className="users-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Member since</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className={u.id === session.user.id ? 'users-row-self' : ''}>
                  <td className="users-email">
                    {u.email}
                    {u.id === session.user.id && <span className="users-you">you</span>}
                  </td>
                  <td>
                    <select
                      className="users-role-select"
                      value={u.role}
                      disabled={saving === u.id}
                      onChange={e => handleRoleChange(u.id, e.target.value as UserRole)}
                    >
                      {USER_ROLES.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    {saving === u.id && <span className="users-saving">Saving...</span>}
                  </td>
                  <td className="users-date">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
