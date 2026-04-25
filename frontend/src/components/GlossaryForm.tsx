import { useState } from 'react';
import { GlossaryEntry, GlossaryInput, GLOSSARY_STATUSES, GlossaryStatus } from '../lib/glossaryApi';

interface Props { initial?: GlossaryEntry; onSubmit: (d: GlossaryInput) => Promise<void>; onCancel: () => void; }

export default function GlossaryForm({ initial, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<GlossaryInput>({
    term: initial?.term ?? '',
    definition: initial?.definition ?? '',
    business_owner: initial?.business_owner ?? '',
    data_owner: initial?.data_owner ?? '',
    domain: initial?.domain ?? '',
    status: initial?.status ?? null,
    related_terms: initial?.related_terms ?? [],
    tags: initial?.tags ?? [],
  });
  const [relatedInput, setRelatedInput] = useState(initial?.related_terms.join(', ') ?? '');
  const [tagInput, setTagInput] = useState(initial?.tags.join(', ') ?? '');
  const [loading, setLoading] = useState(false);
  const set = <K extends keyof GlossaryInput>(k: K, v: GlossaryInput[K]) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!form.term.trim()) return; setLoading(true);
    await onSubmit({ ...form, related_terms: relatedInput.split(',').map(t => t.trim()).filter(Boolean), tags: tagInput.split(',').map(t => t.trim()).filter(Boolean) });
    setLoading(false);
  };

  return (
    <form className="catalog-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-row form-row-full"><label>Term *</label><input value={form.term} onChange={e => set('term', e.target.value)} placeholder="e.g. Customer" required /></div>
        <div className="form-row"><label>Domain</label><input value={form.domain ?? ''} onChange={e => set('domain', e.target.value)} placeholder="e.g. Sales, Finance" /></div>
        <div className="form-row"><label>Status</label>
          <select value={form.status ?? ''} onChange={e => set('status', (e.target.value as GlossaryStatus) || null)}>
            <option value="">— select —</option>{GLOSSARY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-row"><label>Business Owner</label><input value={form.business_owner ?? ''} onChange={e => set('business_owner', e.target.value)} placeholder="e.g. Sales Team" /></div>
        <div className="form-row"><label>Data Owner</label><input value={form.data_owner ?? ''} onChange={e => set('data_owner', e.target.value)} placeholder="e.g. Data Team" /></div>
        <div className="form-row form-row-full"><label>Definition</label><textarea value={form.definition ?? ''} onChange={e => set('definition', e.target.value)} placeholder="Plain language definition of this term" rows={3} /></div>
        <div className="form-row form-row-full"><label>Related Terms <span className="hint">(comma-separated)</span></label><input value={relatedInput} onChange={e => setRelatedInput(e.target.value)} placeholder="e.g. Client, Account" /></div>
        <div className="form-row form-row-full"><label>Tags <span className="hint">(comma-separated)</span></label><input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="e.g. sales, core" /></div>
      </div>
      <div className="form-actions">
        <button type="submit" disabled={loading || !form.term.trim()}>{loading ? 'Saving...' : initial ? 'Save changes' : 'Add term'}</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
