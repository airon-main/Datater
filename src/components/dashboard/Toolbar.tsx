/**
 * Toolbar.tsx
 * Top action bar with:
 *  - Open CSV (file picker)
 *  - New (blank spreadsheet)
 *  - Save As CSV (download)
 *  - Dirty indicator
 */

"use client";

import { useRef } from "react";

interface ToolbarProps {
  hasData: boolean;
  onOpen: (raw: string, fileName: string) => void;
  onNew: () => void;
  onSaveAs: () => void;
}

export function Toolbar({ hasData, onOpen, onNew, onSaveAs }: ToolbarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      alert("Please select a valid .csv file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const raw = ev.target?.result as string;
      onOpen(raw, file.name);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div
      className="rounded-2xl px-4 py-3 flex flex-wrap items-center gap-2 border"
      style={{ background: "#2a2a2a", borderColor: "#3a3a3a" }}
    >
      {/* Open button */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-2 transition-colors duration-150 border"
        style={{ color: "#ccc", background: "#333", borderColor: "#444" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#3b82f6"; (e.currentTarget as HTMLButtonElement).style.color = "#60a5fa"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#444"; (e.currentTarget as HTMLButtonElement).style.color = "#ccc"; }}
      >
        {/* Folder-open icon */}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
        </svg>
        Open CSV
      </button>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="sr-only"
        onChange={handleFileChange}
      />

      {/* New button */}
      <button
        type="button"
        onClick={onNew}
        className="inline-flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-2 transition-colors duration-150 border"
        style={{ color: "#ccc", background: "#333", borderColor: "#444" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#3a3a3a"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#333"; }}
      >
        {/* Plus icon */}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        New
      </button>

      {/* Divider */}
      <div className="h-5 w-px mx-1" style={{ background: "#3a3a3a" }} />

      {/* Save As button */}
      <button
        type="button"
        onClick={onSaveAs}
        disabled={!hasData}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-lg px-3 py-2 transition-colors duration-150"
      >
        {/* Download icon */}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        Save As
      </button>
    </div>
  );
}
