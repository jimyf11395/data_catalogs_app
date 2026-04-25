import { useState } from 'react';
import { LineageEntry, LineageInput } from '../lib/lineageApi';
import LineageForm from './LineageForm';

interface Props { entry: LineageEntry; onEdit: (id: string, d: Partial<LineageInput>) => Promise<void>; onDelete: (id: string) => Promise<void>; }

export default function LineageItem({ entry, onEdit, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  if (editing) return <li className="catalog-item editing"><LineageForm initial={entry} onSubmit={async d => { await onEdit(entry.id, d); setEditing(false); }} onCancel={() => setEditing(false)} /></li>;

  return (
    <li className="catalog-item">
      <div className="catalog-header">
        <div className="catalog-title-row">
          {entry.status && <span className={`type-badge ${entry.status === 'Active' ? 'type-gold' : 'type-source'}`}>{entry.status}</span>}
          <span className="catalog-table">{entry.name}</span>
        </div>
        <div className="todo-actions">
          <button onClick={() => setEditing(true)}>Edit</button>
          <button className="delete" onClick={() => onDelete(entry.id)}>Delete</button>
        </div>
      </div>
      <div className="lineage-flow">
        <span className="lineage-node">{[entry.source_system, entry.source_table].filter(Boolean).join(' · ') || '—'}</span>
        <span className="lineage-arrow">→</span>
        <span className="lineage-node">{[entry.target_system, entry.target_table].filter(Boolean).join(' · ') || '—'}</span>
      </div>
      <div className="catalog-meta-row">
        {entry.pipeline_name && <span className="meta-field"><span className="meta-label">Pipeline:</span> {entry.pipeline_name}</span>}
        {entry.schedule && <span className="meta-field"><span className="meta-label">Schedule:</span> {entry.schedule}</span>}
        {entry.owner && <span className="meta-field"><span className="meta-label">Owner:</span> {entry.owner}</span>}
      </div>
      {entry.transformation && <p className="catalog-desc">{entry.transformation}</p>}
      {entry.tags.length > 0 && <div className="catalog-meta">{entry.tags.map(t => <span key={t} className="meta-pill tag">{t}</span>)}</div>}
    </li>
  );
}
