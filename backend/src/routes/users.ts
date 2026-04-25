import { Router } from 'express';
import { requireAuth, requireAdmin, supabase } from '../middleware/auth';

const router = Router();

router.get('/me', requireAuth, async (req, res) => {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', req.user.id)
    .single();
  res.json({ role: (data?.role as string) || 'Viewer' });
});

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  if (error) { res.status(500).json({ error: error.message }); return; }

  const { data: roles } = await supabase.from('user_roles').select('user_id, role');
  const roleMap: Record<string, string> = Object.fromEntries(
    (roles || []).map(r => [r.user_id, r.role])
  );

  const result = users.map(u => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    role: roleMap[u.id] || 'Viewer',
  }));

  res.json(result);
});

router.put('/:id/role', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body as { role: string };

  if (!['Admin', 'Editor', 'Viewer'].includes(role)) {
    res.status(400).json({ error: 'Invalid role' }); return;
  }

  const { error } = await supabase
    .from('user_roles')
    .upsert({ user_id: id, role, created_by: req.user.id }, { onConflict: 'user_id' });

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ user_id: id, role });
});

export default router;
