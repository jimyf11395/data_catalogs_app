import { useRef } from 'react';
import * as XLSX from 'xlsx';

export function downloadExcel(columns: string[], rows: string[][], filename: string) {
  const ws = XLSX.utils.aoa_to_sheet([columns, ...rows]);
  ws['!cols'] = columns.map(() => ({ wch: 22 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'data');
  XLSX.writeFile(wb, filename);
}

interface Props {
  id: string;
  onUpload: (rows: Record<string, string>[]) => Promise<void>;
}

export default function ExcelUpload({ id, onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' });
    if (rows.length === 0) { alert('No data rows found in the file.'); return; }
    await onUpload(rows);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <input ref={inputRef} type="file" accept=".xlsx,.xls"
      style={{ display: 'none' }} onChange={handleFile} id={id} />
  );
}
