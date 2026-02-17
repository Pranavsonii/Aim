"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button.jsx";
import { exportGoals, importGoalsFromJSON } from "@/utils/storage.js";

export default function ExportImport({ goals, onImport }) {
  const fileInputRef = useRef(null);
  const [importError, setImportError] = useState(null);

  const handleExport = () => {
    const blob = new Blob([exportGoals(goals)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `goals-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    setImportError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = importGoalsFromJSON(reader.result);
      if (result.ok) {
        onImport(result.goals);
        setImportError(null);
      } else {
        setImportError(result.error || "Import failed");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button variant="outline" size="sm" onClick={handleExport}>
        Export
      </Button>
      <Button variant="outline" size="sm" onClick={handleImportClick}>
        Import
      </Button>
      {importError && (
        <span className="text-sm text-destructive" role="alert">
          {importError}
        </span>
      )}
    </div>
  );
}
