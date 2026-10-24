/**
 * DataTable.tsx
 * Generic spreadsheet-style table — dark theme (#202020 base).
 *
 * Features:
 *  - Dynamic columns (any CSV schema)
 *  - Inline cell editing (click to edit, Enter/Blur to confirm)
 *  - Editable column headers (double-click)
 *  - Add/delete rows and columns
 *  - Sortable columns (click header sort icon)
 *  - Row striping + pagination
 */

"use client";

import { useMemo, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DataTableProps {
  headers: string[];
  rows: string[][];
  onUpdateCell: (rowIdx: number, colIdx: number, value: string) => void;
  onUpdateHeader: (colIdx: number, value: string) => void;
  onAddRow: () => void;
  onDeleteRow: (rowIdx: number) => void;
  onAddColumn: () => void;
  onDeleteColumn: (colIdx: number) => void;
}

type SortDir = "asc" | "desc";
interface SortState { col: number; dir: SortDir }

const PAGE_SIZE_OPTIONS = [25, 50, 100, 200];

// ─── Sort icon ────────────────────────────────────────────────────────────────

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className={`ml-0.5 inline-flex flex-col leading-none select-none`} style={{ color: active ? "#60a5fa" : "#555" }}>
      <span style={{ fontSize: "8px", color: active && dir === "asc" ? "#60a5fa" : "#555" }}>▲</span>
      <span style={{ fontSize: "8px", color: active && dir === "desc" ? "#60a5fa" : "#555" }}>▼</span>
    </span>
  );
}

// ─── Editable cell ────────────────────────────────────────────────────────────

interface EditableCellProps {
  value: string;
  onCommit: (value: string) => void;
  isHeader?: boolean;
  numeric?: boolean;
}

