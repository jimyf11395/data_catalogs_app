import { useState } from 'react';
import { LineageEntry, LineageInput } from '../lib/lineageApi';

interface Props { initial?: LineageEntry; onSubmit: (d: LineageInput) => Promise<void>; onCancel: () => void; }

export default function LineageForm({ initial, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<LineageInput>({
    name: initial?.name ?? '',
    source_system: initial?.source_system ?? '',
    source_table: initial?.source_table ?? '',
    target_system: initial?.target_system ?? '',
    target_table: initial?.target_table ?? '',
    transformation: initial?.transformation ?? '',
    pipeline_name: initial?.pipeline_name ?? '',
    schedule: initial?.schedule ?? '',
    owner: initial?.owner ?? '',
    status: initial?.status ?? null,
    tags: initial?.tags ?? [],
  });
  const [tagInput, setTagInput] = useState(initial?.tags.join(', ') ?? '');
  const [loading, setLoading] = useState(false);
  const set = <K extends keyof LineageInput>(k: K, v: LineageInput[K]) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!form.name.trim()) return; setLoading(true);
    await onSubmit({ ...form, tags: tagInput.split(',').map(t => t.trim()).filter(Boolean) });
    setLoading(false);
  };

  return (
    <form className="catalog-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-row form-row-full"><label>Name *</label><input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. SAP Orders → Warehouse orders table" required /></div>
        <div className="form-row"><label>Source System</label><input value={form.source_system ?? ''} onChange={e => set('source_system', e.target.value)} placeholder="e.g. SAP" /></div>
        <div className="form-row"><label>Source Table</label><input value={form.source_table ?? ''} onChange={e => set('source_table', e.target.value)} placeholder="e.g. VBAK" /></div>
        <div className="form-row"><label>Target System</label><input value={form.target_system ?? ''} onChange={e => set('target_system', e.target.value)} placeholder="e.g. Snowflake" /></div>
        <div className="form-row"><label>Target Table</label><input value={form.target_table ?? ''} onChange={e => set('target_table', e.target.value)} placeholder="e.g. public.orders" /></div>
        <div className="form-row"><label>Pipeline Name</label><input value={form.pipeline_name ?? ''} onChange={e => set('pipeline_name', e.target.value)} placeholder="e.g. sap_orders_etl" /></div>
        <div className="form-row"><label>Schedule</label><input value={form.schedule ?? ''} onChange={e => set('schedule', e.target.value)} placeholder="e.g. Daily at 02:00 UTC" /></div>
        <div className="form-row"><label>Owner</label><input value={form.owner ?? ''} onChange={e => set('owner', e.target.value)} placeholder="e.g. data-eng team" /></div>
        <div className="form-row"><label>Status</label>
          <select value={form.status ?? ''} onChange={e => set('status', (e.target.value as 'Active' | 'Deprecated') || null)}>
            <option value="">— select —</option><option value="Active">Active</option><option value="Deprecated">Deprecated</option>
          </select>
        </div>
        <div className="form-row form-row-full"><label>Transformation</label><textarea value={form.transformation ?? ''} onChange={e => set('transformation', e.target.value)} placeholder="Describe how data is transformed" rows={2} /></div>
        <div className="form-row form-row-full"><label>Tags <span className="hint">(comma-separated)</span></label><input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="e.g. finance, etl" /></div>
      </div>
      <div className="form-actions">
        <button type="submit" disabled={loading || !form.name.trim()}>{loading ? 'Saving...' : initial ? 'Save changes' : 'Add lineage'}</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
