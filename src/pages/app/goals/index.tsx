import React, { useEffect, useMemo, useState } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { startOfToday, isSameDay, parseISO, format } from "date-fns";
import { Target, Plus, ClipboardList, Square, CheckSquare } from "lucide-react"; // Added Icons
import { TodayProgress } from "../dashboard/components/progress";
import { GoalColumn } from "./components/goal-column";
import { CalendarWidget } from "../dashboard/components/calendar-widget";
import { CreateGoalModal } from "./components/create-goal-modal";
import { GoalTabs } from "../dashboard/components/goal-tabs";
import { cn } from "@/utils/cs";
import { BoardData } from "@/constants/kanban-data";
import Button from "@/components/core/buttons";
import { useGoals } from "./hooks/useGoals";
import { useUpdateGoal } from "./hooks/useUpdateGoal";
import { useDeleteGoal } from "./hooks/useDeleteGoal";
import moment from "moment";
import { normalizeCategory } from "@/constants/categories";
import { Modal } from "@/components/core/modal";
import { CORE_CATEGORIES } from "@/constants/categories";
import { toast } from "sonner";
import { useShareGoalInvites } from "./hooks/useShareGoal";
import { ShareGoalModal } from "./components/share-goal-modal";
import { CHECKIN_FREQUENCIES } from "./api";
import type { CheckinFrequency, Goal } from "./api";

