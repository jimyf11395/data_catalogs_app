import { useState } from 'react';
import { ReportEntry, ReportInput } from '../lib/reportsApi';
import ReportForm from './ReportForm';

const STATUS_CLASS: Record<string, string> = { Active: 'type-gold', Deprecated: 'type-source', 'Under Review': 'type-bronce' };

interface Props { entry: ReportEntry; onEdit: (id: string, d: Partial<ReportInput>) => Promise<void>; onDelete: (id: string) => Promise<void>; }

export default function ReportItem({ entry, onEdit, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  if (editing) return <li className="catalog-item editing"><ReportForm initial={entry} onSubmit={async d => { await onEdit(entry.id, d); setEditing(false); }} onCancel={() => setEditing(false)} /></li>;

  return (
    <li className="catalog-item">
      <div className="catalog-header">
        <div className="catalog-title-row">
          {entry.status && <span className={`type-badge ${STATUS_CLASS[entry.status] ?? ''}`}>{entry.status}</span>}
          {entry.url ? <a className="catalog-table report-link" href={entry.url} target="_blank" rel="noopener noreferrer">{entry.name}</a> : <span className="catalog-table">{entry.name}</span>}
          {entry.tool && <span className="kpi-unit">{entry.tool}</span>}
        </div>
        <div className="todo-actions">
          <button onClick={() => setEditing(true)}>Edit</button>
          <button className="delete" onClick={() => onDelete(entry.id)}>Delete</button>
        </div>
      </div>
      <div className="catalog-meta-row">
        {entry.owner && <span className="meta-field"><span className="meta-label">Owner:</span> {entry.owner}</span>}
        {entry.refresh_frequency && <span className="meta-field"><span className="meta-label">Refresh:</span> {entry.refresh_frequency}</span>}
        {entry.business_users && <span className="meta-field"><span className="meta-label">Users:</span> {entry.business_users}</span>}
      </div>
      {entry.description && <p className="catalog-desc">{entry.description}</p>}
      {entry.source_tables.length > 0 && <p className="catalog-desc"><span className="meta-label">Sources:</span> {entry.source_tables.join(', ')}</p>}
      {entry.tags.length > 0 && <div className="catalog-meta">{entry.tags.map(t => <span key={t} className="meta-pill tag">{t}</span>)}</div>}
    </li>
  );
}
