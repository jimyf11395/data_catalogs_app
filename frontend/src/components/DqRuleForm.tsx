import { useState } from 'react';
import { DqRuleEntry, DqRuleInput, DQ_RULE_TYPES, DQ_SEVERITIES, DqRuleType, DqSeverity } from '../lib/dqRulesApi';

interface Props { initial?: DqRuleEntry; onSubmit: (d: DqRuleInput) => Promise<void>; onCancel: () => void; }

export default function DqRuleForm({ initial, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<DqRuleInput>({
    name: initial?.name ?? '',
    rule_type: initial?.rule_type ?? null,
    description: initial?.description ?? '',
    target_table: initial?.target_table ?? '',
    target_column: initial?.target_column ?? '',
    condition: initial?.condition ?? '',
    severity: initial?.severity ?? null,
    owner: initial?.owner ?? '',
    tags: initial?.tags ?? [],
  });
  const [tagInput, setTagInput] = useState(initial?.tags.join(', ') ?? '');
  const [loading, setLoading] = useState(false);
  const set = <K extends keyof DqRuleInput>(k: K, v: DqRuleInput[K]) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!form.name.trim()) return; setLoading(true);
    await onSubmit({ ...form, tags: tagInput.split(',').map(t => t.trim()).filter(Boolean) });
    setLoading(false);
  };

  return (
    <form className="catalog-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-row form-row-full"><label>Rule Name *</label><input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. orders.customer_id not null" required /></div>
        <div className="form-row"><label>Type</label>
          <select value={form.rule_type ?? ''} onChange={e => set('rule_type', (e.target.value as DqRuleType) || null)}>
            <option value="">— select —</option>{DQ_RULE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-row"><label>Severity</label>
          <select value={form.severity ?? ''} onChange={e => set('severity', (e.target.value as DqSeverity) || null)}>
            <option value="">— select —</option>{DQ_SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-row"><label>Target Table</label><input value={form.target_table ?? ''} onChange={e => set('target_table', e.target.value)} placeholder="e.g. public.orders" /></div>
        <div className="form-row"><label>Target Column</label><input value={form.target_column ?? ''} onChange={e => set('target_column', e.target.value)} placeholder="e.g. customer_id" /></div>
        <div className="form-row"><label>Owner</label><input value={form.owner ?? ''} onChange={e => set('owner', e.target.value)} placeholder="e.g. data-quality team" /></div>
        <div className="form-row form-row-full"><label>Condition / Expression</label><textarea value={form.condition ?? ''} onChange={e => set('condition', e.target.value)} placeholder="e.g. customer_id IS NOT NULL" rows={2} /></div>
        <div className="form-row form-row-full"><label>Description</label><textarea value={form.description ?? ''} onChange={e => set('description', e.target.value)} placeholder="Why does this rule exist?" rows={2} /></div>
        <div className="form-row form-row-full"><label>Tags <span className="hint">(comma-separated)</span></label><input value={tagInput} onChange={e => setTagInput(e.target.value)} /></div>
      </div>
      <div className="form-actions">
        <button type="submit" disabled={loading || !form.name.trim()}>{loading ? 'Saving...' : initial ? 'Save changes' : 'Add rule'}</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
