import { Router } from 'express';
import { requireAuth, supabase } from '../middleware/auth';

const router = Router();

const VALID_FREQUENCIES = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'] as const;

function buildEntry(body: Record<string, unknown>, userId: string) {
  const { name, description, category, formula, unit, owner, frequency, tags } = body as Record<string, string | string[]>;
  return {
    user_id: userId,
    name: (name as string)?.trim(),
    description: (description as string)?.trim() || null,
    category: (category as string)?.trim() || null,
    formula: (formula as string)?.trim() || null,
    unit: (unit as string)?.trim() || null,
    owner: (owner as string)?.trim() || null,
    frequency: VALID_FREQUENCIES.includes(frequency as typeof VALID_FREQUENCIES[number]) ? frequency : null,
    tags: Array.isArray(tags) ? tags : [],
  };
}

router.get('/', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('kpi_catalog')
    .select('*')
    .eq('user_id', req.user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

router.post('/', requireAuth, async (req, res) => {
  if (!req.body.name?.trim()) { res.status(400).json({ error: 'name is required' }); return; }

  const { data, error } = await supabase
    .from('kpi_catalog')
    .insert({ ...buildEntry(req.body, req.user.id), created_by: req.user.id })
    .select()
    .single();

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(201).json(data);
});

router.post('/bulk', requireAuth, async (req, res) => {
  const rows = req.body as Record<string, unknown>[];
  if (!Array.isArray(rows) || rows.length === 0) { res.status(400).json({ error: 'Expected a non-empty array' }); return; }
  const inserts = rows.map(r => ({ ...buildEntry(r, req.user.id), created_by: req.user.id }));
  const { data, error } = await supabase.from('kpi_catalog').insert(inserts).select();
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(201).json(data);
});

router.put('/:id', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('kpi_catalog')
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
    .from('kpi_catalog')
    .update({ deleted_at: new Date().toISOString(), deleted_by: req.user.id })
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .is('deleted_at', null);

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(204).send();
});

export default router;
