/**
 * useSpreadsheet.ts
 * Core spreadsheet state hook.
 * Manages headers, rows (all strings), inline editing, add/delete row/column,
 * CSV import and CSV export (save-as).
 */

"use client";

import { useCallback, useState } from "react";
import { parseCSV, serialiseCSV } from "@/lib/csvParser";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SpreadsheetState {
  headers: string[];
  rows: string[][];
  fileName: string;
  isDirty: boolean;
}

export interface UseSpreadsheetReturn {
  headers: string[];
  rows: string[][];
  fileName: string;
  isDirty: boolean;
  hasData: boolean;

  // Import
  loadCSV: (raw: string, fileName: string) => void;

  // Export
  saveAsCSV: () => void;

  // Editing
  updateCell: (rowIdx: number, colIdx: number, value: string) => void;
  updateHeader: (colIdx: number, value: string) => void;

  // Structure mutations
  addRow: () => void;
  deleteRow: (rowIdx: number) => void;
  addColumn: () => void;
  deleteColumn: (colIdx: number) => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSpreadsheet(): UseSpreadsheetReturn {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows]       = useState<string[][]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [isDirty, setIsDirty]   = useState(false);

  // ── Import ───────────────────────────────────────────────────────────────
  const loadCSV = useCallback((raw: string, name: string) => {
    const parsed = parseCSV(raw);
    setHeaders(parsed.headers);
    setRows(parsed.rows);
    setFileName(name);
    setIsDirty(false);
  }, []);

  // ── Export ───────────────────────────────────────────────────────────────
  const saveAsCSV = useCallback(() => {
    const csv = serialiseCSV(headers, rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = fileName || "data.csv";
    a.click();
    URL.revokeObjectURL(url);
    setIsDirty(false);
  }, [headers, rows, fileName]);

  // ── Cell / header edits ──────────────────────────────────────────────────
  const updateCell = useCallback((rowIdx: number, colIdx: number, value: string) => {
    setRows((prev) => {
      const next = prev.map((r, ri) =>
        ri === rowIdx ? r.map((c, ci) => (ci === colIdx ? value : c)) : r
      );
      return next;
    });
    setIsDirty(true);
  }, []);

  const updateHeader = useCallback((colIdx: number, value: string) => {
    setHeaders((prev) => prev.map((h, i) => (i === colIdx ? value : h)));
    setIsDirty(true);
  }, []);

  // ── Row mutations ────────────────────────────────────────────────────────
  const addRow = useCallback(() => {
    setRows((prev) => {
      const colCount = headers.length;
      return [...prev, Array(colCount).fill("")];
    });
    setIsDirty(true);
  }, [headers.length]);

  const deleteRow = useCallback((rowIdx: number) => {
    setRows((prev) => prev.filter((_, i) => i !== rowIdx));
    setIsDirty(true);
  }, []);

  // ── Column mutations ─────────────────────────────────────────────────────
  const addColumn = useCallback(() => {
    const newHeader = `Column ${headers.length + 1}`;
    setHeaders((prev) => [...prev, newHeader]);
    setRows((prev) => prev.map((r) => [...r, ""]));
    setIsDirty(true);
  }, [headers.length]);

  const deleteColumn = useCallback((colIdx: number) => {
    setHeaders((prev) => prev.filter((_, i) => i !== colIdx));
    setRows((prev) => prev.map((r) => r.filter((_, i) => i !== colIdx)));
    setIsDirty(true);
  }, []);

  return {
    headers,
    rows,
    fileName,
    isDirty,
    hasData: headers.length > 0,
    loadCSV,
    saveAsCSV,
    updateCell,
    updateHeader,
    addRow,
    deleteRow,
    addColumn,
    deleteColumn,
  };
}
