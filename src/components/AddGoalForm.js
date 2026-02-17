"use client";
import { useState, forwardRef, useImperativeHandle } from "react";
import { createGoal } from "../utils/storage.js";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.jsx";

const AddGoalForm = forwardRef(function AddGoalForm(
  { onGoalAdd, goalsCount = 0 },
  ref
) {
  const [open, setOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
  }));
  const [goalName, setGoalName] = useState("");
  const [goalDescription, setGoalDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const newGoal = createGoal(goalName, goalDescription, goalsCount);
    onGoalAdd(newGoal);
    setGoalName("");
    setGoalDescription("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-0">+ New Goal</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={goalName}
            onChange={(e) => setGoalName(e.target.value)}
            placeholder="Goal Name"
            required
          />

          <Textarea
            value={goalDescription}
            onChange={(e) => setGoalDescription(e.target.value)}
            placeholder="Goal Description (max 150 characters)"
            maxLength={150}
          />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Add Goal</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});

export default AddGoalForm;
