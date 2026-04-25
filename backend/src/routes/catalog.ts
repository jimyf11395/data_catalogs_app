import { Router } from 'express';
import { requireAuth, supabase } from '../middleware/auth';

const router = Router();

const VALID_TYPES = ['Source', 'Bronce', 'Silver', 'Gold'] as const;

function buildEntry(body: Record<string, unknown>, userId: string) {
  const { table_name, schema_name, description, owner, tags, type, db_name, source_system } = body as Record<string, string | string[]>;
  return {
    table_name: (table_name as string)?.trim(),
    schema_name: (schema_name as string)?.trim() || 'public',
    description: (description as string)?.trim() || null,
    owner: (owner as string)?.trim() || null,
    tags: Array.isArray(tags) ? tags : [],
    type: VALID_TYPES.includes(type as typeof VALID_TYPES[number]) ? type : null,
    db_name: (db_name as string)?.trim() || null,
    source_system: (source_system as string)?.trim() || null,
    user_id: userId,
  };
}

router.get('/', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('data_catalog')
    .select('*')
    .eq('user_id', req.user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

router.post('/', requireAuth, async (req, res) => {
  if (!req.body.table_name?.trim()) { res.status(400).json({ error: 'table_name is required' }); return; }

  const { data, error } = await supabase
    .from('data_catalog')
    .insert({ ...buildEntry(req.body, req.user.id), created_by: req.user.id })
    .select()
    .single();

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(201).json(data);
});

router.post('/bulk', requireAuth, async (req, res) => {
  const rows = req.body as Record<string, unknown>[];
  if (!Array.isArray(rows) || rows.length === 0) {
    res.status(400).json({ error: 'Expected a non-empty array of entries' }); return;
  }

  const invalid = rows.findIndex((r) => !(r.table_name as string)?.trim());
  if (invalid !== -1) {
    res.status(400).json({ error: `Row ${invalid + 1}: table_name is required` }); return;
  }

  const inserts = rows.map((r) => ({ ...buildEntry(r, req.user.id), created_by: req.user.id }));

  const { data, error } = await supabase
    .from('data_catalog')
    .insert(inserts)
    .select();

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(201).json(data);
});

router.put('/:id', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('data_catalog')
    .update({
      ...buildEntry(req.body, req.user.id),
      modified_at: new Date().toISOString(),
      modified_by: req.user.id,
    })
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .is('deleted_at', null)
    .select()
    .single();

  if (error) { res.status(500).json({ error: error.message }); return; }
  if (!data) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(data);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const { error } = await supabase
    .from('data_catalog')
    .update({ deleted_at: new Date().toISOString(), deleted_by: req.user.id })
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .is('deleted_at', null);

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(204).send();
});

export default router;
