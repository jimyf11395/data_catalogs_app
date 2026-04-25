import { useState } from 'react';
import { CatalogEntry, CatalogInput, CATALOG_TYPES, CatalogType } from '../lib/catalogApi';

interface Props {
  initial?: CatalogEntry;
  onSubmit: (data: CatalogInput) => Promise<void>;
  onCancel: () => void;
}

const empty: CatalogInput = {
  source_system: '',
  db_name: '',
  schema_name: 'public',
  table_name: '',
  type: null,
  description: '',
  owner: '',
  tags: [],
};

export default function CatalogForm({ initial, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<CatalogInput>(
    initial
      ? {
          source_system: initial.source_system ?? '',
          db_name: initial.db_name ?? '',
          schema_name: initial.schema_name,
          table_name: initial.table_name,
          type: initial.type,
          description: initial.description ?? '',
          owner: initial.owner ?? '',
          tags: initial.tags,
        }
      : empty
  );
  const [tagInput, setTagInput] = useState(initial?.tags.join(', ') ?? '');
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof CatalogInput>(field: K, value: CatalogInput[K]) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.table_name.trim()) return;
    setLoading(true);
    const tags = tagInput.split(',').map((t) => t.trim()).filter(Boolean);
    await onSubmit({ ...form, tags });
    setLoading(false);
  };

  return (
    <form className="catalog-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-row">
          <label>Source System</label>
          <input value={form.source_system ?? ''} onChange={(e) => set('source_system', e.target.value)} placeholder="e.g. SAP, Salesforce" />
        </div>
        <div className="form-row">
          <label>DB Name</label>
          <input value={form.db_name ?? ''} onChange={(e) => set('db_name', e.target.value)} placeholder="e.g. warehouse_db" />
        </div>
        <div className="form-row">
          <label>Schema</label>
          <input value={form.schema_name} onChange={(e) => set('schema_name', e.target.value)} placeholder="public" />
        </div>
        <div className="form-row">
          <label>Table Name *</label>
          <input value={form.table_name} onChange={(e) => set('table_name', e.target.value)} placeholder="e.g. orders" required />
        </div>
        <div className="form-row">
          <label>Type</label>
          <select value={form.type ?? ''} onChange={(e) => set('type', (e.target.value as CatalogType) || null)}>
            <option value="">— select —</option>
            {CATALOG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-row">
          <label>Owner</label>
          <input value={form.owner ?? ''} onChange={(e) => set('owner', e.target.value)} placeholder="e.g. data-team" />
        </div>
        <div className="form-row form-row-full">
          <label>Description</label>
          <textarea value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} placeholder="What does this table contain?" rows={2} />
        </div>
        <div className="form-row form-row-full">
          <label>Tags <span className="hint">(comma-separated)</span></label>
          <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="e.g. finance, reporting" />
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" disabled={loading || !form.table_name.trim()}>
          {loading ? 'Saving...' : initial ? 'Save changes' : 'Add entry'}
        </button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
