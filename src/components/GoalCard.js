"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { useIsMobile } from "@/hooks/useIsMobile.js";
import {
  Pencil,
  CircleX,
  CheckCheck,
  CircleCheckBig,
  Grip,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Palette,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.jsx";

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

import TaskList from "./TaskList.js";
import AddTaskForm from "./AddTaskForm.js";
import ProgressBar from "./ProgressBar.js";
import Confetti from "./Confetti.js";
import { createTask } from "../utils/storage.js";

const CARD_COLORS = [
  { id: "pink", cardBg: "bg-pink-100 dark:bg-pink-950/50", cardBorder: "border-pink-300 dark:border-pink-700", circle: "bg-pink-400" },
  { id: "mint", cardBg: "bg-emerald-100 dark:bg-emerald-950/50", cardBorder: "border-emerald-300 dark:border-emerald-700", circle: "bg-emerald-400" },
  { id: "lavender", cardBg: "bg-violet-100 dark:bg-violet-950/50", cardBorder: "border-violet-300 dark:border-violet-700", circle: "bg-violet-400" },
  { id: "peach", cardBg: "bg-orange-100 dark:bg-orange-950/50", cardBorder: "border-orange-300 dark:border-orange-700", circle: "bg-orange-400" },
  { id: "sky", cardBg: "bg-sky-100 dark:bg-sky-950/50", cardBorder: "border-sky-300 dark:border-sky-700", circle: "bg-sky-400" },
  { id: "sage", cardBg: "bg-teal-100 dark:bg-teal-950/50", cardBorder: "border-teal-300 dark:border-teal-700", circle: "bg-teal-400" },
];

export default function GoalCard({ goal, index, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [editedGoalName, setEditedGoalName] = useState(goal.goalName);
  const [editedGoalDescription, setEditedGoalDescription] = useState(
    goal.goalDescription
  );
  const [lastCompletedTaskCount, setLastCompletedTaskCount] = useState(
    goal.completed ? goal.tasks.filter((task) => task.completed).length : 0
  );
  const [isGoalCompleted, setIsGoalCompleted] = useState(goal.completed);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
  });
  const contextMenuRef = useRef(null);
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showCompleteAllTasksMessage, setShowCompleteAllTasksMessage] =
    useState(false);
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
  const colorDropdownRef = useRef(null);

  // Auto-hide "complete all tasks" message after 4 seconds
  useEffect(() => {
    if (!showCompleteAllTasksMessage) return;
    const timer = setTimeout(() => setShowCompleteAllTasksMessage(false), 4000);
    return () => clearTimeout(timer);
  }, [showCompleteAllTasksMessage]);

  // Check if there are changes in task completion status since the goal was marked complete
  const hasTaskChanges = () => {
    if (!goal.completed) return true;

    const currentCompletedCount = goal.tasks.filter(
      (task) => task.completed
    ).length;
    return (
      currentCompletedCount !== lastCompletedTaskCount ||
      goal.tasks.some((task) => !task.completed)
    );
  };

  // Update lastCompletedTaskCount when goal completion status changes
  useEffect(() => {
    if (goal.completed) {
      setLastCompletedTaskCount(
        goal.tasks.filter((task) => task.completed).length
      );
      setIsGoalCompleted(true);
    } else {
      setIsGoalCompleted(false);
    }
  }, [goal.completed]);

  // Reset goal completion status if tasks change
  useEffect(() => {
    if (goal.completed && hasTaskChanges()) {
      setIsGoalCompleted(false);
      // Automatically update the goal status in the parent component
      onUpdate({
        ...goal,
        completed: false,
        completedDate: null,
      });
    }
  }, [goal.tasks]);

  const progress = useMemo(() => {
    if (!goal.tasks.length) return 0;
    const completedTasks = goal.tasks.filter((task) => task.completed).length;
    return (completedTasks / goal.tasks.length) * 100;
  }, [goal.tasks]);

  const durations = useMemo(() => {
    const totalDuration = goal.tasks.reduce(
      (sum, task) => sum + parseInt(task.duration || 0, 10),
      0
    );
    const completedDuration = goal.tasks
      .filter((task) => task.completed)
      .reduce((sum, task) => sum + parseInt(task.duration || 0, 10), 0);
    const remainingDuration = totalDuration - completedDuration;
    return {
      total: totalDuration,
      completed: completedDuration,
      remaining: remainingDuration,
    };
  }, [goal.tasks]);

  const handleTaskAdd = (taskData) => {
    const newTask = createTask(
      taskData.name,
      taskData.duration,
      taskData.deadline,
      goal.tasks.length
    );
    onUpdate({
      ...goal,
      tasks: [...goal.tasks, newTask],
    });
    setShowAddTask(false);
  };

  const handleTaskUpdate = (taskData) => {
    const updatedTasks = goal.tasks.map((task) =>
      task.id === taskData.id
        ? {
            ...task,
            taskName: taskData.name,
            duration: taskData.duration,
            deadline: taskData.deadline,
          }
        : task
    );
    onUpdate({ ...goal, tasks: updatedTasks });
    setTaskToEdit(null);
  };

  const handleTaskDelete = (taskId) => {
    const updatedTasks = goal.tasks.filter((task) => task.id !== taskId);
    onUpdate({
      ...goal,
      tasks: updatedTasks,
    });
  };

  const handleComplete = () => {
    // Check if all tasks are completed before allowing the goal to be marked as complete
    const allTasksCompleted =
      goal.tasks.length > 0 && goal.tasks.every((task) => task.completed);

    // If trying to complete goal but not all tasks are done, show inline message
    if (!goal.completed && !allTasksCompleted) {
      setShowCompleteAllTasksMessage(true);
      return;
    }

    if (!goal.completed) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
    onUpdate({
      ...goal,
      completed: !goal.completed,
      completedDate: !goal.completed ? new Date().toISOString() : null,
    });
  };

  const handleSaveEdit = () => {
    onUpdate({
      ...goal,
      goalName: editedGoalName,
      goalDescription: editedGoalDescription,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    // Reset form values to original goal values
    setEditedGoalName(goal.goalName);
    setEditedGoalDescription(goal.goalDescription);
    setIsEditing(false);
  };

  // Determine if the complete button should be disabled
  const isCompleteButtonDisabled = goal.completed && !hasTaskChanges();

  // Handle right-click on goal card
  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.pageX,
      y: e.pageY,
    });
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

    // Handle ESC key to close menu
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        setContextMenu({ ...contextMenu, visible: false });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [contextMenu]);

  useEffect(() => {
    if (!colorDropdownOpen) return;
    const handleClickOutside = (e) => {
      if (colorDropdownRef.current && !colorDropdownRef.current.contains(e.target)) {
        setColorDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [colorDropdownOpen]);

  // Toggle expand for mobile card
  const handleExpandToggle = useCallback(
    (e) => {
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }

      setIsExpanded((prev) => !prev);

      // Toggle body scroll locking
      if (!isExpanded) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    },
    [isExpanded]
  );

  // Clean up scroll lock when component unmounts
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    onDelete(goal.id);
    setIsDeleteDialogOpen(false);
  };

  const selectedColorStyle = goal.cardColor
    ? CARD_COLORS.find((c) => c.id === goal.cardColor)
    : null;

  // Render the goal card
  return (
    <Draggable draggableId={goal.id} index={index}>
      {(provided) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`w-full md:w-[380px] transition-shadow ${isMobile && isExpanded
            ? "fixed top-0 left-0 right-0 bottom-0 z-50 h-full overflow-auto"
            : ""
            } ${!isMobile ? "md:hover:shadow-lg" : ""} ${goal.completed
              ? "border-l-4 border-l-green-500 dark:border-l-green-600 bg-green-500/5 dark:bg-green-500/10"
              : ""
            } ${selectedColorStyle && !goal.completed
              ? `${selectedColorStyle.cardBg} ${selectedColorStyle.cardBorder}`
              : ""
            }`}
          style={{
            ...provided.draggableProps.style,
            height: isMobile && !isExpanded ? "auto" : undefined,
          }}
          onContextMenu={handleContextMenu}
        >
          {showConfetti && <Confetti />}
          <CardHeader>
            <div className="flex justify-between flex-col align">
              <div className="flex gap-2 mb-4 align-center justify-between">
                <div className="flex gap-1">
                  {/* Edit button - show only on desktop OR when mobile card is expanded */}
                  {(!isMobile || (isMobile && isExpanded)) && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className={"me-1"}
                            onClick={() => setIsEditing(!isEditing)}
                          >
                            {isEditing ? <CircleX /> : <Pencil />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit Goal</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  {/* Mark complete button - remains visible on both mobile and desktop */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleComplete}
                          className={isGoalCompleted ? "text-green-500" : ""}
                          disabled={isCompleteButtonDisabled}
                        >
                          {isGoalCompleted ? (
                            <CheckCheck />
                          ) : (
                            <CircleCheckBig />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isGoalCompleted ? (
                          <p>Completed</p>
                        ) : (
                          <p>Mark as complete</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Delete button - remains visible on both mobile and desktop */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 ms-1"
                          onClick={handleDeleteClick}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete Goal</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Card color dropdown */}
                  <div className="relative ms-1" ref={colorDropdownRef}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-muted-foreground"
                            onClick={() => setColorDropdownOpen((o) => !o)}
                            aria-label="Card color"
                            aria-expanded={colorDropdownOpen}
                          >
                            <Palette size={18} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Card color</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {colorDropdownOpen && (
                      <div
                        className="absolute left-0 top-full mt-1 z-20 rounded-lg border border-border bg-popover p-2 shadow-md"
                        role="menu"
                      >
                        <p className="text-xs text-muted-foreground mb-2 px-1">Color</p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            role="menuitem"
                            className={`size-8 rounded-full border-2 bg-card transition-transform hover:scale-110 ${!goal.cardColor
                              ? "border-foreground ring-2 ring-offset-2 ring-offset-popover ring-foreground/30"
                              : "border-border hover:border-foreground/50"
                              }`}
                            onClick={() => {
                              onUpdate({ ...goal, cardColor: null });
                              setColorDropdownOpen(false);
                            }}
                            aria-label="Default color"
                          />
                          {CARD_COLORS.map((color) => (
                            <button
                              key={color.id}
                              type="button"
                              role="menuitem"
                              className={`size-8 rounded-full border-2 transition-transform hover:scale-110 ${goal.cardColor === color.id
                                ? "border-foreground ring-2 ring-offset-2 ring-offset-popover ring-foreground/30"
                                : "border-transparent hover:border-foreground/50"
                                } ${color.circle}`}
                              onClick={() => {
                                onUpdate({ ...goal, cardColor: color.id });
                                setColorDropdownOpen(false);
                              }}
                              aria-label={`Set color ${color.id}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  {/* Drag handle */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          {...provided.dragHandleProps}
                          className="cursor-grab active:cursor-grabbing flex items-center"
                        >
                          <Grip />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Drag Goals</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {showCompleteAllTasksMessage && (
                <div
                  className="flex items-center justify-between gap-2 mt-2 px-2 py-1.5 rounded-md bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 text-sm"
                  role="status"
                >
                  <span>Complete all tasks before marking the goal as complete.</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto py-0.5 px-1 text-amber-700 dark:text-amber-300"
                    onClick={() => setShowCompleteAllTasksMessage(false)}
                    aria-label="Dismiss"
                  >
                    <CircleX size={16} />
                  </Button>
                </div>
              )}

              {isEditing ? (
                <div className="mb-4 space-y-2">
                  <input
                    type="text"
                    value={editedGoalName}
                    onChange={(e) => setEditedGoalName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Goal name"
                  />
                  <textarea
                    value={editedGoalDescription}
                    onChange={(e) => setEditedGoalDescription(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Goal description"
                    rows="3"
                  ></textarea>
                  <Button onClick={handleSaveEdit} className="mr-2">
                    Save
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <CardTitle className="text-lg">{goal.goalName}</CardTitle>
                  <CardDescription className="break-words">
                    {goal.goalDescription}
                  </CardDescription>
                </>
              )}

              {/* Always show progress bar, even on mobile */}
              <div className={`mt-4 ${isMobile && !isExpanded ? "mb-0" : ""}`}>
                <ProgressBar
                  progress={progress}
                  durations={durations}
                />

                {/* Add expand button below progress bar on mobile */}
                {isMobile && !isExpanded && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExpandToggle}
                    className="w-full mt-2 text-gray-500 hover:text-gray-700"
                    aria-label={isExpanded ? "Collapse card" : "Expand card"}
                  >
                    <div className="flex items-center justify-center w-full">
                      <span className="mr-1">View Details</span>
                      <ChevronDown size={18} />
                    </div>
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          {/* Only show tasks and add task button if not mobile or expanded */}
          {(!isMobile || isExpanded) && (
            <CardContent>
              <TaskList
                tasks={goal.tasks}
                onTaskUpdate={(updatedTask) => {
                  const updatedTasks = goal.tasks.map((task) =>
                    task.id === updatedTask.id ? updatedTask : task
                  );
                  onUpdate({ ...goal, tasks: updatedTasks });
                }}
                onTaskDelete={handleTaskDelete}
                onTasksReorder={(newTasks) =>
                  onUpdate({ ...goal, tasks: newTasks })
                }
                onEditTask={setTaskToEdit}
              />
              {showAddTask || taskToEdit ? (
                <AddTaskForm
                  key={taskToEdit?.id ?? "add"}
                  initialTask={taskToEdit}
                  onSubmit={(data) => {
                    if (data.id) {
                      handleTaskUpdate(data);
                    } else {
                      handleTaskAdd(data);
                      setShowAddTask(false);
                    }
                  }}
                  onCancel={() => {
                    setTaskToEdit(null);
                    setShowAddTask(false);
                  }}
                />
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation(); // This is critical
                    setShowAddTask(true);
                  }}
                  className="mt-4"
                >
                  + Add Task
                </Button>
              )}

              {/* Close button for mobile expanded view */}
              {isMobile && isExpanded && (
                <Button
                  variant="secondary"
                  className="w-full mt-4"
                  onClick={handleExpandToggle}
                >
                  Close
                </Button>
              )}
            </CardContent>
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
                  Delete Goal
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this goal and all associated
                  tasks? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDelete}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Card>
      )}
    </Draggable>
  );
}
