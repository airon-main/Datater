/**
 * page.tsx — Datater CSV Editor
 *
 * Generic CSV viewer and editor.
 * Open any CSV, edit cells/headers, add/delete rows and columns,
 * then save back as a .csv file.
 */

"use client";

import { useCallback } from "react";
import { useSpreadsheet } from "@/hooks/useSpreadsheet";
import { Toolbar } from "@/components/dashboard/Toolbar";
import { DataTable } from "@/components/dashboard/DataTable";

// Default blank spreadsheet (3 columns × 0 rows)
const BLANK_HEADERS = ["Column 1", "Column 2", "Column 3"];

export default function DashboardPage() {
  const {
    headers,
    rows,
    fileName,
    isDirty,
    hasData,
    loadCSV,
    saveAsCSV,
    updateCell,
    updateHeader,
    addRow,
    deleteRow,
    addColumn,
    deleteColumn,
  } = useSpreadsheet();

  // "New" creates a blank spreadsheet in-memory (no file)
  const handleNew = useCallback(() => {
    const blankCSV = BLANK_HEADERS.join(",") + "\r\n";
    loadCSV(blankCSV, "untitled.csv");
  }, [loadCSV]);

  return (
    <div className="min-h-screen font-sans" style={{ background: "#202020" }}>
      {/* ── Top header ──────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-20 border-b"
        style={{ background: "#202020", borderColor: "#3a3a3a" }}
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <div>
            {/* File name + dirty indicator */}
            <div
              className="ml-auto flex items-center gap-2 text-xs truncate max-w-xs"
              style={{ color: "#666" }}
            >
              {isDirty && (
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"
                  title="Unsaved changes"
                />
              )}
              <span className="truncate font-medium" style={{ color: "#888" }}>
                {fileName || "No file loaded"}
              </span>
            </div>
          </div>

          {/* Stats */}
          {hasData && (
            <div
              className="ml-auto flex items-center gap-3 text-xs"
              style={{ color: "#888" }}
            >
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
                {rows.length.toLocaleString()} rows · {headers.length} cols
              </span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* ── Toolbar ──────────────────────────────────────────────────── */}
        <Toolbar
          hasData={hasData}
          onOpen={loadCSV}
          onNew={handleNew}
          onSaveAs={saveAsCSV}
        />

        {/* ── Data Table ───────────────────────────────────────────────── */}
        <DataTable
          headers={headers}
          rows={rows}
          onUpdateCell={updateCell}
          onUpdateHeader={updateHeader}
          onAddRow={addRow}
          onDeleteRow={deleteRow}
          onAddColumn={addColumn}
          onDeleteColumn={deleteColumn}
        />
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer
        className="py-5 text-center text-xs border-t"
        style={{ borderColor: "#3a3a3a", color: "#555" }}
      >
        Datater · {fileName || "No file"}
      </footer>
    </div>
  );
}
