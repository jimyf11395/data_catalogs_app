import { useState } from 'react';
import { DqRuleEntry, DqRuleInput } from '../lib/dqRulesApi';
import DqRuleForm from './DqRuleForm';

const SEV_CLASS: Record<string, string> = { Critical: 'sev-critical', High: 'sev-high', Medium: 'sev-medium', Low: 'sev-low' };

interface Props { entry: DqRuleEntry; onEdit: (id: string, d: Partial<DqRuleInput>) => Promise<void>; onDelete: (id: string) => Promise<void>; }

export default function DqRuleItem({ entry, onEdit, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  if (editing) return <li className="catalog-item editing"><DqRuleForm initial={entry} onSubmit={async d => { await onEdit(entry.id, d); setEditing(false); }} onCancel={() => setEditing(false)} /></li>;

  return (
    <li className="catalog-item">
      <div className="catalog-header">
        <div className="catalog-title-row">
          {entry.severity && <span className={`type-badge ${SEV_CLASS[entry.severity] ?? ''}`}>{entry.severity}</span>}
          {entry.rule_type && <span className="type-badge type-source">{entry.rule_type}</span>}
          <span className="catalog-table">{entry.name}</span>
        </div>
        <div className="todo-actions">
          <button onClick={() => setEditing(true)}>Edit</button>
          <button className="delete" onClick={() => onDelete(entry.id)}>Delete</button>
        </div>
      </div>
      <div className="catalog-meta-row">
        {entry.target_table && <span className="meta-field"><span className="meta-label">Table:</span> {entry.target_table}</span>}
        {entry.target_column && <span className="meta-field"><span className="meta-label">Column:</span> {entry.target_column}</span>}
        {entry.owner && <span className="meta-field"><span className="meta-label">Owner:</span> {entry.owner}</span>}
      </div>
      {entry.condition && <div className="kpi-formula"><span className="meta-label">Condition:</span> <code>{entry.condition}</code></div>}
      {entry.description && <p className="catalog-desc">{entry.description}</p>}
      {entry.tags.length > 0 && <div className="catalog-meta">{entry.tags.map(t => <span key={t} className="meta-pill tag">{t}</span>)}</div>}
    </li>
  );
}
