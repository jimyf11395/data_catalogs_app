import { useState } from 'react';
import { ReportEntry, ReportInput, REPORT_STATUSES, ReportStatus } from '../lib/reportsApi';

interface Props { initial?: ReportEntry; onSubmit: (d: ReportInput) => Promise<void>; onCancel: () => void; }

export default function ReportForm({ initial, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<ReportInput>({
    name: initial?.name ?? '',
    tool: initial?.tool ?? '',
    url: initial?.url ?? '',
    description: initial?.description ?? '',
    owner: initial?.owner ?? '',
    business_users: initial?.business_users ?? '',
    source_tables: initial?.source_tables ?? [],
    status: initial?.status ?? null,
    refresh_frequency: initial?.refresh_frequency ?? '',
    tags: initial?.tags ?? [],
  });
  const [sourceInput, setSourceInput] = useState(initial?.source_tables.join(', ') ?? '');
  const [tagInput, setTagInput] = useState(initial?.tags.join(', ') ?? '');
  const [loading, setLoading] = useState(false);
  const set = <K extends keyof ReportInput>(k: K, v: ReportInput[K]) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!form.name.trim()) return; setLoading(true);
    await onSubmit({ ...form, source_tables: sourceInput.split(',').map(t => t.trim()).filter(Boolean), tags: tagInput.split(',').map(t => t.trim()).filter(Boolean) });
    setLoading(false);
  };

  return (
    <form className="catalog-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-row form-row-full"><label>Report / Dashboard Name *</label><input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Monthly Sales Dashboard" required /></div>
        <div className="form-row"><label>Tool</label><input value={form.tool ?? ''} onChange={e => set('tool', e.target.value)} placeholder="e.g. Power BI, Tableau, Looker" /></div>
        <div className="form-row"><label>Status</label>
          <select value={form.status ?? ''} onChange={e => set('status', (e.target.value as ReportStatus) || null)}>
            <option value="">— select —</option>{REPORT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-row"><label>Owner</label><input value={form.owner ?? ''} onChange={e => set('owner', e.target.value)} placeholder="e.g. sales-team" /></div>
        <div className="form-row"><label>Refresh Frequency</label><input value={form.refresh_frequency ?? ''} onChange={e => set('refresh_frequency', e.target.value)} placeholder="e.g. Daily, Real-time" /></div>
        <div className="form-row form-row-full"><label>URL</label><input value={form.url ?? ''} onChange={e => set('url', e.target.value)} placeholder="https://..." /></div>
        <div className="form-row form-row-full"><label>Business Users</label><input value={form.business_users ?? ''} onChange={e => set('business_users', e.target.value)} placeholder="e.g. Finance, C-Suite" /></div>
        <div className="form-row form-row-full"><label>Source Tables <span className="hint">(comma-separated)</span></label><input value={sourceInput} onChange={e => setSourceInput(e.target.value)} placeholder="e.g. public.orders, public.customers" /></div>
        <div className="form-row form-row-full"><label>Description</label><textarea value={form.description ?? ''} onChange={e => set('description', e.target.value)} placeholder="What does this report show?" rows={2} /></div>
        <div className="form-row form-row-full"><label>Tags <span className="hint">(comma-separated)</span></label><input value={tagInput} onChange={e => setTagInput(e.target.value)} /></div>
      </div>
      <div className="form-actions">
        <button type="submit" disabled={loading || !form.name.trim()}>{loading ? 'Saving...' : initial ? 'Save changes' : 'Add report'}</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