const formatGoalTime = (timeValue?: string | null) => {
  if (!timeValue) return "";
  const [h = "0", m = "0"] = timeValue.split(":");
  const hours = Number(h);
  const minutes = Number(m);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return timeValue;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// Initial Empty Board Structure
const EMPTY_BOARD: BoardData = {
  todo: { id: "todo", title: "To-do", color: "bg-primary-500", items: [] },
  inProgress: {
    id: "inProgress",
    title: "In progress",
    color: "bg-[#EB612C]",
    items: [],
  },
  completed: {
    id: "completed",
    title: "Completed",
    color: "bg-[#1DB9C3]",
    items: [],
  },
};

export const GoalsPage = () => {
  const OPEN_CREATE_GOAL_FROM_CHAT_KEY = "open_create_goal_from_chat";
  const CREATE_GOAL_CONVERSATION_ID_KEY = "create_goal_conversation_id";
  const [activeTab, setActiveTab] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [chatConversationId, setChatConversationId] = useState<number | null>(
    null,
  );
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isEditGoalModalOpen, setIsEditGoalModalOpen] = useState(false);
  const [isDeleteGoalModalOpen, setIsDeleteGoalModalOpen] = useState(false);
  const [isShareGoalModalOpen, setIsShareGoalModalOpen] = useState(false);
  const [shareLinkDraft, setShareLinkDraft] = useState("");
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

  useEffect(() => {
    if (localStorage.getItem(OPEN_CREATE_GOAL_FROM_CHAT_KEY) === "1") {
      const conversationRaw = localStorage.getItem(
        CREATE_GOAL_CONVERSATION_ID_KEY,
      );
      const conversationParsed = Number(conversationRaw);
      setChatConversationId(
        Number.isFinite(conversationParsed) ? conversationParsed : null,
      );
      setIsModalOpen(true);
      localStorage.removeItem(OPEN_CREATE_GOAL_FROM_CHAT_KEY);
      localStorage.removeItem(CREATE_GOAL_CONVERSATION_ID_KEY);
    }
  }, []);

  const handleCloseCreateModal = () => {
    setIsModalOpen(false);
    setChatConversationId(null);
  };

  // 1. Fetch Goals
  const { data: goalsData, isLoading } = useGoals({ ordering: "target_date" });

  console.log(goalsData, "goals data");

  // 2. Mutation for Drag & Drop
  const {
    mutate: updateGoalStatus,
    mutateAsync: updateGoal,
    isPending: isUpdatingGoal,
  } = useUpdateGoal();
  const { mutateAsync: deleteGoal, isPending: isDeletingGoal } = useDeleteGoal();
  const { mutateAsync: shareGoalInvites, isPending: isSharingGoal } = useShareGoalInvites();

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

  const openEditGoalModal = (goal: Goal) => {
    setSelectedGoal(goal);
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
    setIsEditGoalModalOpen(true);
  };

  const openDeleteGoalModal = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsDeleteGoalModalOpen(true);
  };

  const openShareGoalModal = (goal: Goal) => {
    setSelectedGoal(goal);
    setShareLinkDraft(goal.public_share_link || goal.share_link || "");
    setIsShareGoalModalOpen(true);
  };

  const handleSaveGoalUpdates = async () => {
    if (!selectedGoal) return;

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
    if (!importance) {
      toast.error("Importance is required.");
      return;
    }
    if (!category) {
      toast.error("Category is required.");
      return;
    }

    await updateGoal({
      id: selectedGoal.id,
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
    if (!selectedGoal) return;
    await deleteGoal(selectedGoal.id);
    setIsDeleteGoalModalOpen(false);
  };

  const handleShareGoalInvites = async (payload: {
    emails: string[];
    message?: string;
  }) => {
    if (!selectedGoal) return;
    const response = await shareGoalInvites({
      goalId: selectedGoal.id,
      payload,
    });
    const maybeLink = response.public_share_link || response.share_link || "";
    if (maybeLink) {
      setShareLinkDraft(maybeLink);
    }
  };

  const boardData = useMemo(() => {
    if (!goalsData?.results) return EMPTY_BOARD;

    const board: BoardData = JSON.parse(JSON.stringify(EMPTY_BOARD));

    // 1. Format the selected date to a string "YYYY-MM-DD"
    // This removes time/timezone variables from the equation
    const selectedDateStr = selectedDate
      ? format(selectedDate, "yyyy-MM-dd")
      : null;

    goalsData.results.forEach((goal) => {
      // 2. Extract the date part from the API string safely
      // Handles both "2026-01-05" and "2026-01-05T14:30:00Z"
      const goalDateStr = goal.start_date ? goal.start_date.split("T")[0] : "";

      // 3. Compare Strings directly
      if (selectedDateStr && goalDateStr !== selectedDateStr) return;

      const normalizedImportance = goal.importance?.trim() || "Regular";
      const normalizedStatus = goal.status?.trim() || "To-do";
      const normalizedCategory = normalizeCategory(goal.category);

      const item = {
        id: goal.id.toString(),
        goalId: goal.id,
        partnershipId: goal.partnership ?? null,
        sharedPartnerName:
          goal.partner?.name ||
          goal.partner_name ||
          (goal.partnership ? "Shared partner" : ""),
        sharedPartnerAvatar:
          goal.partner?.avatar ||
          goal.partner_avatar ||
          "",
        publicShareLink: goal.public_share_link || goal.share_link || null,
        title: goal.title,
        description: goal.description,
        tags: [normalizedImportance, normalizedStatus, normalizedCategory].filter(
          (tag): tag is string => Boolean(tag && tag.trim()),
        ),
        // For display, we can still parse it to look nice
        date: format(parseISO(goal.target_date), "dd MMM YYY"),
        time: formatGoalTime(goal.start_time),
        timeLeft: moment(goal.target_date).endOf("day").fromNow(),
      };

      if (goal.status === "completed") {
        board.completed.items.push(item);
      } else if (
        goal.status === "in-progress" ||
        goal.status === "inprogress"
      ) {
        board.inProgress.items.push(item);
      } else {
        board.todo.items.push(item);
      }
    });

    return board;
  }, [goalsData, selectedDate]);

  // 4. Handle Drag End
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    let newStatus = "planned";
    if (destination.droppableId === "completed") newStatus = "completed";
    if (destination.droppableId === "inProgress") newStatus = "in-progress";

    updateGoalStatus({
      id: draggableId,
      data: { status: newStatus },
    });
  };

  // 5. Logic for Tabs (Filtering Columns)
  const visibleColumns = useMemo(() => {
    if (activeTab === "All") {
      return [boardData.todo, boardData.inProgress, boardData.completed];
    }
    const mapTabToId: Record<string, keyof BoardData> = {
      "To-do": "todo",
      "In progress": "inProgress",
      Completed: "completed",
    };
    const columnId = mapTabToId[activeTab];
    return columnId ? [boardData[columnId]] : [];
  }, [boardData, activeTab]);

  // 6. Check if there are any goals in the currently visible columns
  const hasGoals = useMemo(() => {
    return visibleColumns.some((col) => col.items.length > 0);
  }, [visibleColumns]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate((prev) =>
      prev && isSameDay(prev, date) ? null : date,
    );
  };

  return (
    <div className="w-full text-gray-900 dark:text-slate-100">
      <div className="w-full mx-auto grid grid-cols-1 xl:grid-cols-4 gap-8 mb-16 sm:mb-0 ">
        <div className="xl:col-span-3 flex flex-col h-full">
          <div className="bg-white dark:bg-slate-900 pt-6 px-5 pb-5 rounded-lg mb-5 border border-gray-100 dark:border-slate-800">
            <div className="mb-6">
              <TodayProgress
                goals={Object.values(boardData)
                  .flatMap((c) => c.items)
                  .map((i) => ({ ...i, status: "todo" }))}
                selectedDate={selectedDate ?? startOfToday()}
              />
            </div>
            <div className="">
              <GoalTabs activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
          </div>

          <div className="mb-6 flex justify-between items-center">
            <h1 className="font-monts text-lg sm:text-xl font-semibold text-[#636363] dark:text-slate-200">
              {!selectedDate
                ? "All goals"
                : isSameDay(selectedDate, startOfToday())
                ? "Today's goals"
                : `Goals for ${format(selectedDate, "MMM do")}`}
            </h1>

            {/* Show 'Create' button here too if list is empty to be helpful */}
            {!isLoading && !hasGoals && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors"
              >
                + Quick Add
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex-1 h-64 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : !hasGoals ? (
            // --- EMPTY STATE UI ---
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full shadow-sm flex items-center justify-center mb-4">
                {activeTab === "Completed" ? (
                  <ClipboardList size={32} className="text-gray-400 dark:text-slate-500" />
                ) : (
                  <Target size={32} className="text-blue-500" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                {activeTab === "Completed"
                  ? "No completed goals yet"
                  : "No goals found"}
              </h3>
              <p className="text-gray-500 dark:text-slate-400 mb-6 text-sm max-w-xs text-center mt-1">
                {activeTab === "Completed"
                  ? "Keep working! Once you finish a task, it will appear here."
                  : !selectedDate
                    ? `No ${activeTab.toLowerCase()} goals found yet.`
                    : isSameDay(selectedDate, startOfToday())
                    ? "You haven't set any goals for today. Ready to start?"
                    : `No goals scheduled for ${format(selectedDate, "MMMM do")}.`}
              </p>

              {/* Only show Create button if we aren't in 'Completed' tab (logic choice) */}
              {activeTab !== "Completed" && (
                <Button
                  variant="primary"
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 w-fit"
                >
                  <Plus size={18} /> Create New Goal
                </Button>
              )}
            </div>
          ) : (
            // --- KANBAN BOARD ---
            <DragDropContext onDragEnd={onDragEnd}>
              <div
                className={cn(
                  "grid gap-6 w-full h-full transition-all",
                  activeTab === "All"
                    ? "grid-cols-1 md:grid-cols-3"
                    : "grid-cols-1 md:grid-cols-1 md:max-w-md",
                )}
              >
                {visibleColumns.map((column) => (
                  <GoalColumn
                    key={column.id}
                    column={column}
                    onAddTask={() => setIsModalOpen(true)}
                    goalsData={goalsData?.results || []}
                    onEditGoal={openEditGoalModal}
                    onDeleteGoal={openDeleteGoalModal}
                    onShareGoal={openShareGoalModal}
                  />
                ))}
              </div>
            </DragDropContext>
          )}
        </div>

        <div className="xl:col-span-1">
          <CalendarWidget
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </div>
      </div>

      <CreateGoalModal
        isOpen={isModalOpen}
        onClose={handleCloseCreateModal}
        conversationId={chatConversationId}
      />

      <Modal
        isOpen={isEditGoalModalOpen}
        onClose={() => {
          if (isUpdatingGoal) return;
          setIsEditGoalModalOpen(false);
        }}
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
                <Square size={18} className="text-gray-400 dark:text-slate-500" />
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
                  setEditCheckinFrequency(event.target.value as CheckinFrequency)
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
              onClick={() => setIsEditGoalModalOpen(false)}
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
              This action cannot be undone. The goal and its details will be removed.
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
        goalTitle={selectedGoal?.title || "Goal"}
        shareLink={
          shareLinkDraft ||
          selectedGoal?.public_share_link ||
          selectedGoal?.share_link ||
          ""
        }
        isSubmitting={isSharingGoal}
        onSendInvites={handleShareGoalInvites}
      />
    </div>
  );
};
