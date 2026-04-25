import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { lineageApi, LineageEntry, LineageInput } from '../lib/lineageApi';
import LineageForm from '../components/LineageForm';
import LineageItem from '../components/LineageItem';
import ExcelUpload, { downloadExcel } from '../components/ExcelUpload';

const COLUMNS = ['name', 'source_system', 'source_table', 'target_system', 'target_table', 'pipeline_name', 'schedule', 'owner', 'status', 'transformation', 'tags'];
const EXAMPLE = [
  ['SAP Orders to Warehouse', 'SAP', 'VBAK', 'Snowflake', 'public.orders', 'sap_orders_etl', 'Daily at 02:00 UTC', 'data-eng', 'Active', 'Filters and maps SAP order fields to warehouse schema', 'etl, finance'],
  ['CRM Leads to DW', 'Salesforce', 'Lead', 'Snowflake', 'public.leads', 'sf_leads_etl', 'Hourly', 'data-eng', 'Active', 'Syncs Salesforce leads with deduplication', 'etl, crm'],
];

function matches(e: LineageEntry, q: string) {
  const l = q.toLowerCase();
  return e.name.toLowerCase().includes(l) || (e.source_system?.toLowerCase().includes(l) ?? false) ||
    (e.source_table?.toLowerCase().includes(l) ?? false) || (e.target_system?.toLowerCase().includes(l) ?? false) ||
    (e.target_table?.toLowerCase().includes(l) ?? false) || (e.pipeline_name?.toLowerCase().includes(l) ?? false) ||
    (e.owner?.toLowerCase().includes(l) ?? false) || e.tags.some(t => t.toLowerCase().includes(l));
}

interface Props { session: Session; }

export default function LineagePage({ session }: Props) {
  const [entries, setEntries] = useState<LineageEntry[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const token = session.access_token;
  const filtered = search.trim() ? entries.filter(e => matches(e, search.trim())) : entries;

  useEffect(() => { lineageApi.getAll(token).then(setEntries).catch(e => setError(e.message)).finally(() => setLoading(false)); }, [token]);

  const handleCreate = async (d: LineageInput) => { const e = await lineageApi.create(token, d); setEntries(p => [e, ...p]); setShowForm(false); };
  const handleEdit = async (id: string, d: Partial<LineageInput>) => { const u = await lineageApi.update(token, id, d); setEntries(p => p.map(e => e.id === id ? u : e)); };
  const handleDelete = async (id: string) => { await lineageApi.delete(token, id); setEntries(p => p.filter(e => e.id !== id)); };

  const handleUpload = async (rows: Record<string, string>[]) => {
    setUploading(true); setError('');
    try {
      const mapped: LineageInput[] = rows.filter(r => r.name?.trim()).map(r => ({
        name: r.name.trim(),
        source_system: r.source_system?.trim() || null,
        source_table: r.source_table?.trim() || null,
        target_system: r.target_system?.trim() || null,
        target_table: r.target_table?.trim() || null,
        pipeline_name: r.pipeline_name?.trim() || null,
        schedule: r.schedule?.trim() || null,
        owner: r.owner?.trim() || null,
        status: ['Active', 'Deprecated'].includes(r.status) ? r.status as LineageInput['status'] : null,
        transformation: r.transformation?.trim() || null,
        tags: r.tags ? r.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }));
      const created = await lineageApi.bulk(token, mapped);
      setEntries(p => [...created, ...p]);
    } catch (e) { setError((e as Error).message); }
    finally { setUploading(false); }
  };

  return (
    <div className="todos-container">
      <div className="catalog-top">
        <div>
          <h2 className="section-title">Data Lineage</h2>
          <p className="count">{search.trim() ? `${filtered.length} of ${entries.length}` : entries.length} flow{entries.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="catalog-actions">
          <button className="btn-secondary" onClick={() => downloadExcel(COLUMNS, EXAMPLE, 'lineage_example.xlsx')}>Download example</button>
          <label htmlFor="excel-upload-lineage" className="btn-secondary" style={{ cursor: 'pointer' }}>{uploading ? 'Uploading...' : 'Upload Excel'}</label>
          <ExcelUpload id="excel-upload-lineage" onUpload={handleUpload} />
          {!showForm && <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add lineage</button>}
        </div>
      </div>
      <input className="search-bar" type="search" placeholder="Search by name, source, target, pipeline..." value={search} onChange={e => setSearch(e.target.value)} />
      {showForm && <div className="catalog-form-wrap"><LineageForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} /></div>}
      {error && <p className="error">{error}</p>}
      {loading ? <p className="loading">Loading lineage...</p> : filtered.length === 0 ? <p className="empty">{search.trim() ? 'No flows match your search.' : 'No lineage flows registered yet.'}</p> : (
        <ul className="catalog-list">{filtered.map(e => <LineageItem key={e.id} entry={e} onEdit={handleEdit} onDelete={handleDelete} />)}</ul>
      )}
    </div>
  );
}
