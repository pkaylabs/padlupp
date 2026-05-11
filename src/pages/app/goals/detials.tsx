import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  MoreVertical,
  Calendar,
  Plus,
  Clock,
  Circle,
  ArrowLeft,
  CheckCircle2,
  ListTodo,
  Activity,
  AlertCircle,
  Pencil,
  Trash2,
  Square,
  CheckSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cs";
import { format, parseISO, startOfToday } from "date-fns";
import { CalendarWidget } from "../dashboard/components/calendar-widget";
import Button from "@/components/core/buttons";
import { useGoal } from "./hooks/useGoal";
import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUpdateTask,
} from "./hooks/useTasks";
import { useUpdateGoal } from "./hooks/useUpdateGoal";
import { useDeleteGoal } from "./hooks/useDeleteGoal";
import { Modal } from "@/components/core/modal";
import { toast } from "sonner";
import { CORE_CATEGORIES, normalizeCategory } from "@/constants/categories";
import { GoalActionsMenu } from "./components/goal-actions-menu";
import { ShareGoalModal } from "./components/share-goal-modal";
import { useShareGoalInvites } from "./hooks/useShareGoal";
import { CHECKIN_FREQUENCIES } from "./api";
import type { CheckinFrequency } from "./api";

export function GoalDetailsPage() {
  const { id } = useParams({ from: "/_app/goals/$id" });
  const navigate = useNavigate();

  const normalizeStatusForApi = (status: string) => {
    if (status === "In progress" || status === "in-progress") {
      return "in-progress";
    }
    if (status === "Completed" || status === "completed") {
      return "completed";
    }
    return "planned";
  };

  const normalizeStatusForUi = (status: string) => {
    if (status === "in-progress" || status === "In progress") {
      return "In progress";
    }
    if (status === "completed" || status === "Completed") {
      return "Completed";
    }
    return "To-do";
  };

  // UI State
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [isAddSubtaskModalOpen, setIsAddSubtaskModalOpen] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [isEditGoalModalOpen, setIsEditGoalModalOpen] = useState(false);
  const [isDeleteGoalModalOpen, setIsDeleteGoalModalOpen] = useState(false);
  const [isShareGoalModalOpen, setIsShareGoalModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState("");
  const [pendingTaskIds, setPendingTaskIds] = useState<number[]>([]);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editTargetDate, setEditTargetDate] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editStatus, setEditStatus] = useState("To-do");
  const [editImportance, setEditImportance] = useState("Regular");
  const [editCategory, setEditCategory] = useState("Career");
  const [editCheckinFrequency, setEditCheckinFrequency] =
    useState<CheckinFrequency>("DAILY");
  const [editIsPublic, setEditIsPublic] = useState(false);
  const [shareLinkDraft, setShareLinkDraft] = useState<string>("");

  const actionsMenuRef = useRef<HTMLDivElement>(null);

  // Data Fetching
  const { data: goal, isLoading: loadingGoal, isError } = useGoal(id);
  const { data: tasksData, isLoading: loadingTasks } = useTasks({
    ordering: "created_at",
  });

  // Mutations
  const {
    mutate: updateGoal,
    mutateAsync: updateGoalAsync,
    isPending: isUpdatingGoal,
  } = useUpdateGoal();
  const { mutateAsync: deleteGoal, isPending: isDeletingGoal } =
    useDeleteGoal();
  const { mutateAsync: shareGoalInvites, isPending: isSharingGoal } =
    useShareGoalInvites();
  const { mutateAsync: createTask, isPending: isCreatingTask } =
    useCreateTask();
  const { mutateAsync: updateTask } = useUpdateTask();
  const { mutateAsync: deleteTask } = useDeleteTask();

  useEffect(() => {
    if (!goal) return;

    setEditTitle(goal.title || "");
    setEditDescription(goal.description || "");
    setEditStartDate(goal.start_date ? goal.start_date.split("T")[0] : "");
    setEditTargetDate(goal.target_date ? goal.target_date.split("T")[0] : "");
    setEditStartTime(goal.start_time?.slice(0, 5) || "");
    setEditStatus(normalizeStatusForUi(goal.status));
    setEditImportance(goal.importance?.trim() || "Regular");
    setEditCategory(normalizeCategory(goal.category));
    setEditCheckinFrequency(goal.checkin_frequency || "DAILY");
    setEditIsPublic(Boolean(goal.is_public));
  }, [goal]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isActionsMenuOpen &&
        actionsMenuRef.current &&
        !actionsMenuRef.current.contains(event.target as Node)
      ) {
        setIsActionsMenuOpen(false);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsActionsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isActionsMenuOpen]);

  // Filter tasks for this goal
  const goalSubtasks =
    tasksData?.results.filter((t) => t.goal === Number(id)) || [];

  // --- Handlers ---

  const handleStatusChange = (newStatus: string) => {
    updateGoal({
      id: goal!.id,
      data: { status: normalizeStatusForApi(newStatus) },
    });
    setStatusPopoverOpen(false);
  };

  const handleOpenEditGoalModal = () => {
    setIsActionsMenuOpen(false);
    setIsEditGoalModalOpen(true);
  };

  const handleOpenShareGoalModal = () => {
    setIsActionsMenuOpen(false);
    setIsShareGoalModalOpen(true);
  };

  const handleCloseEditGoalModal = () => {
    if (isUpdatingGoal) return;
    setIsEditGoalModalOpen(false);
  };

  const handleSaveGoalUpdates = async () => {
    if (!goal) return;

    const title = editTitle.trim();
    const description = editDescription.trim();
    const category = normalizeCategory(editCategory);
    const importance = editImportance.trim();
    const normalizedStatus = normalizeStatusForApi(editStatus);

    if (!title) {
      toast.error("Title is required.");
      return;
    }

    if (!editStartDate) {
      toast.error("Start date is required.");
      return;
    }

    if (!editTargetDate) {
      toast.error("Target date is required.");
      return;
    }

    if (!normalizedStatus) {
      toast.error("Status is required.");
      return;
    }

    if (!importance) {
      toast.error("Importance is required.");
      return;
    }

    if (!category) {
      toast.error("Category is required.");
      return;
    }

    await updateGoalAsync({
      id: goal.id,
      data: {
        title,
        description,
        start_date: editStartDate,
        target_date: editTargetDate,
        start_time: editStartTime || null,
        status: normalizedStatus,
        importance,
        category,
        checkin_frequency: editCheckinFrequency,
        is_public: editIsPublic,
      },
    });

    setIsEditGoalModalOpen(false);
  };

  const handleDeleteGoal = async () => {
    if (!goal) return;
    await deleteGoal(goal.id);
    setIsDeleteGoalModalOpen(false);
    void navigate({ to: "/goals" });
  };

  const handleShareGoalInvites = async (payload: {
    emails: string[];
    message?: string;
  }) => {
    if (!goal) return;

    const response = await shareGoalInvites({
      goalId: goal.id,
      payload,
    });
    const maybeLink =
      response.public_share_link ||
      response.share_link ||
      response.invite_link ||
      "";
    if (maybeLink) {
      setShareLinkDraft(maybeLink);
    }
  };

  const handleAddSubtask = () => {
    setIsAddSubtaskModalOpen(true);
  };

  const handleCloseAddSubtaskModal = () => {
    if (isCreatingTask) return;
    setIsAddSubtaskModalOpen(false);
    setNewSubtaskTitle("");
  };

  const handleCreateSubtask = async () => {
    const title = newSubtaskTitle.trim();
    if (!title || !goal) return;

    await createTask({
      goal: goal.id,
      title,
      status: "planned",
      due_at: new Date().toISOString(),
    });

    setIsAddSubtaskModalOpen(false);
    setNewSubtaskTitle("");
  };

  const isTaskCompleted = (task: { completed?: boolean; status?: string }) => {
    if (typeof task.completed === "boolean") {
      return task.completed;
    }
    return task.status === "completed";
  };

  const setTaskPending = (taskId: number, pending: boolean) => {
    setPendingTaskIds((prev) => {
      if (pending) {
        if (prev.includes(taskId)) return prev;
        return [...prev, taskId];
      }
      return prev.filter((idValue) => idValue !== taskId);
    });
  };

  const handleToggleTaskCompleted = async (task: {
    id: number;
    completed?: boolean;
    status?: string;
  }) => {
    if (pendingTaskIds.includes(task.id)) return;
    setTaskPending(task.id, true);
    try {
      await updateTask({
        id: task.id,
        data: { completed: !isTaskCompleted(task) },
      });
    } finally {
      setTaskPending(task.id, false);
    }
  };

  const handleStartTaskEdit = (task: { id: number; title: string }) => {
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title || "");
  };

  const handleCancelTaskEdit = () => {
    setEditingTaskId(null);
    setEditingTaskTitle("");
  };

  const handleSaveTaskEdit = async (taskId: number) => {
    const title = editingTaskTitle.trim();
    if (!title) {
      toast.error("Subtask title is required.");
      return;
    }
    if (pendingTaskIds.includes(taskId)) return;

    setTaskPending(taskId, true);
    try {
      await updateTask({
        id: taskId,
        data: { title },
      });
      setEditingTaskId(null);
      setEditingTaskTitle("");
    } finally {
      setTaskPending(taskId, false);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (pendingTaskIds.includes(taskId)) return;
    setTaskPending(taskId, true);
    try {
      await deleteTask(taskId);
      if (editingTaskId === taskId) {
        setEditingTaskId(null);
        setEditingTaskTitle("");
      }
    } finally {
      setTaskPending(taskId, false);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U";

  const openProfileFromIndicator = (profile: {
    id?: number | null;
    name?: string | null;
    avatar?: string | null;
  }) => {
    if (!profile.id) return;
    void navigate({
      to: "/users/$userId",
      params: { userId: String(profile.id) },
      search: {
        name: profile.name?.trim() || undefined,
        avatar: profile.avatar?.trim() || undefined,
      },
    });
  };

  const creatorIndicator = {
    id: goal?.user?.id ?? null,
    name: goal?.user?.name || "Goal creator",
    avatar: goal?.user?.avatar || "",
  };
  const partnerIndicator =
    goal?.partner || goal?.partner_name || goal?.partner_avatar
      ? {
          id: goal?.partner?.id ?? null,
          name: goal?.partner?.name || goal?.partner_name || "Shared partner",
          avatar: goal?.partner?.avatar || goal?.partner_avatar || "",
        }
      : null;

  // --- LOADING STATE (SKELETON) ---
  if (loadingGoal) {
    return (
      <div className="font-monts flex h-screen bg-white dark:bg-slate-950">
        <div className="flex-1 p-8 max-w-4xl mx-auto space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-full animate-pulse" />
            <div className="h-8 w-64 bg-gray-100 dark:bg-slate-800 rounded-lg animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-4 w-full bg-gray-100 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-gray-100 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-4 w-4/6 bg-gray-100 dark:bg-slate-800 rounded animate-pulse" />
          </div>
          <div className="h-24 w-full bg-gray-50 dark:bg-slate-900 rounded-xl animate-pulse" />
        </div>
        <div className="hidden lg:block w-96 border-l border-gray-200 dark:border-slate-800" />
      </div>
    );
  }

  // --- ERROR STATE ---
  if (isError || !goal) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
          Goal not found
        </h2>
        <p className="text-gray-500 dark:text-slate-400 mb-6">
          This goal may have been deleted or does not exist.
        </p>
        <Link to="/goals">
          <Button variant="primary">Back to Goals</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="font-monts flex h-screen overflow-hidden bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100">
      {/* Scrollable Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/goals"
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-600 dark:text-slate-300 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => openProfileFromIndicator(creatorIndicator)}
                title={creatorIndicator.name}
                aria-label={`Open ${creatorIndicator.name}'s profile`}
                className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                {creatorIndicator.avatar ? (
                  <img
                    src={creatorIndicator.avatar}
                    alt={creatorIndicator.name}
                    className="w-8 h-8 rounded-full border border-white dark:border-slate-700 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-white dark:border-slate-700 flex items-center justify-center text-[11px] font-semibold">
                    {getInitials(creatorIndicator.name)}
                  </div>
                )}
              </button>
              {partnerIndicator && (
                <button
                  type="button"
                  onClick={() => openProfileFromIndicator(partnerIndicator)}
                  title={partnerIndicator.name}
                  aria-label={`Open ${partnerIndicator.name}'s profile`}
                  className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={!partnerIndicator.id}
                >
                  {partnerIndicator.avatar ? (
                    <img
                      src={partnerIndicator.avatar}
                      alt={partnerIndicator.name}
                      className="w-8 h-8 rounded-full border border-white dark:border-slate-700 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-white dark:border-slate-700 flex items-center justify-center text-[11px] font-semibold">
                      {getInitials(partnerIndicator.name)}
                    </div>
                  )}
                </button>
              )}
            </div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-slate-100 truncate max-w-md">
              {goal.title}
            </h1>
          </div>
          <div className="relative" ref={actionsMenuRef}>
            <button
              type="button"
              aria-label="Goal actions"
              onClick={() => setIsActionsMenuOpen((prev) => !prev)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-500 dark:text-slate-400 transition-colors"
            >
              <MoreVertical size={20} />
            </button>

            <GoalActionsMenu
              isOpen={isActionsMenuOpen}
              onEdit={handleOpenEditGoalModal}
              onShare={handleOpenShareGoalModal}
              onDelete={() => {
                setIsActionsMenuOpen(false);
                setIsDeleteGoalModalOpen(true);
              }}
            />
          </div>
        </header>

        <div className="px-4 py-8 sm:p-8 max-w-4xl mx-auto w-full pb-20">
          {/* Progress Section (Mocked for now) */}
          <div className="mb-10 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 p-6 rounded-2xl border border-blue-100 dark:border-slate-700">
            <div className="flex justify-between items-end mb-3">
              <div>
                <span className="block text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
                  Progress
                </span>
                <span className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                  {goal.status === "completed" ? "100%" : "In Progress"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-500 dark:text-slate-400 font-medium">
                  Target Date
                </span>
                <div className="flex items-center gap-1.5 text-gray-800 dark:text-slate-200 mt-1">
                  <Calendar size={16} className="text-blue-500" />
                  <span className="font-semibold">
                    {format(parseISO(goal.target_date), "MMM do, yyyy")}
                  </span>
                </div>
              </div>
            </div>

            <div className="h-2.5 w-full bg-white/50 dark:bg-slate-700/70 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  goal.status === "completed"
                    ? "bg-green-500 w-full"
                    : "bg-blue-500 w-[25%]",
                )}
              />
            </div>
          </div>

          {/* Description */}
          <div className="mb-10">
            <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              Description
            </h3>
            <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
              <p
                className={cn(
                  "text-gray-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap",
                  !isDescExpanded && "line-clamp-3",
                )}
              >
                {goal.description || "No description provided for this goal."}
              </p>
              {goal.description && goal.description.length > 150 && (
                <button
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  className="text-blue-600 text-xs font-semibold mt-3 hover:underline flex items-center gap-1"
                >
                  {isDescExpanded ? "Show less" : "Read more"}
                </button>
              )}
            </div>
          </div>

          {/* Subtasks Section */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                Subtasks{" "}
                <span className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-xs">
                  {goalSubtasks.length}
                </span>
              </h3>
              <button
                onClick={handleAddSubtask}
                disabled={isCreatingTask}
                className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Plus size={16} />
                {isCreatingTask ? "Adding..." : "Add Subtask"}
              </button>
            </div>

            <div className="space-y-3">
              {loadingTasks ? (
                // Subtask Skeleton
                [1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-50 dark:bg-slate-800 rounded-xl animate-pulse"
                  />
                ))
              ) : goalSubtasks.length === 0 ? (
                // --- EMPTY STATE FOR SUBTASKS ---
                <div className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-gray-50/50 dark:bg-slate-900/50">
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full shadow-sm flex items-center justify-center mb-3">
                    <ListTodo
                      className="text-gray-400 dark:text-slate-500"
                      size={24}
                    />
                  </div>
                  <p className="text-gray-900 dark:text-slate-100 font-medium text-sm">
                    No subtasks yet
                  </p>
                  <p className="text-gray-500 dark:text-slate-400 text-xs mt-1 max-w-xs">
                    Break this goal down into smaller, manageable steps to track
                    your progress better.
                  </p>
                  <button
                    onClick={handleAddSubtask}
                    className="mt-4 text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Create first task
                  </button>
                </div>
              ) : (
                goalSubtasks.map((task) => (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={task.id}
                    className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group flex items-start gap-3"
                  >
                    <button
                      type="button"
                      aria-label={
                        isTaskCompleted(task)
                          ? "Mark subtask as incomplete"
                          : "Mark subtask as complete"
                      }
                      onClick={() => void handleToggleTaskCompleted(task)}
                      disabled={pendingTaskIds.includes(task.id)}
                      className={cn(
                        "mt-0.5 transition-colors",
                        pendingTaskIds.includes(task.id)
                          ? "opacity-50 cursor-not-allowed"
                          : "text-gray-300 dark:text-slate-500 hover:text-blue-500",
                      )}
                    >
                      {isTaskCompleted(task) ? (
                        <CheckCircle2 size={20} className="text-green-500" />
                      ) : (
                        <Circle size={20} />
                      )}
                    </button>
                    <div className="flex-1">
                      {editingTaskId === task.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            autoFocus
                            value={editingTaskTitle}
                            onChange={(event) =>
                              setEditingTaskTitle(event.target.value)
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                void handleSaveTaskEdit(task.id);
                              }
                              if (event.key === "Escape") {
                                event.preventDefault();
                                handleCancelTaskEdit();
                              }
                            }}
                            className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-sm text-gray-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => void handleSaveTaskEdit(task.id)}
                              disabled={
                                pendingTaskIds.includes(task.id) ||
                                !editingTaskTitle.trim()
                              }
                              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-primary-500 text-white disabled:opacity-60"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelTaskEdit}
                              disabled={pendingTaskIds.includes(task.id)}
                              className="px-2.5 py-1 text-xs font-medium rounded-md border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 disabled:opacity-60"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p
                          className={cn(
                            "text-sm text-gray-800 dark:text-slate-200 font-medium",
                            isTaskCompleted(task) &&
                              "text-gray-400 dark:text-slate-500 line-through",
                          )}
                        >
                          {task.title}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-slate-500 mt-1.5">
                        {task.due_at && (
                          <div className="flex items-center gap-1">
                            <Clock size={12} />{" "}
                            {format(parseISO(task.due_at), "MMM d, p")}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label="Edit subtask"
                        onClick={() => handleStartTaskEdit(task)}
                        disabled={pendingTaskIds.includes(task.id)}
                        className="p-1.5 rounded-md text-gray-400 dark:text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 disabled:opacity-50"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        aria-label="Delete subtask"
                        onClick={() => void handleDeleteTask(task.id)}
                        disabled={pendingTaskIds.includes(task.id)}
                        className="p-1.5 rounded-md text-gray-400 dark:text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Status Actions */}
          <div className="flex items-center gap-4 mb-12">
            <div className="relative">
              <button
                onClick={() => setStatusPopoverOpen(!statusPopoverOpen)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors",
                  goal.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : goal.status === "in-progress"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300",
                )}
              >
                {goal.status === "completed" ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <Circle size={16} />
                )}
                <span className="capitalize">
                  {goal.status.replace("-", " ")}
                </span>
              </button>

              <AnimatePresence>
                {statusPopoverOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 p-1.5 z-30"
                  >
                    {["To-do", "In progress", "Completed"].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            status === "To-do"
                              ? "bg-gray-400"
                              : status === "In progress"
                                ? "bg-orange-500"
                                : "bg-green-500",
                          )}
                        />
                        {status}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Activity Log (Placeholder with Empty State) */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              Activity History
            </h4>

            {/* --- EMPTY STATE FOR ACTIVITIES --- */}
            <div className="bg-gray-50 dark:bg-slate-900 rounded-xl p-6 text-center border border-transparent dark:border-slate-800">
              <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full mx-auto flex items-center justify-center mb-2 shadow-sm">
                <Activity
                  size={18}
                  className="text-gray-400 dark:text-slate-500"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                No recent activity recorded for this goal.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Sidebar */}
      <div className="hidden lg:block w-96 border-l border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-4">
        <CalendarWidget
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
      </div>

      <Modal
        isOpen={isAddSubtaskModalOpen}
        onClose={handleCloseAddSubtaskModal}
        showCloseButton
        className="top-1/2 -translate-y-1/2 w-[92vw] sm:w-[480px] p-6"
      >
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              Add subtask
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              Add a clear, actionable subtask for this goal.
            </p>
          </div>

          <div>
            <label
              htmlFor="subtask-title"
              className="text-sm font-medium text-gray-700 dark:text-slate-300"
            >
              Subtask title
            </label>
            <input
              id="subtask-title"
              type="text"
              autoFocus
              value={newSubtaskTitle}
              onChange={(event) => setNewSubtaskTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleCreateSubtask();
                }
              }}
              placeholder="e.g. Draft project outline"
              className="mt-2 w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-gray-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleCloseAddSubtaskModal}
              disabled={isCreatingTask}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleCreateSubtask()}
              disabled={!newSubtaskTitle.trim() || isCreatingTask}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary-500 text-white hover:opacity-90 disabled:opacity-60"
            >
              {isCreatingTask ? "Adding..." : "Add Subtask"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isEditGoalModalOpen}
        onClose={handleCloseEditGoalModal}
        showCloseButton
        className="top-1/2 -translate-y-1/2 w-[94vw] sm:w-[560px] p-6"
      >
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              Edit goal
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              Update goal details and save your changes.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Title
            </label>
            <input
              type="text"
              value={editTitle}
              disabled={isUpdatingGoal}
              onChange={(event) => setEditTitle(event.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-gray-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Description
            </label>
            <textarea
              rows={3}
              value={editDescription}
              disabled={isUpdatingGoal}
              onChange={(event) => setEditDescription(event.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-gray-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Start date
              </label>
              <input
                type="date"
                value={editStartDate}
                disabled={isUpdatingGoal}
                onChange={(event) => setEditStartDate(event.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-gray-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Target date
              </label>
              <input
                type="date"
                value={editTargetDate}
                disabled={isUpdatingGoal}
                onChange={(event) => setEditTargetDate(event.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-gray-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          <div className="py-1">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={editIsPublic}
                disabled={isUpdatingGoal}
                onChange={(event) => setEditIsPublic(event.target.checked)}
                className="sr-only"
              />
              {editIsPublic ? (
                <CheckSquare size={18} className="text-blue-600" />
              ) : (
                <Square
                  size={18}
                  className="text-gray-400 dark:text-slate-500"
                />
              )}
              <span>Make this goal public</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Start time
              </label>
              <input
                type="time"
                value={editStartTime}
                disabled={isUpdatingGoal}
                onChange={(event) => setEditStartTime(event.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-gray-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Status
              </label>
              <select
                value={editStatus}
                disabled={isUpdatingGoal}
                onChange={(event) => setEditStatus(event.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-gray-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="To-do">To-do</option>
                <option value="In progress">In progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Check-in frequency
              </label>
              <select
                value={editCheckinFrequency}
                disabled={isUpdatingGoal}
                onChange={(event) =>
                  setEditCheckinFrequency(
                    event.target.value as CheckinFrequency,
                  )
                }
                className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-gray-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                {CHECKIN_FREQUENCIES.map((frequency) => (
                  <option key={frequency} value={frequency}>
                    {frequency}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Importance
              </label>
              <select
                value={editImportance}
                disabled={isUpdatingGoal}
                onChange={(event) => setEditImportance(event.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-gray-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="Urgent">Urgent</option>
                <option value="Important">Important</option>
                <option value="Regular">Regular</option>
                <option value="Not important">Not important</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Category
              </label>
              <select
                value={editCategory}
                disabled={isUpdatingGoal}
                onChange={(event) => setEditCategory(event.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-gray-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                {CORE_CATEGORIES.map((item) => (
                  <option key={item.label} value={item.label}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleCloseEditGoalModal}
              disabled={isUpdatingGoal}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleSaveGoalUpdates()}
              disabled={
                isUpdatingGoal ||
                !editTitle.trim() ||
                !editStartDate ||
                !editTargetDate ||
                !editImportance.trim() ||
                !editCategory.trim()
              }
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary-500 text-white hover:opacity-90 disabled:opacity-60"
            >
              {isUpdatingGoal ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteGoalModalOpen}
        onClose={() => {
          if (isDeletingGoal) return;
          setIsDeleteGoalModalOpen(false);
        }}
        showCloseButton
        className="top-1/2 -translate-y-1/2 w-[92vw] sm:w-[460px] p-6"
      >
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              Delete goal?
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              This action cannot be undone. The goal and its details will be
              removed.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsDeleteGoalModalOpen(false)}
              disabled={isDeletingGoal}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleDeleteGoal()}
              disabled={isDeletingGoal}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
            >
              {isDeletingGoal ? "Deleting..." : "Delete goal"}
            </button>
          </div>
        </div>
      </Modal>

      <ShareGoalModal
        isOpen={isShareGoalModalOpen}
        onClose={() => {
          if (isSharingGoal) return;
          setIsShareGoalModalOpen(false);
        }}
        goalTitle={goal.title}
        shareLink={
          shareLinkDraft || goal.public_share_link || goal.share_link || ""
        }
        isSubmitting={isSharingGoal}
        onSendInvites={handleShareGoalInvites}
      />
    </div>
  );
}
