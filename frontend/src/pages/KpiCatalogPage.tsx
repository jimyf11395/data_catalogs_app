import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { kpiApi, KpiEntry, KpiInput, KPI_FREQUENCIES } from '../lib/kpiApi';
import KpiForm from '../components/KpiForm';
import KpiItem from '../components/KpiItem';
import ExcelUpload, { downloadExcel } from '../components/ExcelUpload';

const COLUMNS = ['name', 'category', 'unit', 'owner', 'frequency', 'formula', 'description', 'tags'];
const EXAMPLE = [
  ['Monthly Revenue', 'Finance', '$', 'finance-team', 'Monthly', 'SUM(orders.amount)', 'Total monthly revenue', 'finance, executive'],
  ['Churn Rate', 'Customer Success', '%', 'cs-team', 'Monthly', 'lost_customers / total_customers * 100', 'Customer churn rate', 'retention'],
];

function matches(e: KpiEntry, q: string) {
  const l = q.toLowerCase();
  return e.name.toLowerCase().includes(l) || (e.category?.toLowerCase().includes(l) ?? false) ||
    (e.description?.toLowerCase().includes(l) ?? false) || (e.owner?.toLowerCase().includes(l) ?? false) ||
    (e.unit?.toLowerCase().includes(l) ?? false) || (e.formula?.toLowerCase().includes(l) ?? false) ||
    (e.frequency?.toLowerCase().includes(l) ?? false) || e.tags.some(t => t.toLowerCase().includes(l));
}

interface Props { session: Session; }

export default function KpiCatalogPage({ session }: Props) {
  const [entries, setEntries] = useState<KpiEntry[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const token = session.access_token;
  const filtered = search.trim() ? entries.filter(e => matches(e, search.trim())) : entries;

  useEffect(() => { kpiApi.getAll(token).then(setEntries).catch(e => setError(e.message)).finally(() => setLoading(false)); }, [token]);

  const handleCreate = async (d: KpiInput) => { const e = await kpiApi.create(token, d); setEntries(p => [e, ...p]); setShowForm(false); };
  const handleEdit = async (id: string, d: Partial<KpiInput>) => { const u = await kpiApi.update(token, id, d); setEntries(p => p.map(e => e.id === id ? u : e)); };
  const handleDelete = async (id: string) => { await kpiApi.delete(token, id); setEntries(p => p.filter(e => e.id !== id)); };

  const handleUpload = async (rows: Record<string, string>[]) => {
    setUploading(true); setError('');
    try {
      const mapped: KpiInput[] = rows.filter(r => r.name?.trim()).map(r => ({
        name: r.name.trim(),
        category: r.category?.trim() || null,
        unit: r.unit?.trim() || null,
        owner: r.owner?.trim() || null,
        frequency: (KPI_FREQUENCIES as readonly string[]).includes(r.frequency) ? r.frequency as KpiInput['frequency'] : null,
        formula: r.formula?.trim() || null,
        description: r.description?.trim() || null,
        tags: r.tags ? r.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }));
      const created = await kpiApi.bulk(token, mapped);
      setEntries(p => [...created, ...p]);
    } catch (e) { setError((e as Error).message); }
    finally { setUploading(false); }
  };

  return (
    <div className="todos-container">
      <div className="catalog-top">
        <div>
          <h2 className="section-title">KPI Catalog</h2>
          <p className="count">{search.trim() ? `${filtered.length} of ${entries.length}` : entries.length} KPI{entries.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="catalog-actions">
          <button className="btn-secondary" onClick={() => downloadExcel(COLUMNS, EXAMPLE, 'kpi_catalog_example.xlsx')}>Download example</button>
          <label htmlFor="excel-upload-kpis" className="btn-secondary" style={{ cursor: 'pointer' }}>{uploading ? 'Uploading...' : 'Upload Excel'}</label>
          <ExcelUpload id="excel-upload-kpis" onUpload={handleUpload} />
          {!showForm && <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add KPI</button>}
        </div>
      </div>
      <input className="search-bar" type="search" placeholder="Search by name, category, owner, formula, tags..." value={search} onChange={e => setSearch(e.target.value)} />
      {showForm && <div className="catalog-form-wrap"><KpiForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} /></div>}
      {error && <p className="error">{error}</p>}
      {loading ? <p className="loading">Loading KPIs...</p> : filtered.length === 0 ? <p className="empty">{search.trim() ? 'No KPIs match your search.' : 'No KPIs registered yet.'}</p> : (
        <ul className="catalog-list">{filtered.map(e => <KpiItem key={e.id} entry={e} onEdit={handleEdit} onDelete={handleDelete} />)}</ul>
      )}
    </div>
  );
}
