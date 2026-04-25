import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { glossaryApi, GlossaryEntry, GlossaryInput, GLOSSARY_STATUSES } from '../lib/glossaryApi';
import GlossaryForm from '../components/GlossaryForm';
import GlossaryItem from '../components/GlossaryItem';
import ExcelUpload, { downloadExcel } from '../components/ExcelUpload';

const COLUMNS = ['term', 'domain', 'status', 'business_owner', 'data_owner', 'definition', 'related_terms', 'tags'];
const EXAMPLE = [
  ['Customer', 'Sales', 'Approved', 'Sales Team', 'Data Team', 'A person or company that has purchased a product or service', 'Client, Account', 'core, sales'],
  ['Revenue', 'Finance', 'Approved', 'Finance Team', 'Data Team', 'Total income generated from sales of goods or services', 'Income, Sales', 'core, finance'],
];

function matches(e: GlossaryEntry, q: string) {
  const l = q.toLowerCase();
  return e.term.toLowerCase().includes(l) || (e.definition?.toLowerCase().includes(l) ?? false) ||
    (e.domain?.toLowerCase().includes(l) ?? false) || (e.business_owner?.toLowerCase().includes(l) ?? false) ||
    (e.data_owner?.toLowerCase().includes(l) ?? false) || (e.status?.toLowerCase().includes(l) ?? false) ||
    e.related_terms.some(t => t.toLowerCase().includes(l)) || e.tags.some(t => t.toLowerCase().includes(l));
}

interface Props { session: Session; }

export default function GlossaryPage({ session }: Props) {
  const [entries, setEntries] = useState<GlossaryEntry[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const token = session.access_token;
  const filtered = search.trim() ? entries.filter(e => matches(e, search.trim())) : entries;

  useEffect(() => { glossaryApi.getAll(token).then(setEntries).catch(e => setError(e.message)).finally(() => setLoading(false)); }, [token]);

  const handleCreate = async (d: GlossaryInput) => { const e = await glossaryApi.create(token, d); setEntries(p => [e, ...p]); setShowForm(false); };
  const handleEdit = async (id: string, d: Partial<GlossaryInput>) => { const u = await glossaryApi.update(token, id, d); setEntries(p => p.map(e => e.id === id ? u : e)); };
  const handleDelete = async (id: string) => { await glossaryApi.delete(token, id); setEntries(p => p.filter(e => e.id !== id)); };

  const handleUpload = async (rows: Record<string, string>[]) => {
    setUploading(true); setError('');
    try {
      const mapped: GlossaryInput[] = rows.filter(r => r.term?.trim()).map(r => ({
        term: r.term.trim(),
        domain: r.domain?.trim() || null,
        status: (GLOSSARY_STATUSES as readonly string[]).includes(r.status) ? r.status as GlossaryInput['status'] : null,
        business_owner: r.business_owner?.trim() || null,
        data_owner: r.data_owner?.trim() || null,
        definition: r.definition?.trim() || null,
        related_terms: r.related_terms ? r.related_terms.split(',').map(t => t.trim()).filter(Boolean) : [],
        tags: r.tags ? r.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }));
      const created = await glossaryApi.bulk(token, mapped);
      setEntries(p => [...created, ...p]);
    } catch (e) { setError((e as Error).message); }
    finally { setUploading(false); }
  };

  return (
    <div className="todos-container">
      <div className="catalog-top">
        <div>
          <h2 className="section-title">Business Glossary</h2>
          <p className="count">{search.trim() ? `${filtered.length} of ${entries.length}` : entries.length} term{entries.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="catalog-actions">
          <button className="btn-secondary" onClick={() => downloadExcel(COLUMNS, EXAMPLE, 'glossary_example.xlsx')}>Download example</button>
          <label htmlFor="excel-upload-glossary" className="btn-secondary" style={{ cursor: 'pointer' }}>{uploading ? 'Uploading...' : 'Upload Excel'}</label>
          <ExcelUpload id="excel-upload-glossary" onUpload={handleUpload} />
          {!showForm && <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add term</button>}
        </div>
      </div>
      <input className="search-bar" type="search" placeholder="Search by term, definition, domain, owner..." value={search} onChange={e => setSearch(e.target.value)} />
      {showForm && <div className="catalog-form-wrap"><GlossaryForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} /></div>}
      {error && <p className="error">{error}</p>}
      {loading ? <p className="loading">Loading glossary...</p> : filtered.length === 0 ? <p className="empty">{search.trim() ? 'No terms match your search.' : 'No terms defined yet.'}</p> : (
        <ul className="catalog-list">{filtered.map(e => <GlossaryItem key={e.id} entry={e} onEdit={handleEdit} onDelete={handleDelete} />)}</ul>
      )}
    </div>
  );
}
