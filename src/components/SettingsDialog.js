"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.jsx";
import ThemeToggle from "@/components/ThemeToggle.js";
import ExportImport from "@/components/ExportImport.js";

export default function SettingsDialog({
  open,
  onOpenChange,
  goals,
  onImport,
  hideCompleted,
  onHideCompletedChange,
  onOpenShortcuts,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-2">
          <div>
            <label className="text-sm font-medium block mb-2">Theme</label>
            <div className="w-fit">
              <ThemeToggle />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label
              htmlFor="settings-hide-completed"
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                id="settings-hide-completed"
                checked={hideCompleted}
                onChange={(e) => onHideCompletedChange(e.target.checked)}
                className="rounded border-input size-4"
              />
              <span className="text-sm text-muted-foreground">
                Hide completed goals
              </span>
            </label>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Data</label>
            <ExportImport goals={goals} onImport={onImport} />
          </div>
          <div>
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onOpenShortcuts?.();
              }}
              className="text-sm text-primary hover:underline"
            >
              Keyboard shortcuts (?)
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
