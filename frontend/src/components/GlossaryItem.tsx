import { useState } from 'react';
import { GlossaryEntry, GlossaryInput } from '../lib/glossaryApi';
import GlossaryForm from './GlossaryForm';

const STATUS_CLASS: Record<string, string> = { Draft: 'type-source', Approved: 'type-gold', Deprecated: 'type-bronce' };

interface Props { entry: GlossaryEntry; onEdit: (id: string, d: Partial<GlossaryInput>) => Promise<void>; onDelete: (id: string) => Promise<void>; }

export default function GlossaryItem({ entry, onEdit, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  if (editing) return <li className="catalog-item editing"><GlossaryForm initial={entry} onSubmit={async d => { await onEdit(entry.id, d); setEditing(false); }} onCancel={() => setEditing(false)} /></li>;

  return (
    <li className="catalog-item">
      <div className="catalog-header">
        <div className="catalog-title-row">
          {entry.status && <span className={`type-badge ${STATUS_CLASS[entry.status] ?? ''}`}>{entry.status}</span>}
          <span className="catalog-table">{entry.term}</span>
          {entry.domain && <span className="kpi-unit">{entry.domain}</span>}
        </div>
        <div className="todo-actions">
          <button onClick={() => setEditing(true)}>Edit</button>
          <button className="delete" onClick={() => onDelete(entry.id)}>Delete</button>
        </div>
      </div>
      <div className="catalog-meta-row">
        {entry.business_owner && <span className="meta-field"><span className="meta-label">Business:</span> {entry.business_owner}</span>}
        {entry.data_owner && <span className="meta-field"><span className="meta-label">Data:</span> {entry.data_owner}</span>}
      </div>
      {entry.definition && <p className="catalog-desc">{entry.definition}</p>}
      {entry.related_terms.length > 0 && <p className="catalog-desc"><span className="meta-label">Related:</span> {entry.related_terms.join(', ')}</p>}
      {entry.tags.length > 0 && <div className="catalog-meta">{entry.tags.map(t => <span key={t} className="meta-pill tag">{t}</span>)}</div>}
    </li>
  );
}
