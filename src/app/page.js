"use client";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import GoalList from "@/components/GoalList.js";
import AddGoalForm from "@/components/AddGoalForm.js";
import ThemeToggle from "@/components/ThemeToggle.js";
import ExportImport from "@/components/ExportImport.js";
import { getGoals, saveGoals } from "@/utils/storage.js";
import { Input } from "@/components/ui/input.jsx";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts.js";
import PWAInstall from "@/components/PWAInstall.js";
import SettingsDialog from "@/components/SettingsDialog.js";
import { Button } from "@/components/ui/button.jsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.jsx";
import { Search, Target } from "lucide-react";

const HIDE_COMPLETED_KEY = "goal-tracker-hide-completed";

function matchSearch(goal, query) {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  if (goal.goalName?.toLowerCase().includes(q)) return true;
  if (goal.goalDescription?.toLowerCase().includes(q)) return true;
  if (goal.tasks?.some((t) => t.taskName?.toLowerCase().includes(q))) return true;
  return false;
}

export default function Home() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [hideCompleted, setHideCompleted] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(HIDE_COMPLETED_KEY) === "true";
  });
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const addGoalFormRef = useRef(null);

  useKeyboardShortcuts({
    onNewGoal: () => addGoalFormRef.current?.open?.(),
    onShowHelp: () => setShortcutsHelpOpen(true),
  });

  useEffect(() => {
    const loadGoals = async () => {
      try {
        setLoading(true);
        const storedGoals = await getGoals();
        setGoals(storedGoals);
      } catch (error) {
        console.error("Error loading goals:", error);
        setGoals([]);
      } finally {
        setLoading(false);
      }
    };

    loadGoals();
  }, []);

  useEffect(() => {
    localStorage.setItem(HIDE_COMPLETED_KEY, String(hideCompleted));
  }, [hideCompleted]);

  const handleGoalUpdate = useCallback((updatedGoals) => {
    setGoals(updatedGoals);
    saveGoals(updatedGoals);
  }, []);

  const displayGoals = useMemo(() => {
    let list = hideCompleted ? goals.filter((g) => !g.completed) : goals;
    list = list.filter((g) => matchSearch(g, searchQuery));
    return list;
  }, [goals, hideCompleted, searchQuery]);

  const onGoalsUpdateFromList = useCallback(
    (updatedDisplayGoals) => {
      if (hideCompleted) {
        const completed = goals.filter((g) => g.completed);
        handleGoalUpdate([...updatedDisplayGoals, ...completed]);
      } else {
        handleGoalUpdate(updatedDisplayGoals);
      }
    },
    [hideCompleted, goals, handleGoalUpdate]
  );

  return (
    <main className="min-h-screen bg-muted/30 p-4 pb-0 md:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="sticky p-5 rounded top-0 z-10 -mx-4 -mt-4 md:-mx-6 md:-mt-6 px-4 pt-4 md:px-6 md:pt-6 pb-4 border-b border-border bg-background/95 shadow-sm mb-3">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <h1 className="text-3xl font-bold tracking-tight">🎯 Goal Tracker</h1>
            <div className="flex items-center gap-2 flex-wrap">
              {!loading && goals.length > 0 && (
                <div className="">
                  <div className="relative max-w-sm">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
                      aria-hidden
                    />
                    <Input
                      type="search"
                      placeholder="Search goals and tasks…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 rounded-lg bg-background border-border"
                      aria-label="Search goals and tasks"
                    />
                  </div>
                </div>
              )}
              <ThemeToggle />
              <div className="h-6 w-px bg-border hidden sm:block" aria-hidden />
              {/* <ExportImport goals={goals} onImport={(g) => handleGoalUpdate(g)} /> */}
              {/* <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={hideCompleted}
                  onChange={(e) => setHideCompleted(e.target.checked)}
                  className="rounded border-input"
                />
                <span className="text-muted-foreground">Hide completed</span>
              </label> */}

              <AddGoalForm
                ref={addGoalFormRef}
                goalsCount={goals.length}
                onGoalAdd={(newGoal) => {
                  handleGoalUpdate([...goals, newGoal]);
                }}
              />

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSettingsOpen(true)}
                aria-label="Settings"
              >
                Settings
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => setShortcutsHelpOpen(true)}
                aria-label="Keyboard shortcuts"
              >
                ?
              </Button>
            </div>
          </div>
        </header>
        <SettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          goals={goals}
          onImport={(g) => handleGoalUpdate(g)}
          hideCompleted={hideCompleted}
          onHideCompletedChange={setHideCompleted}
          onOpenShortcuts={() => setShortcutsHelpOpen(true)}
        />
        <Dialog open={shortcutsHelpOpen} onOpenChange={setShortcutsHelpOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Keyboard shortcuts</DialogTitle>
            </DialogHeader>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li><kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">N</kbd> New goal</li>
              <li><kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">?</kbd> Show this help</li>
              <li><kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">Esc</kbd> Close dialog</li>
            </ul>
          </DialogContent>
        </Dialog>

        <div className="overflow-y-auto p-1">
          {loading ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
              <p className="text-muted-foreground text-sm">Loading goals…</p>
            </div>
          ) : goals.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 flex flex-col items-center justify-center text-center">
              <Target className="size-10 text-muted-foreground/70 mb-3" aria-hidden />
              <p className="text-muted-foreground font-medium mb-1">No goals yet</p>
              <p className="text-sm text-muted-foreground/80 max-w-xs">
                Add your first goal using the &quot;+ New Goal&quot; button above to get started.
              </p>
            </div>
          ) : displayGoals.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 flex flex-col items-center justify-center text-center">
              <Search className="size-10 text-muted-foreground/70 mb-3" aria-hidden />
              <p className="text-muted-foreground font-medium mb-1">
                No goals match your search or filter
              </p>
              <p className="text-sm text-muted-foreground/80 max-w-xs">
                Try a different search or uncheck &quot;Hide completed&quot;.
              </p>
            </div>
          ) : (
            <GoalList
              goals={displayGoals}
              onGoalsUpdate={onGoalsUpdateFromList}
            />
          )}
        </div>
      </div>
      <PWAInstall />
    </main>
  );
}
