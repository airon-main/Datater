/**
 * csvParser.ts
 * Generic CSV parser — returns a list of column headers and rows as
 * string arrays. No fixed schema; works with any CSV file.
 */

/**
 * Splits a single CSV line respecting double-quoted fields that may contain commas.
 */
export function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      // Handle escaped double-quote inside quotes ("")
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

export interface ParsedCSV {
  headers: string[];
  rows: string[][];
}

/**
 * Parses raw CSV text into headers + rows (all as strings).
 * The first non-empty row is treated as the header row.
 */
export function parseCSV(raw: string): ParsedCSV {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = splitCsvLine(lines[0]);

  const rows: string[][] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    // Pad / truncate to match header length
    const normalised = Array.from({ length: headers.length }, (_, j) => cols[j] ?? "");
    rows.push(normalised);
  }

  return { headers, rows };
}

/**
 * Serialises headers + rows back to a CSV string.
 * Values containing commas, quotes, or newlines are quoted.
 */
export function serialiseCSV(headers: string[], rows: string[][]): string {
  const escape = (v: string) => (v.includes(",") || v.includes('"') || v.includes("\n") ? `"${v.replace(/"/g, '""')}"` : v);
  const lines = [headers, ...rows].map((row) => row.map(escape).join(","));
  return lines.join("\r\n");
}
