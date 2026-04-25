import { Router } from 'express';
import { requireAuth, supabase } from '../middleware/auth';

const router = Router();

function build(body: Record<string, unknown>, userId: string) {
  const { term, definition, business_owner, data_owner, domain, status, related_terms, tags } = body as Record<string, string | string[]>;
  return {
    user_id: userId,
    term: (term as string)?.trim(),
    definition: (definition as string)?.trim() || null,
    business_owner: (business_owner as string)?.trim() || null,
    data_owner: (data_owner as string)?.trim() || null,
    domain: (domain as string)?.trim() || null,
    status: ['Draft', 'Approved', 'Deprecated'].includes(status as string) ? status : null,
    related_terms: Array.isArray(related_terms) ? related_terms : [],
    tags: Array.isArray(tags) ? tags : [],
  };
}

router.get('/', requireAuth, async (req, res) => {
  const { data, error } = await supabase.from('business_glossary').select('*')
    .eq('user_id', req.user.id).is('deleted_at', null).order('term');
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

router.post('/', requireAuth, async (req, res) => {
  if (!req.body.term?.trim()) { res.status(400).json({ error: 'term is required' }); return; }
  const { data, error } = await supabase.from('business_glossary')
    .insert({ ...build(req.body, req.user.id), created_by: req.user.id }).select().single();
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(201).json(data);
});

router.post('/bulk', requireAuth, async (req, res) => {
  const rows = req.body as Record<string, unknown>[];
  if (!Array.isArray(rows) || rows.length === 0) { res.status(400).json({ error: 'Expected a non-empty array' }); return; }
  const inserts = rows.map(r => ({ ...build(r, req.user.id), created_by: req.user.id }));
  const { data, error } = await supabase.from('business_glossary').insert(inserts).select();
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(201).json(data);
});

router.put('/:id', requireAuth, async (req, res) => {
  const { data, error } = await supabase.from('business_glossary')
    .update({ ...build(req.body, req.user.id), modified_at: new Date().toISOString(), modified_by: req.user.id })
    .eq('id', req.params.id).eq('user_id', req.user.id).is('deleted_at', null).select().single();
  if (error) { res.status(500).json({ error: error.message }); return; }
  if (!data) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(data);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const { error } = await supabase.from('business_glossary')
    .update({ deleted_at: new Date().toISOString(), deleted_by: req.user.id })
    .eq('id', req.params.id).eq('user_id', req.user.id).is('deleted_at', null);
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(204).send();
});

export default router;
