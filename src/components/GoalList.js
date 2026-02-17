"use client";
import { useState, useCallback } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import GoalCard from "./GoalCard.js";
import { useIsMobile } from "@/hooks/useIsMobile.js";

export default function GoalList({ goals, onGoalsUpdate }) {
  const isMobile = useIsMobile();
  const [expandedGoalId, setExpandedGoalId] = useState(null);

  const handleGoalUpdate = useCallback(
    (updatedGoal) => {
      const updatedGoals = goals.map((g) =>
        g.id === updatedGoal.id ? updatedGoal : g
      );
      onGoalsUpdate(updatedGoals);
    },
    [goals, onGoalsUpdate]
  );

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(goals);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedGoals = items.map((goal, index) => ({
      ...goal,
      order: index + 1,
    }));

    onGoalsUpdate(updatedGoals);
  };

  const handleDeleteGoal = (goalId) => {
    const updatedGoals = goals.filter((goal) => goal.id !== goalId);
    onGoalsUpdate(updatedGoals);
  };

  // If we have an expanded goal on mobile, pass this to each card
  const handleGoalExpand = (goalId) => {
    setExpandedGoalId(goalId === expandedGoalId ? null : goalId);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable
        droppableId="goals"
        direction={isMobile ? "vertical" : "horizontal"}
      >
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`gap-4 items-start ${isMobile ? "flex flex-col" : "flex flex-row flex-wrap"
              }`}
          >
            {goals.map((goal, index) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                index={index}
                onUpdate={handleGoalUpdate}
                onDelete={handleDeleteGoal}
                isActiveOnMobile={expandedGoalId === goal.id}
                onMobileExpand={handleGoalExpand}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
