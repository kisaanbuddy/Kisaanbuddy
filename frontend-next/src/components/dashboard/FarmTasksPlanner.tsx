"use client";

import React, { useState } from "react";
import {
  CheckSquare,
  Plus,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Trash2,
  Droplets,
  Sprout,
  ShieldAlert,
  Search,
  ShoppingCart,
  Layers,
  RotateCw,
} from "lucide-react";
import {
  FarmTask,
  FarmTaskCategory,
  FarmTaskPriority,
  FarmTaskStatus,
  tasksApi,
} from "@/lib/farmer-api";

interface FarmTasksPlannerProps {
  tasks: FarmTask[];
  onTasksChanged?: () => void;
  openCreateModal?: boolean;
  onCloseCreateModal?: () => void;
}

export function FarmTasksPlanner({
  tasks,
  onTasksChanged,
}: FarmTasksPlannerProps) {
  const [activeTab, setActiveTab] = useState<"today" | "upcoming" | "overdue" | "completed">("today");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states for adding new task
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<FarmTaskCategory>("general");
  const [newPriority, setNewPriority] = useState<FarmTaskPriority>("medium");
  const [newDueDate, setNewDueDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const todayStr = new Date().toISOString().split("T")[0];

  // Partition tasks into buckets
  const dueTodayTasks = tasks.filter(
    (t) => t.status === "pending" && t.due_date === todayStr
  );
  const overdueTasks = tasks.filter(
    (t) => t.status === "pending" && t.due_date < todayStr
  );
  const upcomingTasks = tasks.filter(
    (t) => t.status === "pending" && t.due_date > todayStr
  );
  const completedTasks = tasks.filter((t) => t.status === "completed");

  const currentTabTasks = (() => {
    switch (activeTab) {
      case "today":
        return dueTodayTasks;
      case "upcoming":
        return upcomingTasks;
      case "overdue":
        return overdueTasks;
      case "completed":
        return completedTasks;
    }
  })();

  const handleToggleStatus = async (task: FarmTask) => {
    try {
      const nextStatus: FarmTaskStatus =
        task.status === "completed" ? "pending" : "completed";
      await tasksApi.updateStatus(task.id, nextStatus);
      onTasksChanged?.();
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };

  const handleReschedule = async (taskId: number, daysToAdd: number) => {
    try {
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + daysToAdd);
      const formatted = newDate.toISOString().split("T")[0];
      await tasksApi.update(taskId, { due_date: formatted });
      onTasksChanged?.();
    } catch (err) {
      console.error("Failed to reschedule task:", err);
    }
  };

  const handleDelete = async (taskId: number) => {
    try {
      await tasksApi.delete(taskId);
      onTasksChanged?.();
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setIsSubmitting(true);
      await tasksApi.create({
        title: newTitle.trim(),
        category: newCategory,
        priority: newPriority,
        status: "pending",
        due_date: newDueDate,
        is_ai_recommended: false,
      });
      setNewTitle("");
      setShowAddForm(false);
      onTasksChanged?.();
    } catch (err) {
      console.error("Failed to create task:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (category: FarmTaskCategory) => {
    switch (category) {
      case "irrigation":
        return <Droplets className="w-4 h-4 text-sky-600" />;
      case "fertilizer":
        return <Sprout className="w-4 h-4 text-emerald-600" />;
      case "pesticide":
      case "scouting":
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      case "harvest":
        return <Layers className="w-4 h-4 text-amber-600" />;
      case "buyer_followup":
        return <ShoppingCart className="w-4 h-4 text-purple-600" />;
      default:
        return <CheckSquare className="w-4 h-4 text-slate-600" />;
    }
  };

  const getPriorityBadge = (priority: FarmTaskPriority) => {
    switch (priority) {
      case "urgent":
        return "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300";
      case "high":
        return "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300";
      case "medium":
        return "bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border-sky-300";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300";
    }
  };

  return (
    <div id="tasks-planner" className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Farm Work Planner
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {tasks.filter((t) => t.status === "pending").length} Pending
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organize daily field operations, irrigation schedules, and harvest activities
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "Cancel" : "Add Task"}</span>
        </button>
      </div>

      {/* New Task Inline Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateTask}
          className="bg-slate-50 dark:bg-slate-800/60 border border-emerald-500/30 rounded-xl p-4 mb-5 space-y-3"
        >
          <div className="font-bold text-xs text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
            Create Farm Task
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Task Description *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Apply Zinc Sulphate on East Plot"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as FarmTaskCategory)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="general">General</option>
                <option value="irrigation">Irrigation</option>
                <option value="fertilizer">Fertilizer</option>
                <option value="pesticide">Pesticide / Spray</option>
                <option value="scouting">Crop Scouting</option>
                <option value="harvest">Harvesting</option>
                <option value="buyer_followup">Buyer Followup</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as FarmTaskPriority)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Due Date:
              </label>
              <input
                type="date"
                required
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !newTitle.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              <span>Save Task</span>
            </button>
          </div>
        </form>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
        <button
          onClick={() => setActiveTab("today")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === "today"
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <span>Due Today</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
            {dueTodayTasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("upcoming")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === "upcoming"
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <span>Upcoming (7 Days)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
            {upcomingTasks.length}
          </span>
        </button>

        {overdueTasks.length > 0 && (
          <button
            onClick={() => setActiveTab("overdue")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "overdue"
                ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20"
                : "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            }`}
          >
            <span>Overdue</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 font-bold">
              {overdueTasks.length}
            </span>
          </button>
        )}

        <button
          onClick={() => setActiveTab("completed")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === "completed"
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <span>Completed</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
            {completedTasks.length}
          </span>
        </button>
      </div>

      {/* Task List */}
      {currentTabTasks.length === 0 ? (
        <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs">
          {activeTab === "today" && "No operations scheduled for today. Have a productive day!"}
          {activeTab === "upcoming" && "No upcoming tasks in the next 7 days."}
          {activeTab === "overdue" && "No overdue tasks. All work is on track!"}
          {activeTab === "completed" && "Completed tasks will be archived here."}
        </div>
      ) : (
        <div className="space-y-2.5">
          {currentTabTasks.map((task) => (
            <div
              key={task.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                task.status === "completed"
                  ? "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-70"
                  : "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-700/80 hover:border-emerald-500/40"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => handleToggleStatus(task)}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition shrink-0 ${
                    task.status === "completed"
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "border-slate-300 dark:border-slate-600 hover:border-emerald-500"
                  }`}
                >
                  {task.status === "completed" && <CheckCircle2 className="w-4 h-4" />}
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium truncate ${
                        task.status === "completed"
                          ? "line-through text-slate-400 dark:text-slate-500"
                          : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {task.title}
                    </span>
                    {task.is_ai_recommended && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-medium shrink-0">
                        AI Recommended
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1">
                      {getCategoryIcon(task.category)}
                      <span className="capitalize">{task.category}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{task.due_date}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getPriorityBadge(
                    task.priority
                  )}`}
                >
                  {task.priority}
                </span>

                {task.status !== "completed" && (
                  <button
                    onClick={() => handleReschedule(task.id, 1)}
                    title="Reschedule +1 Day"
                    className="text-[11px] px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                  >
                    +1d
                  </button>
                )}

                <button
                  onClick={() => handleDelete(task.id)}
                  title="Delete task"
                  className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
