import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { dqRulesApi, DqRuleEntry, DqRuleInput, DQ_RULE_TYPES, DQ_SEVERITIES } from '../lib/dqRulesApi';
import DqRuleForm from '../components/DqRuleForm';
import DqRuleItem from '../components/DqRuleItem';
import ExcelUpload, { downloadExcel } from '../components/ExcelUpload';

const COLUMNS = ['name', 'rule_type', 'severity', 'target_table', 'target_column', 'owner', 'condition', 'description', 'tags'];
const EXAMPLE = [
  ['orders.customer_id not null', 'Completeness', 'Critical', 'public.orders', 'customer_id', 'data-quality', 'customer_id IS NOT NULL', 'Customer ID must always be present', 'quality, orders'],
  ['orders.amount positive', 'Validity', 'High', 'public.orders', 'amount', 'data-quality', 'amount > 0', 'Order amount must be greater than zero', 'quality, finance'],
];

function matches(e: DqRuleEntry, q: string) {
  const l = q.toLowerCase();
  return e.name.toLowerCase().includes(l) || (e.rule_type?.toLowerCase().includes(l) ?? false) ||
    (e.description?.toLowerCase().includes(l) ?? false) || (e.target_table?.toLowerCase().includes(l) ?? false) ||
    (e.target_column?.toLowerCase().includes(l) ?? false) || (e.severity?.toLowerCase().includes(l) ?? false) ||
    (e.owner?.toLowerCase().includes(l) ?? false) || e.tags.some(t => t.toLowerCase().includes(l));
}

interface Props { session: Session; }

export default function DqRulesPage({ session }: Props) {
  const [entries, setEntries] = useState<DqRuleEntry[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const token = session.access_token;
  const filtered = search.trim() ? entries.filter(e => matches(e, search.trim())) : entries;

  useEffect(() => { dqRulesApi.getAll(token).then(setEntries).catch(e => setError(e.message)).finally(() => setLoading(false)); }, [token]);

  const handleCreate = async (d: DqRuleInput) => { const e = await dqRulesApi.create(token, d); setEntries(p => [e, ...p]); setShowForm(false); };
  const handleEdit = async (id: string, d: Partial<DqRuleInput>) => { const u = await dqRulesApi.update(token, id, d); setEntries(p => p.map(e => e.id === id ? u : e)); };
  const handleDelete = async (id: string) => { await dqRulesApi.delete(token, id); setEntries(p => p.filter(e => e.id !== id)); };

  const handleUpload = async (rows: Record<string, string>[]) => {
    setUploading(true); setError('');
    try {
      const mapped: DqRuleInput[] = rows.filter(r => r.name?.trim()).map(r => ({
        name: r.name.trim(),
        rule_type: (DQ_RULE_TYPES as readonly string[]).includes(r.rule_type) ? r.rule_type as DqRuleInput['rule_type'] : null,
        severity: (DQ_SEVERITIES as readonly string[]).includes(r.severity) ? r.severity as DqRuleInput['severity'] : null,
        target_table: r.target_table?.trim() || null,
        target_column: r.target_column?.trim() || null,
        owner: r.owner?.trim() || null,
        condition: r.condition?.trim() || null,
        description: r.description?.trim() || null,
        tags: r.tags ? r.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }));
      const created = await dqRulesApi.bulk(token, mapped);
      setEntries(p => [...created, ...p]);
    } catch (e) { setError((e as Error).message); }
    finally { setUploading(false); }
  };

  return (
    <div className="todos-container">
      <div className="catalog-top">
        <div>
          <h2 className="section-title">Data Quality Rules</h2>
          <p className="count">{search.trim() ? `${filtered.length} of ${entries.length}` : entries.length} rule{entries.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="catalog-actions">
          <button className="btn-secondary" onClick={() => downloadExcel(COLUMNS, EXAMPLE, 'dq_rules_example.xlsx')}>Download example</button>
          <label htmlFor="excel-upload-dqrules" className="btn-secondary" style={{ cursor: 'pointer' }}>{uploading ? 'Uploading...' : 'Upload Excel'}</label>
          <ExcelUpload id="excel-upload-dqrules" onUpload={handleUpload} />
          {!showForm && <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add rule</button>}
        </div>
      </div>
      <input className="search-bar" type="search" placeholder="Search by name, type, table, severity..." value={search} onChange={e => setSearch(e.target.value)} />
      {showForm && <div className="catalog-form-wrap"><DqRuleForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} /></div>}
      {error && <p className="error">{error}</p>}
      {loading ? <p className="loading">Loading rules...</p> : filtered.length === 0 ? <p className="empty">{search.trim() ? 'No rules match your search.' : 'No rules defined yet.'}</p> : (
        <ul className="catalog-list">{filtered.map(e => <DqRuleItem key={e.id} entry={e} onEdit={handleEdit} onDelete={handleDelete} />)}</ul>
      )}
    </div>
  );
}
