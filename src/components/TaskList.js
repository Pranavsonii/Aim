"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Checkbox } from "@/components/ui/checkbox.jsx";
import { useIsMobile } from "@/hooks/useIsMobile.js";
import { Trash2, Clock, Calendar, AlertCircle, X, Grip, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button.jsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog.jsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog.jsx";

export default function TaskList({
  tasks,
  onTaskUpdate,
  onTaskDelete,
  onTasksReorder,
  onEditTask,
}) {
  // Existing state variables
  const [sortBy, setSortBy] = useState("manual");
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    taskId: null,
  });
  const [datePickerOpen, setDatePickerOpen] = useState(null);
  const [hoveredTask, setHoveredTask] = useState(null);
  const contextMenuRef = useRef(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Add new state for duration dialog
  const [isDurationDialogOpen, setIsDurationDialogOpen] = useState(false);
  const [currentTaskForDuration, setCurrentTaskForDuration] = useState(null);
  const [durationInput, setDurationInput] = useState("");
  const [durationError, setDurationError] = useState("");

  const isMobile = useIsMobile();

  // Get time status color based on deadline
  const getTimeStatus = (deadline) => {
    if (!deadline) return "text-gray-400";

    const now = new Date();
    const taskDeadline = new Date(deadline);
    const daysRemaining = Math.ceil(
      (taskDeadline - now) / (1000 * 60 * 60 * 24)
    );

    if (daysRemaining < 0) return "text-red-500";
    if (daysRemaining < 2) return "text-orange-500";
    if (daysRemaining < 5) return "text-yellow-500";
    return "text-green-500";
  };

  // Label for due today / overdue emphasis
  const getDeadlineLabel = (deadline) => {
    if (!deadline) return null;
    const now = new Date();
    const taskDeadline = new Date(deadline);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);
    if (taskDeadline < startOfToday) return "Overdue";
    if (taskDeadline >= startOfToday && taskDeadline < endOfToday) return "Due today";
    return null;
  };

  // Sort tasks based on selected criteria
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      switch (sortBy) {
        case "manual":
          return (a.order ?? 999999) - (b.order ?? 999999);
        case "duration":
          return parseInt(b.duration || 0, 10) - parseInt(a.duration || 0, 10);
        case "deadline":
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline) - new Date(b.deadline);
        case "alphabetical":
          return a.taskName.localeCompare(b.taskName);
        case "recent":
        default:
          return a.id > b.id ? -1 : 1;
      }
    });
  }, [tasks, sortBy]);

  const handleDragEnd = (result) => {
    if (!result.destination || !onTasksReorder) return;
    const items = Array.from(sortedTasks);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    const reordered = items.map((t, i) => ({ ...t, order: i }));
    onTasksReorder(reordered);
  };

  // Handle right-click on task
  const handleContextMenu = (e, taskId) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.pageX,
      y: e.pageY,
      taskId: taskId,
    });
  };

  // Handle setting duration for a task
  const handleSetDuration = (task, duration) => {
    onTaskUpdate({
      ...task,
      duration: duration,
    });
  };

  // Handle setting deadline for a task
  const handleSetDeadline = (task, date) => {
    onTaskUpdate({
      ...task,
      deadline: date ? date.toISOString() : null,
    });
    setDatePickerOpen(null);
  };

  // Handle click outside context menu to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target)
      ) {
        setContextMenu({ ...contextMenu, visible: false });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [contextMenu]);

  // Modified function to initiate task deletion
  const handleDeleteClick = (taskId) => {
    setTaskToDelete(taskId);
    setIsDeleteDialogOpen(true);
  };

  // Function to confirm and execute task deletion
  const confirmDelete = () => {
    if (taskToDelete) {
      onTaskDelete(taskToDelete);
      setTaskToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Handle opening the duration dialog
  const handleOpenDurationDialog = (task) => {
    setCurrentTaskForDuration(task);
    setDurationInput(task.duration || "0");
    setDurationError("");
    setIsDurationDialogOpen(true);
  };

  // Handle submitting the duration
  const handleDurationSubmit = () => {
    // Validate that it's a positive number
    const duration = parseInt(durationInput);

    if (isNaN(duration)) {
      setDurationError("Please enter a valid number.");
      return;
    }

    if (duration < 0) {
      setDurationError("Duration cannot be negative.");
      return;
    }

    if (duration > 1440) {
      setDurationError("Duration cannot exceed 24 hours (1440 minutes).");
      return;
    }

    // If validation passes, update the task
    if (currentTaskForDuration) {
      handleSetDuration(currentTaskForDuration, durationInput);
      setIsDurationDialogOpen(false);
      setCurrentTaskForDuration(null);
    }
  };

  // Validate duration input as user types
  const handleDurationInputChange = (e) => {
    const value = e.target.value;

    // Accept only numbers and empty input
    if (value === "" || /^\d+$/.test(value)) {
      setDurationInput(value);
      setDurationError("");
    }
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold">Tasks</h4>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs py-1 px-2 border border-border rounded-lg bg-background appearance-none pr-8"
          >
            <option value="manual">Manual</option>
            <option value="recent">Recent</option>
            <option value="duration">Duration</option>
            <option value="deadline">Deadline</option>
            <option value="alphabetical">Alphabetically</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>

      {onTasksReorder ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="tasks">
            {(droppableProvided) => (
              <div
                ref={droppableProvided.innerRef}
                {...droppableProvided.droppableProps}
                className="space-y-3"
              >
                {sortedTasks.map((task, index) => (
                  <Draggable
                    key={task.id}
                    draggableId={task.id}
                    index={index}
                  >
                    {(draggableProvided) => (
                      <div
                        ref={draggableProvided.innerRef}
                        {...draggableProvided.draggableProps}
                        className={`p-3 rounded-lg border border-border transition-colors ${
                          task.completed ? "bg-muted/40" : "bg-card"
                        } hover:bg-muted/30 relative group`}
                        onMouseEnter={() => setHoveredTask(task.id)}
                        onMouseLeave={() => setHoveredTask(null)}
                        onContextMenu={(e) => handleContextMenu(e, task.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              {...draggableProvided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing touch-none p-0.5 text-muted-foreground"
                              aria-label="Drag to reorder"
                            >
                              <Grip size={16} />
                            </div>
                            <Checkbox
                              checked={task.completed}
                              onCheckedChange={(checked) =>
                                onTaskUpdate({
                                  ...task,
                                  completed: checked,
                                  completedDate: checked ? new Date().toISOString() : null,
                                })
                              }
                            />
                            <span
                              className={
                                task.completed ? "line-through text-slate-500" : ""
                              }
                            >
                              {task.taskName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {onEditTask && (
                              <button
                                onClick={() => onEditTask(task)}
                                className={`text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity md:block
                                  ${hoveredTask === task.id ? "md:opacity-100" : ""}
                                  ${isMobile ? "opacity-100" : ""}`}
                                aria-label="Edit task"
                                type="button"
                              >
                                <Pencil size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteClick(task.id)}
                              className={`text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity md:block
                                ${hoveredTask === task.id ? "md:opacity-100" : ""}
                                ${isMobile ? "opacity-100" : ""}`}
                              aria-label="Delete task"
                              type="button"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="flex ml-6 mt-1 space-x-2 text-sm justify-end">
                          <button
                            onClick={() => handleOpenDurationDialog(task)}
                            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                            type="button"
                          >
                            <Clock size={14} />
                            {task.duration ? `${task.duration} min` : "Add duration"}
                          </button>
                          <div className="relative">
                            <button
                              onClick={() =>
                                setDatePickerOpen(
                                  datePickerOpen === task.id ? null : task.id
                                )
                              }
                              className={`flex items-center gap-1 transition-colors ${
                                task.deadline
                                  ? getTimeStatus(task.deadline)
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                              type="button"
                            >
                              <Calendar size={14} />
                              {task.deadline
                                ? new Date(task.deadline).toLocaleDateString()
                                : "Add deadline"}
                              {getDeadlineLabel(task.deadline) && (
                                <span
                                  className={`ml-1 px-1.5 py-0 rounded text-xs font-medium ${
                                    getDeadlineLabel(task.deadline) === "Overdue"
                                      ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
                                      : "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                                  }`}
                                >
                                  {getDeadlineLabel(task.deadline)}
                                </span>
                              )}
                            </button>
                            {datePickerOpen === task.id && (
                              <div
                                className={
                                  isMobile
                                    ? "fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                                    : "absolute z-10"
                                }
                                onClick={(e) => {
                                  if (isMobile && e.target === e.currentTarget) {
                                    setDatePickerOpen(null);
                                  }
                                  e.stopPropagation();
                                }}
                              >
                                <div
                                  className={
                                    isMobile
                                      ? "w-[320px] max-w-[90vw] m-4 bg-popover border border-border shadow-md rounded-lg p-3"
                                      : "mt-1 w-[280px] transform -translate-x-1/4 bg-popover border border-border shadow-md rounded-lg p-3"
                                  }
                                >
                                  {isMobile && (
                                    <div className="flex justify-between items-center mb-2">
                                      <h4 className="font-semibold">Select Date</h4>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setDatePickerOpen(null)}
                                        className="p-1 h-auto"
                                      >
                                        <X size={18} />
                                      </Button>
                                    </div>
                                  )}
                                  <DatePicker
                                    selected={
                                      task.deadline ? new Date(task.deadline) : new Date()
                                    }
                                    onChange={(date) => handleSetDeadline(task, date)}
                                    inline
                                    onClickOutside={
                                      !isMobile ? () => setDatePickerOpen(null) : undefined
                                    }
                                    calendarClassName="w-full max-w-[100%]"
                                  />
                                  {task.deadline && (
                                    <div className="flex justify-center mt-2">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleSetDeadline(task, null)}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        Remove Deadline
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {droppableProvided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <div className="space-y-3">
          {sortedTasks.map((task) => (
            <div
              key={task.id}
              className={`p-3 rounded-lg border border-border transition-colors ${
                task.completed ? "bg-muted/40" : "bg-card"
              } hover:bg-muted/30 relative group`}
              onMouseEnter={() => setHoveredTask(task.id)}
              onMouseLeave={() => setHoveredTask(null)}
              onContextMenu={(e) => handleContextMenu(e, task.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                  checked={task.completed}
                  onCheckedChange={(checked) =>
                    onTaskUpdate({
                      ...task,
                      completed: checked,
                      completedDate: checked ? new Date().toISOString() : null,
                    })
                  }
                />
                <span
                  className={
                    task.completed ? "line-through text-slate-500" : ""
                  }
                >
                  {task.taskName}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {onEditTask && (
                  <button
                    onClick={() => onEditTask(task)}
                    className={`text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity md:block
                      ${hoveredTask === task.id ? "md:opacity-100" : ""}
                      ${isMobile ? "opacity-100" : ""}`}
                    aria-label="Edit task"
                    type="button"
                  >
                    <Pencil size={16} />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteClick(task.id)}
                  className={`text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity md:block
                    ${hoveredTask === task.id ? "md:opacity-100" : ""}
                    ${isMobile ? "opacity-100" : ""}`}
                  aria-label="Delete task"
                  type="button"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Task detail icons */}
            <div className="flex ml-6 mt-1 space-x-2 text-sm justify-end">
              {/* Updated Duration button */}
              <button
                onClick={() => handleOpenDurationDialog(task)}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                type="button"
              >
                <Clock size={14} />
                {task.duration ? `${task.duration} min` : "Add duration"}
              </button>

              {/* Deadline button */}
              <div className="relative">
                <button
                  onClick={() =>
                    setDatePickerOpen(
                      datePickerOpen === task.id ? null : task.id
                    )
                  }
                  className={`flex items-center gap-1 transition-colors ${
                    task.deadline
                      ? getTimeStatus(task.deadline)
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  type="button"
                >
                  <Calendar size={14} />
                  {task.deadline
                    ? new Date(task.deadline).toLocaleDateString()
                    : "Add deadline"}
                  {getDeadlineLabel(task.deadline) && (
                    <span
                      className={`ml-1 px-1.5 py-0 rounded text-xs font-medium ${
                        getDeadlineLabel(task.deadline) === "Overdue"
                          ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
                          : "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                      }`}
                    >
                      {getDeadlineLabel(task.deadline)}
                    </span>
                  )}
                </button>

                {datePickerOpen === task.id && (
                  <div
                    className={`
                      ${
                        isMobile
                          ? "fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                          : "absolute z-10"
                      }
                      `}
                    onClick={(e) => {
                      // Close when clicking the backdrop (only in mobile mode)
                      if (isMobile && e.target === e.currentTarget) {
                        setDatePickerOpen(null);
                      }
                      e.stopPropagation();
                    }}
                  >
                    <div
                      className={`
                      bg-white border shadow-md rounded-md p-3
                      ${
                        isMobile
                          ? "w-[320px] max-w-[90vw] m-4"
                          : "mt-1 w-[280px] transform -translate-x-1/4"
                      }
                    `}
                    >
                      <div
                        className={`${
                          isMobile
                            ? "flex justify-between items-center mb-2"
                            : "hidden"
                        }`}
                      >
                        <h4 className="font-semibold">Select Date</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDatePickerOpen(null)}
                          className="p-1 h-auto"
                        >
                          <X size={18} />
                        </Button>
                      </div>

                      <DatePicker
                        selected={
                          task.deadline ? new Date(task.deadline) : new Date()
                        }
                        onChange={(date) => handleSetDeadline(task, date)}
                        inline
                        onClickOutside={
                          !isMobile ? () => setDatePickerOpen(null) : undefined
                        }
                        calendarClassName="w-full max-w-[100%]"
                      />

                      {task.deadline && (
                        <div className="flex justify-center mt-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSetDeadline(task, null)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove Deadline
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 bg-white dark:bg-popover shadow-md rounded-md overflow-hidden border border-border"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          {onEditTask && (
            <div
              className="px-4 py-2 flex items-center gap-2 hover:bg-muted cursor-pointer"
              onClick={() => {
                const task = sortedTasks.find((t) => t.id === contextMenu.taskId);
                if (task) onEditTask(task);
                setContextMenu({ ...contextMenu, visible: false });
              }}
            >
              <Pencil size={16} className="text-muted-foreground" />
              <span>Edit Task</span>
            </div>
          )}
          <div
            className="px-4 py-2 flex items-center gap-2 hover:bg-muted cursor-pointer text-red-500"
            onClick={() => {
              onTaskDelete(contextMenu.taskId);
              setContextMenu({ ...contextMenu, visible: false });
            }}
          >
            <Trash2 size={16} />
            <span>Delete Task</span>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="text-red-500" size={20} />
              Delete Task
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTaskToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New Duration Input Dialog */}
      <Dialog
        open={isDurationDialogOpen}
        onOpenChange={setIsDurationDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Set Task Duration</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label
                htmlFor="duration"
                className="text-sm font-medium leading-none"
              >
                Duration (minutes)
              </label>
              <div className="relative">
                <input
                  id="duration"
                  type="text"
                  value={durationInput}
                  onChange={handleDurationInputChange}
                  className={`w-full p-2 border rounded-md ${
                    durationError ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter duration in minutes"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleDurationSubmit();
                    }
                  }}
                />
                {durationInput && (
                  <button
                    onClick={() => setDurationInput("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              {durationError && (
                <p className="text-xs text-red-500">{durationError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Enter the estimated time in minutes to complete this task.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDurationDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleDurationSubmit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
