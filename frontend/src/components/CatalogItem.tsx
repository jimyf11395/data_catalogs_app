import { useState } from 'react';
import { CatalogEntry, CatalogInput } from '../lib/catalogApi';
import CatalogForm from './CatalogForm';

interface Props {
  entry: CatalogEntry;
  onEdit: (id: string, data: Partial<CatalogInput>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const TYPE_CLASS: Record<string, string> = {
  Source: 'type-source',
  Bronce: 'type-bronce',
  Silver: 'type-silver',
  Gold: 'type-gold',
};

export default function CatalogItem({ entry, onEdit, onDelete }: Props) {
  const [editing, setEditing] = useState(false);

  const handleEdit = async (data: CatalogInput) => {
    await onEdit(entry.id, data);
    setEditing(false);
  };

  if (editing) {
    return (
      <li className="catalog-item editing">
        <CatalogForm initial={entry} onSubmit={handleEdit} onCancel={() => setEditing(false)} />
      </li>
    );
  }

  return (
    <li className="catalog-item">
      <div className="catalog-header">
        <div className="catalog-title-row">
          {entry.type && <span className={`type-badge ${TYPE_CLASS[entry.type] ?? ''}`}>{entry.type}</span>}
          <span className="catalog-schema">{entry.schema_name}.</span>
          <span className="catalog-table">{entry.table_name}</span>
        </div>
        <div className="todo-actions">
          <button onClick={() => setEditing(true)}>Edit</button>
          <button className="delete" onClick={() => onDelete(entry.id)}>Delete</button>
        </div>
      </div>

      <div className="catalog-meta-row">
        {entry.source_system && <span className="meta-field"><span className="meta-label">Source:</span> {entry.source_system}</span>}
        {entry.db_name && <span className="meta-field"><span className="meta-label">DB:</span> {entry.db_name}</span>}
        {entry.owner && <span className="meta-field"><span className="meta-label">Owner:</span> {entry.owner}</span>}
      </div>

      {entry.description && <p className="catalog-desc">{entry.description}</p>}

      {entry.tags.length > 0 && (
        <div className="catalog-meta">
          {entry.tags.map((tag) => <span key={tag} className="meta-pill tag">{tag}</span>)}
        </div>
      )}
    </li>
  );
}
