import { useState } from 'react';
import { KpiEntry, KpiInput } from '../lib/kpiApi';
import KpiForm from './KpiForm';

interface Props {
  entry: KpiEntry;
  onEdit: (id: string, data: Partial<KpiInput>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function KpiItem({ entry, onEdit, onDelete }: Props) {
  const [editing, setEditing] = useState(false);

  const handleEdit = async (data: KpiInput) => {
    await onEdit(entry.id, data);
    setEditing(false);
  };

  if (editing) {
    return (
      <li className="catalog-item editing">
        <KpiForm initial={entry} onSubmit={handleEdit} onCancel={() => setEditing(false)} />
      </li>
    );
  }

  return (
    <li className="catalog-item">
      <div className="catalog-header">
        <div className="catalog-title-row">
          {entry.frequency && <span className="type-badge type-source">{entry.frequency}</span>}
          <span className="catalog-table">{entry.name}</span>
          {entry.unit && <span className="kpi-unit">{entry.unit}</span>}
        </div>
        <div className="todo-actions">
          <button onClick={() => setEditing(true)}>Edit</button>
          <button className="delete" onClick={() => onDelete(entry.id)}>Delete</button>
        </div>
      </div>

      <div className="catalog-meta-row">
        {entry.category && <span className="meta-field"><span className="meta-label">Category:</span> {entry.category}</span>}
        {entry.owner && <span className="meta-field"><span className="meta-label">Owner:</span> {entry.owner}</span>}
      </div>

      {entry.formula && (
        <div className="kpi-formula">
          <span className="meta-label">Formula:</span> <code>{entry.formula}</code>
        </div>
      )}

      {entry.description && <p className="catalog-desc">{entry.description}</p>}

      {entry.tags.length > 0 && (
        <div className="catalog-meta">
          {entry.tags.map((tag) => <span key={tag} className="meta-pill tag">{tag}</span>)}
        </div>
      )}
    </li>
  );
}
