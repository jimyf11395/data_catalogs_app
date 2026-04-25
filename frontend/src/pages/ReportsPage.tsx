import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { reportsApi, ReportEntry, ReportInput, REPORT_STATUSES } from '../lib/reportsApi';
import ReportForm from '../components/ReportForm';
import ReportItem from '../components/ReportItem';
import ExcelUpload, { downloadExcel } from '../components/ExcelUpload';

const COLUMNS = ['name', 'tool', 'status', 'owner', 'refresh_frequency', 'url', 'business_users', 'source_tables', 'description', 'tags'];
const EXAMPLE = [
  ['Monthly Sales Dashboard', 'Power BI', 'Active', 'sales-team', 'Daily', 'https://app.powerbi.com/...', 'Finance, C-Suite', 'public.orders, public.customers', 'Monthly sales by region and product', 'sales, executive'],
  ['Churn Analysis Report', 'Tableau', 'Active', 'cs-team', 'Weekly', 'https://tableau.example.com/...', 'Customer Success', 'public.subscriptions', 'Customer churn trends', 'retention, cs'],
];

function matches(e: ReportEntry, q: string) {
  const l = q.toLowerCase();
  return e.name.toLowerCase().includes(l) || (e.tool?.toLowerCase().includes(l) ?? false) ||
    (e.description?.toLowerCase().includes(l) ?? false) || (e.owner?.toLowerCase().includes(l) ?? false) ||
    (e.business_users?.toLowerCase().includes(l) ?? false) || (e.status?.toLowerCase().includes(l) ?? false) ||
    e.source_tables.some(t => t.toLowerCase().includes(l)) || e.tags.some(t => t.toLowerCase().includes(l));
}

interface Props { session: Session; }

export default function ReportsPage({ session }: Props) {
  const [entries, setEntries] = useState<ReportEntry[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const token = session.access_token;
  const filtered = search.trim() ? entries.filter(e => matches(e, search.trim())) : entries;

  useEffect(() => { reportsApi.getAll(token).then(setEntries).catch(e => setError(e.message)).finally(() => setLoading(false)); }, [token]);

  const handleCreate = async (d: ReportInput) => { const e = await reportsApi.create(token, d); setEntries(p => [e, ...p]); setShowForm(false); };
  const handleEdit = async (id: string, d: Partial<ReportInput>) => { const u = await reportsApi.update(token, id, d); setEntries(p => p.map(e => e.id === id ? u : e)); };
  const handleDelete = async (id: string) => { await reportsApi.delete(token, id); setEntries(p => p.filter(e => e.id !== id)); };

  const handleUpload = async (rows: Record<string, string>[]) => {
    setUploading(true); setError('');
    try {
      const mapped: ReportInput[] = rows.filter(r => r.name?.trim()).map(r => ({
        name: r.name.trim(),
        tool: r.tool?.trim() || null,
        status: (REPORT_STATUSES as readonly string[]).includes(r.status) ? r.status as ReportInput['status'] : null,
        owner: r.owner?.trim() || null,
        refresh_frequency: r.refresh_frequency?.trim() || null,
        url: r.url?.trim() || null,
        business_users: r.business_users?.trim() || null,
        source_tables: r.source_tables ? r.source_tables.split(',').map(t => t.trim()).filter(Boolean) : [],
        description: r.description?.trim() || null,
        tags: r.tags ? r.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }));
      const created = await reportsApi.bulk(token, mapped);
      setEntries(p => [...created, ...p]);
    } catch (e) { setError((e as Error).message); }
    finally { setUploading(false); }
  };

  return (
    <div className="todos-container">
      <div className="catalog-top">
        <div>
          <h2 className="section-title">Report Catalog</h2>
          <p className="count">{search.trim() ? `${filtered.length} of ${entries.length}` : entries.length} report{entries.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="catalog-actions">
          <button className="btn-secondary" onClick={() => downloadExcel(COLUMNS, EXAMPLE, 'reports_example.xlsx')}>Download example</button>
          <label htmlFor="excel-upload-reports" className="btn-secondary" style={{ cursor: 'pointer' }}>{uploading ? 'Uploading...' : 'Upload Excel'}</label>
          <ExcelUpload id="excel-upload-reports" onUpload={handleUpload} />
          {!showForm && <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add report</button>}
        </div>
      </div>
      <input className="search-bar" type="search" placeholder="Search by name, tool, owner, source tables..." value={search} onChange={e => setSearch(e.target.value)} />
      {showForm && <div className="catalog-form-wrap"><ReportForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} /></div>}
      {error && <p className="error">{error}</p>}
      {loading ? <p className="loading">Loading reports...</p> : filtered.length === 0 ? <p className="empty">{search.trim() ? 'No reports match your search.' : 'No reports registered yet.'}</p> : (
        <ul className="catalog-list">{filtered.map(e => <ReportItem key={e.id} entry={e} onEdit={handleEdit} onDelete={handleDelete} />)}</ul>
      )}
    </div>
  );
}
