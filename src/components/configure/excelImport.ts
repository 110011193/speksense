import * as XLSX from 'xlsx';
import type { CreatePersonInput } from '../../api/types';

const HEADERS = ['first_name', 'last_name', 'email', 'job_title', 'department', 'site'] as const;

export function downloadUserImportTemplate(): void {
  const example: Record<(typeof HEADERS)[number], string> = {
    first_name: 'Jamie',
    last_name: 'Lee',
    email: 'jamie.lee@nexuscrop.com',
    job_title: 'Analyst',
    department: 'Operations',
    site: 'Remote',
  };
  const ws = XLSX.utils.json_to_sheet([example], { header: [...HEADERS] });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Users');
  XLSX.writeFile(wb, 'speksense-user-import-template.xlsx');
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, '_');
}

export function parseUserSpreadsheet(file: File): Promise<CreatePersonInput[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = reader.result;
        const wb = XLSX.read(data, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' });
        const mapped: CreatePersonInput[] = rows.map((row) => {
          const normalized: Record<string, string> = {};
          for (const [key, value] of Object.entries(row)) {
            normalized[normalizeHeader(key)] = String(value ?? '').trim();
          }
          return {
            firstName: normalized.first_name ?? '',
            lastName: normalized.last_name ?? '',
            email: normalized.email ?? '',
            jobTitle: normalized.job_title ?? '',
            department: normalized.department || undefined,
            site: normalized.site || undefined,
          };
        });
        resolve(mapped.filter((r) => r.firstName || r.lastName || r.email || r.jobTitle));
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

export async function parseUserCsv(file: File): Promise<CreatePersonInput[]> {
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(normalizeHeader);
  const idx = (name: string) => headers.indexOf(name);
  return lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.trim());
    return {
      firstName: cols[idx('first_name')] ?? '',
      lastName: cols[idx('last_name')] ?? '',
      email: cols[idx('email')] ?? '',
      jobTitle: cols[idx('job_title')] ?? '',
      department: cols[idx('department')] || undefined,
      site: cols[idx('site')] || undefined,
    };
  });
}

export async function parseUserUpload(file: File): Promise<CreatePersonInput[]> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.csv')) return parseUserCsv(file);
  return parseUserSpreadsheet(file);
}
