import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { catalogApi, CatalogEntry, CatalogInput, CATALOG_TYPES } from '../lib/catalogApi';
import CatalogForm from '../components/CatalogForm';
import CatalogItem from '../components/CatalogItem';
import ExcelUpload, { downloadExcel } from '../components/ExcelUpload';

const COLUMNS = ['source_system', 'db_name', 'schema_name', 'table_name', 'type', 'description', 'owner', 'tags'];
const EXAMPLE = [
  ['SAP', 'warehouse_db', 'public', 'orders', 'Gold', 'All customer orders', 'data-team', 'finance, reporting'],
  ['Salesforce', 'crm_db', 'sales', 'leads', 'Silver', 'Sales pipeline leads', 'sales-team', 'crm'],
];

function matches(entry: CatalogEntry, q: string) {
  const l = q.toLowerCase();
  return entry.table_name.toLowerCase().includes(l) || entry.schema_name.toLowerCase().includes(l) ||
    (entry.source_system?.toLowerCase().includes(l) ?? false) || (entry.db_name?.toLowerCase().includes(l) ?? false) ||
    (entry.description?.toLowerCase().includes(l) ?? false) || (entry.owner?.toLowerCase().includes(l) ?? false) ||
    (entry.type?.toLowerCase().includes(l) ?? false) || entry.tags.some(t => t.toLowerCase().includes(l));
}

interface Props { session: Session; }

export default function CatalogPage({ session }: Props) {
  const [entries, setEntries] = useState<CatalogEntry[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const token = session.access_token;
  const filtered = search.trim() ? entries.filter(e => matches(e, search.trim())) : entries;

  useEffect(() => { catalogApi.getAll(token).then(setEntries).catch(e => setError(e.message)).finally(() => setLoading(false)); }, [token]);

  const handleCreate = async (data: CatalogInput) => { const e = await catalogApi.create(token, data); setEntries(p => [e, ...p]); setShowForm(false); };
  const handleEdit = async (id: string, data: Partial<CatalogInput>) => { const u = await catalogApi.update(token, id, data); setEntries(p => p.map(e => e.id === id ? u : e)); };
  const handleDelete = async (id: string) => { await catalogApi.delete(token, id); setEntries(p => p.filter(e => e.id !== id)); };

  const handleUpload = async (rows: Record<string, string>[]) => {
    setUploading(true); setError('');
    try {
      const mapped: CatalogInput[] = rows.filter(r => r.table_name?.trim()).map(r => ({
        source_system: r.source_system?.trim() || null,
        db_name: r.db_name?.trim() || null,
        schema_name: r.schema_name?.trim() || 'public',
        table_name: r.table_name.trim(),
        type: (CATALOG_TYPES as readonly string[]).includes(r.type) ? r.type as CatalogInput['type'] : null,
        description: r.description?.trim() || null,
        owner: r.owner?.trim() || null,
        tags: r.tags ? r.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }));
      const created = await catalogApi.bulk(token, mapped);
      setEntries(p => [...created, ...p]);
    } catch (e) { setError((e as Error).message); }
    finally { setUploading(false); }
  };

  return (
    <div className="todos-container">
      <div className="catalog-top">
        <div>
          <h2 className="section-title">Table Catalog</h2>
          <p className="count">{search.trim() ? `${filtered.length} of ${entries.length} table${entries.length !== 1 ? 's' : ''}` : `${entries.length} table${entries.length !== 1 ? 's' : ''} registered`}</p>
        </div>
        <div className="catalog-actions">
          <button className="btn-secondary" onClick={() => downloadExcel(COLUMNS, EXAMPLE, 'table_catalog_example.xlsx')}>Download example</button>
          <label htmlFor="excel-upload-catalog" className="btn-secondary" style={{ cursor: 'pointer' }}>{uploading ? 'Uploading...' : 'Upload Excel'}</label>
          <ExcelUpload id="excel-upload-catalog" onUpload={handleUpload} />
          {!showForm && <button className="btn-primary" onClick={() => setShowForm(true)}>+ Register table</button>}
        </div>
      </div>
      <input className="search-bar" type="search" placeholder="Search by table, schema, source system, tags..." value={search} onChange={e => setSearch(e.target.value)} />
      {showForm && <div className="catalog-form-wrap"><CatalogForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} /></div>}
      {error && <p className="error">{error}</p>}
      {loading ? <p className="loading">Loading catalog...</p> : filtered.length === 0 ? <p className="empty">{search.trim() ? 'No tables match your search.' : 'No tables registered yet.'}</p> : (
        <ul className="catalog-list">{filtered.map(e => <CatalogItem key={e.id} entry={e} onEdit={handleEdit} onDelete={handleDelete} />)}</ul>
      )}
    </div>
  );
}
