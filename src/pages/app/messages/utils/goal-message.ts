export interface GoalCreatedEvent {
  goalId: number;
  title: string;
  creatorName: string;
}

const GOAL_CREATED_PREFIX = "[[goal_created]]";

export const serializeGoalCreatedEvent = (
  payload: GoalCreatedEvent,
): string => {
  return `${GOAL_CREATED_PREFIX}${JSON.stringify(payload)}`;
};

export const parseGoalCreatedEvent = (
  value: string | null | undefined,
): GoalCreatedEvent | null => {
  if (!value || !value.startsWith(GOAL_CREATED_PREFIX)) return null;

  const raw = value.slice(GOAL_CREATED_PREFIX.length);
  try {
    const parsed = JSON.parse(raw) as Partial<GoalCreatedEvent>;
    if (
      typeof parsed.goalId === "number" &&
      Number.isFinite(parsed.goalId) &&
      typeof parsed.title === "string" &&
      typeof parsed.creatorName === "string"
    ) {
      return {
        goalId: parsed.goalId,
        title: parsed.title,
        creatorName: parsed.creatorName,
      };
    }
  } catch {
    return null;
  }

  return null;
};
