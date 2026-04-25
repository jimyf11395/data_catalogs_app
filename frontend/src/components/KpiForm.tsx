import { useState } from 'react';
import { KpiEntry, KpiInput, KPI_FREQUENCIES, KpiFrequency } from '../lib/kpiApi';

interface Props {
  initial?: KpiEntry;
  onSubmit: (data: KpiInput) => Promise<void>;
  onCancel: () => void;
}

const empty: KpiInput = {
  name: '',
  description: '',
  category: '',
  formula: '',
  unit: '',
  owner: '',
  frequency: null,
  tags: [],
};

export default function KpiForm({ initial, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<KpiInput>(
    initial
      ? {
          name: initial.name,
          description: initial.description ?? '',
          category: initial.category ?? '',
          formula: initial.formula ?? '',
          unit: initial.unit ?? '',
          owner: initial.owner ?? '',
          frequency: initial.frequency,
          tags: initial.tags,
        }
      : empty
  );
  const [tagInput, setTagInput] = useState(initial?.tags.join(', ') ?? '');
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof KpiInput>(field: K, value: KpiInput[K]) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    const tags = tagInput.split(',').map((t) => t.trim()).filter(Boolean);
    await onSubmit({ ...form, tags });
    setLoading(false);
  };

  return (
    <form className="catalog-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-row form-row-full">
          <label>KPI Name *</label>
          <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Monthly Revenue" required />
        </div>
        <div className="form-row">
          <label>Category</label>
          <input value={form.category ?? ''} onChange={(e) => set('category', e.target.value)} placeholder="e.g. Finance, Sales" />
        </div>
        <div className="form-row">
          <label>Unit</label>
          <input value={form.unit ?? ''} onChange={(e) => set('unit', e.target.value)} placeholder="e.g. %, $, count" />
        </div>
        <div className="form-row">
          <label>Owner</label>
          <input value={form.owner ?? ''} onChange={(e) => set('owner', e.target.value)} placeholder="e.g. finance-team" />
        </div>
        <div className="form-row">
          <label>Frequency</label>
          <select value={form.frequency ?? ''} onChange={(e) => set('frequency', (e.target.value as KpiFrequency) || null)}>
            <option value="">— select —</option>
            {KPI_FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="form-row form-row-full">
          <label>Formula / Calculation</label>
          <textarea value={form.formula ?? ''} onChange={(e) => set('formula', e.target.value)} placeholder="e.g. SUM(revenue) / COUNT(orders)" rows={2} />
        </div>
        <div className="form-row form-row-full">
          <label>Description</label>
          <textarea value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} placeholder="What does this KPI measure?" rows={2} />
        </div>
        <div className="form-row form-row-full">
          <label>Tags <span className="hint">(comma-separated)</span></label>
          <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="e.g. revenue, executive" />
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" disabled={loading || !form.name.trim()}>
          {loading ? 'Saving...' : initial ? 'Save changes' : 'Add KPI'}
        </button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