function EditableCell({ value, onCommit, isHeader = false, numeric = false }: EditableCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(value);
  const inputRef              = useRef<HTMLInputElement>(null);

  function startEdit() {
    setDraft(value);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function commit() {
    setEditing(false);
    if (draft !== value) onCommit(draft);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { e.preventDefault(); commit(); }
    if (e.key === "Escape") { setEditing(false); setDraft(value); }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={onKeyDown}
        className={`w-full h-full min-w-[80px] px-2 py-1 rounded outline-none text-xs ${numeric ? "text-right font-mono" : "text-left"} ${isHeader ? "font-semibold" : ""}`}
        style={{ background: "#1a2a3a", border: "1px solid #3b82f6", color: "#e8e8e8" }}
      />
    );
  }

  return (
    <span
      onDoubleClick={startEdit}
      onClick={isHeader ? undefined : startEdit}
      title="Click to edit"
      className={`block w-full cursor-text select-none rounded px-1 -mx-1 transition-colors duration-75 ${numeric ? "text-right font-mono tabular-nums" : "text-left"} ${isHeader ? "font-semibold" : ""}`}
      style={{ color: isHeader ? "#bbb" : "#ccc" }}
    >
      {value || <span style={{ color: "#444", fontStyle: "italic" }}>empty</span>}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DataTable({
  headers,
  rows,
  onUpdateCell,
  onUpdateHeader,
  onAddRow,
  onDeleteRow,
  onAddColumn,
  onDeleteColumn,
}: DataTableProps) {
  const [sort, setSort]         = useState<SortState | null>(null);
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  // ── Sort (keeps original index alongside) ───────────────────────────────
  const sortedIndexed = useMemo(() => {
    const indexed = rows.map((r, i) => ({ row: r, origIdx: i }));
    if (!sort) return indexed;
    return [...indexed].sort((a, b) => {
      const av = a.row[sort.col] ?? "";
      const bv = b.row[sort.col] ?? "";
      const an = Number(av), bn = Number(bv);
      let cmp: number;
      if (!isNaN(an) && !isNaN(bn) && av !== "" && bv !== "") {
        cmp = an - bn;
      } else {
        cmp = av.localeCompare(bv);
      }
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [rows, sort]);

  // ── Pagination ───────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(sortedIndexed.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const pageItems  = sortedIndexed.slice((safePage - 1) * pageSize, safePage * pageSize);
  const startRow   = sortedIndexed.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endRow     = Math.min(safePage * pageSize, sortedIndexed.length);

  function handleSort(colIdx: number) {
    setSort((prev) =>
      prev?.col === colIdx
        ? { col: colIdx, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { col: colIdx, dir: "asc" }
    );
    setPage(1);
  }

  function handlePageSize(e: React.ChangeEvent<HTMLSelectElement>) {
    setPageSize(Number(e.target.value));
    setPage(1);
  }

  if (headers.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center h-64 gap-4 text-sm rounded-2xl border-2 border-dashed"
        style={{ background: "#2a2a2a", borderColor: "#3a3a3a", color: "#555" }}
      >
        <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ color: "#3a3a3a" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-1.5-3.75c.621 0 1.125.504 1.125 1.125v1.5" />
        </svg>
        <div className="text-center">
          <p className="font-medium" style={{ color: "#888" }}>No data loaded</p>
          <p className="text-xs mt-1" style={{ color: "#555" }}>Open a CSV file or create a new one using the toolbar above.</p>
        </div>
      </div>
    );
  }

  // shared cell border colour
  const cellBorder = "1px solid #2e2e2e";

  return (
    <div className="flex flex-col gap-0">
      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="overflow-auto rounded-t-xl" style={{ maxHeight: "65vh", border: "1px solid #3a3a3a" }}>
        <table className="min-w-full text-sm border-collapse">
          {/* Sticky header */}
          <thead className="sticky top-0 z-10">
            <tr>
              {/* Row-number column */}
              <th
                className="px-2 py-2 text-right text-xs font-semibold select-none w-10"
                style={{ background: "#303030", borderBottom: "1px solid #3a3a3a", borderRight: cellBorder, color: "#555" }}
              >
                #
              </th>

              {headers.map((header, colIdx) => (
                <th
                  key={colIdx}
                  onMouseEnter={() => setHoveredCol(colIdx)}
                  onMouseLeave={() => setHoveredCol(null)}
                  className="px-2 py-1.5 text-xs uppercase tracking-wide select-none whitespace-nowrap group"
                  style={{ background: "#303030", borderBottom: "1px solid #3a3a3a", borderRight: cellBorder, minWidth: "120px", color: "#888" }}
                >
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleSort(colIdx)}
                      className="flex-1 flex items-center gap-0.5 text-left transition-colors"
                    >
                      <EditableCell
                        value={header}
                        onCommit={(v) => onUpdateHeader(colIdx, v)}
                        isHeader
                      />
                      <SortIcon active={sort?.col === colIdx} dir={sort?.col === colIdx ? sort.dir : "asc"} />
                    </button>

                    {/* Delete column */}
                    <button
                      type="button"
                      onClick={() => onDeleteColumn(colIdx)}
                      title="Delete column"
                      className={`ml-1 shrink-0 w-4 h-4 flex items-center justify-center rounded transition-colors duration-75 ${hoveredCol === colIdx ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                      style={{ color: "#e05252" }}
                    >
                      ×
                    </button>
                  </div>
                </th>
              ))}

              {/* Add column button */}
              <th
                className="px-2 py-2 w-10"
                style={{ background: "#303030", borderBottom: "1px solid #3a3a3a" }}
              >
                <button
                  type="button"
                  onClick={onAddColumn}
                  title="Add column"
                  className="w-6 h-6 flex items-center justify-center rounded-full text-base font-bold transition-colors duration-100 mx-auto"
                  style={{ background: "#3a3a3a", color: "#888" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1d3a5f"; (e.currentTarget as HTMLButtonElement).style.color = "#60a5fa"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#3a3a3a"; (e.currentTarget as HTMLButtonElement).style.color = "#888"; }}
                >
                  +
                </button>
              </th>
            </tr>
          </thead>

          <tbody>
            {pageItems.map(({ row, origIdx }, rowIdx) => {
              const isEven = rowIdx % 2 === 0;
              return (
                <tr
                  key={origIdx}
                  onMouseEnter={() => setHoveredRow(origIdx)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className="group transition-colors duration-75"
                  style={{ background: hoveredRow === origIdx ? "#1e2d3d" : isEven ? "#252525" : "#272727", borderBottom: cellBorder }}
                >
                  {/* Row number + delete */}
                  <td
                    className="px-2 py-1 text-right text-xs tabular-nums w-10"
                    style={{ borderRight: cellBorder, color: "#444" }}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onDeleteRow(origIdx)}
                        title="Delete row"
                        className={`w-4 h-4 flex items-center justify-center rounded transition-colors duration-75 ${hoveredRow === origIdx ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                        style={{ color: "#e05252" }}
                      >
                        ×
                      </button>
                      <span>{startRow + rowIdx}</span>
                    </div>
                  </td>

                  {row.map((cell, colIdx) => (
                    <td
                      key={colIdx}
                      className="px-2 py-1 text-xs"
                      style={{ borderRight: cellBorder }}
                    >
                      <EditableCell
                        value={cell}
                        onCommit={(v) => onUpdateCell(origIdx, colIdx, v)}
                      />
                    </td>
                  ))}

                  {/* Spacer for add-column header */}
                  <td />
                </tr>
              );
            })}

            {/* Add row button row */}
            <tr style={{ background: "#252525", borderBottom: cellBorder }}>
              <td colSpan={headers.length + 2} className="px-2 py-1">
                <button
                  type="button"
                  onClick={onAddRow}
                  className="flex items-center gap-1.5 text-xs rounded-lg px-3 py-1.5 transition-colors duration-100 w-full"
                  style={{ color: "#555" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#60a5fa"; (e.currentTarget as HTMLButtonElement).style.background = "#1d2d3d"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#555"; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >
                  <span className="text-base font-bold leading-none">+</span>
                  <span>Add row</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Pagination bar ──────────────────────────────────────────────── */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-b-xl border border-t-0"
        style={{ background: "#2a2a2a", borderColor: "#3a3a3a" }}
      >
        {/* Row info */}
        <span className="text-xs tabular-nums" style={{ color: "#666" }}>
          Showing <strong style={{ color: "#999" }}>{startRow}–{endRow}</strong> of{" "}
          <strong style={{ color: "#999" }}>{rows.length}</strong> rows ·{" "}
          <strong style={{ color: "#999" }}>{headers.length}</strong> columns
        </span>

        {/* Centre: page controls */}
        <div className="flex items-center gap-1">
          {[
            { label: "«", action: () => setPage(1),             disabled: safePage <= 1 },
            { label: "‹", action: () => setPage((p) => p - 1), disabled: safePage <= 1 },
          ].map(({ label, action, disabled }) => (
            <button key={label} type="button" disabled={disabled} onClick={action}
              className="px-2 py-1 text-xs rounded border transition-colors disabled:opacity-30"
              style={{ borderColor: "#3a3a3a", color: "#888", background: "#2a2a2a" }}>
              {label}
            </button>
          ))}

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 2)
            .reduce<(number | "…")[]>((acc, p, i, arr) => {
              if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === "…" ? (
                <span key={`el-${i}`} className="px-1 text-xs" style={{ color: "#555" }}>…</span>
              ) : (
                <button key={p} type="button" onClick={() => setPage(p as number)}
                  className="px-2.5 py-1 text-xs rounded border transition-colors"
                  style={safePage === p
                    ? { background: "#2563eb", borderColor: "#2563eb", color: "#fff", fontWeight: 600 }
                    : { borderColor: "#3a3a3a", color: "#888", background: "#2a2a2a" }
                  }>
                  {p}
                </button>
              )
            )}

          {[
            { label: "›", action: () => setPage((p) => p + 1), disabled: safePage >= totalPages },
            { label: "»", action: () => setPage(totalPages),    disabled: safePage >= totalPages },
          ].map(({ label, action, disabled }) => (
            <button key={label} type="button" disabled={disabled} onClick={action}
              className="px-2 py-1 text-xs rounded border transition-colors disabled:opacity-30"
              style={{ borderColor: "#3a3a3a", color: "#888", background: "#2a2a2a" }}>
              {label}
            </button>
          ))}
        </div>

        {/* Rows per page */}
        <label className="flex items-center gap-2 text-xs" style={{ color: "#666" }}>
          Rows per page
          <select value={pageSize} onChange={handlePageSize}
            className="text-xs rounded px-2 py-1 border focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ background: "#333", borderColor: "#3a3a3a", color: "#aaa" }}>
            {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      </div>
    </div>
  );
}
