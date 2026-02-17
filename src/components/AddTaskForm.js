"use client";
import { useState, useEffect } from "react";
import { Button } from "./ui/button.jsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";

const defaultDuration = "30";

export default function AddTaskForm({ onSubmit, onCancel, initialTask }) {
  const [taskName, setTaskName] = useState(initialTask?.taskName ?? "");
  const [showDetails, setShowDetails] = useState(
    !!(initialTask && (Number(initialTask.duration) > 0 || initialTask.deadline))
  );
  const [duration, setDuration] = useState(
    initialTask?.duration != null ? String(initialTask.duration) : defaultDuration
  );
  const [deadline, setDeadline] = useState(
    initialTask?.deadline ? new Date(initialTask.deadline) : null
  );

  useEffect(() => {
    if (initialTask) {
      setTaskName(initialTask.taskName ?? "");
      setShowDetails(!!(Number(initialTask.duration) > 0 || initialTask.deadline));
      setDuration(initialTask.duration != null ? String(initialTask.duration) : defaultDuration);
      setDeadline(initialTask.deadline ? new Date(initialTask.deadline) : null);
    } else {
      setTaskName("");
      setShowDetails(false);
      setDuration(defaultDuration);
      setDeadline(null);
    }
  }, [initialTask]);

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Stop click from bubbling up to parent elements

    if (!taskName.trim()) return;

    const payload = {
      name: taskName.trim(),
      duration: showDetails ? duration : "0",
      deadline: showDetails && deadline ? deadline.toISOString() : null,
    };
    if (initialTask) payload.id = initialTask.id;
    onSubmit(payload);

    if (!initialTask) {
      setTaskName("");
      setDuration(defaultDuration);
      setDeadline(null);
      setShowDetails(false);
    }
  };

  // Add this function to handle cancel with proper event management
  const handleCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onCancel();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 mt-4"
      onClick={(e) => e.stopPropagation()} // Prevent card click events
      data-no-expand="true" // Custom attribute to identify form
    >
      <div>
        <input
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          placeholder="Task name"
          className="w-full p-2 border rounded-md"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {showDetails ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Duration (minutes)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full p-2 border rounded-md"
              min="1"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Deadline</label>
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <DatePicker
                selected={deadline}
                onChange={(date) => setDeadline(date)}
                dateFormat="MMMM d, yyyy"
                placeholderText="No deadline"
                className="w-full p-2 border rounded-md"
                customInput={
                  <div className="flex items-center justify-between border rounded-md p-2">
                    <span>
                      {deadline
                        ? deadline.toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "No deadline"}
                    </span>
                    <Calendar size={18} className="text-gray-500" />
                  </div>
                }
              />
            </div>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            setShowDetails(true);
          }}
        >
          Add details
        </Button>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit">{initialTask ? "Save" : "Add Task"}</Button>
      </div>
    </form>
  );
}
