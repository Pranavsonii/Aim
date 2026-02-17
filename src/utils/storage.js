const STORAGE_KEY = "goals";

export const getGoals = () => {
  if (typeof window === "undefined") return Promise.resolve([]);
  const goals = localStorage.getItem(STORAGE_KEY);
  return Promise.resolve(goals ? JSON.parse(goals) : []);
};

export const saveGoals = (goals) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
};

export const createGoal = (goalName, goalDescription, currentLength) => ({
  id: `goal-${Date.now()}`,
  goalName,
  goalDescription,
  createdDate: new Date().toISOString(),
  completedDate: null,
  completed: false,
  order: (currentLength ?? 0) + 1,
  tasks: [],
  cardColor: null,
});

export const createTask = (taskName, duration, deadline, order) => ({
  id: `task-${Date.now()}`,
  taskName,
  duration,
  deadline,
  completed: false,
  createdDate: new Date().toISOString(),
  completedDate: null,
  order: typeof order === "number" ? order : 0,
});

export const addTaskToGoal = (goalId, task) => {
  const goals = getGoals();
  const updatedGoals = goals.map((goal) => {
    if (goal.id === goalId) {
      return {
        ...goal,
        tasks: [...goal.tasks, task],
      };
    }
    return goal;
  });
  saveGoals(updatedGoals);
  return updatedGoals;
};

const EXPORT_VERSION = 1;

export function exportGoals(goals) {
  const blob = JSON.stringify(
    { version: EXPORT_VERSION, exportedAt: new Date().toISOString(), goals },
    null,
    2
  );
  return blob;
}

function isValidGoalShape(goal) {
  return (
    goal &&
    typeof goal === "object" &&
    typeof goal.id === "string" &&
    typeof goal.goalName === "string" &&
    Array.isArray(goal.tasks)
  );
}

export function importGoalsFromJSON(jsonString) {
  let data;
  try {
    data = JSON.parse(jsonString);
  } catch {
    return { ok: false, error: "Invalid JSON" };
  }
  if (!data || !Array.isArray(data.goals)) {
    return { ok: false, error: "Missing or invalid goals array" };
  }
  const goals = data.goals.filter(isValidGoalShape).map((goal, idx) => ({
    id: goal.id?.startsWith("goal-") ? goal.id : `goal-${Date.now()}-${idx}-${Math.random().toString(36).slice(2)}`,
    goalName: String(goal.goalName ?? ""),
    goalDescription: String(goal.goalDescription ?? ""),
    createdDate: goal.createdDate || new Date().toISOString(),
    completedDate: goal.completedDate ?? null,
    completed: Boolean(goal.completed),
    order: typeof goal.order === "number" ? goal.order : 0,
    cardColor: goal.cardColor ?? null,
    tasks: Array.isArray(goal.tasks)
      ? goal.tasks.map((t, i) => ({
          id: t.id?.startsWith("task-") ? t.id : `task-${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`,
          taskName: String(t.taskName ?? t.name ?? ""),
          duration: t.duration != null ? String(t.duration) : "0",
          deadline: t.deadline ?? null,
          completed: Boolean(t.completed),
          createdDate: t.createdDate || new Date().toISOString(),
          completedDate: t.completedDate ?? null,
          order: typeof t.order === "number" ? t.order : i,
        }))
      : [],
  }));
  return { ok: true, goals };
}
