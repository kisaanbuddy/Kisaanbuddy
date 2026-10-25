"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import {
  Mic,
  Volume2,
  Play,
  Pause,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lightbulb,
  HelpCircle,
  ThumbsUp,
  Sliders,
  Trash2,
  Loader2,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Shield,
  User as UserIcon,
  Phone,
  RefreshCw,
  Edit3,
  Save,
  X,
  Eye,
  Megaphone,
} from "lucide-react"

import { adminApi } from "@/lib/admin-api"
import type { FarmerFeedbackItem } from "@/lib/admin-types"

export function FarmerFeedbackAdminPanel() {
  const [items, setItems] = useState<FarmerFeedbackItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [loading, setLoading] = useState(true)

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [categoryFilter, setCategoryFilter] = useState<string>("")
  const [priorityFilter, setPriorityFilter] = useState<string>("")
  const [feedbackTypeFilter, setFeedbackTypeFilter] = useState<string>("")
  const [hasAudioFilter, setHasAudioFilter] = useState<boolean | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState("")

  // Active audio player
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editNotes, setEditNotes] = useState("")
  const [editAssignedTo, setEditAssignedTo] = useState("")
  const [editShowcase, setEditShowcase] = useState(false)
  const [editShowcaseSummary, setEditShowcaseSummary] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminApi.getFarmerFeedback({
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        priority: priorityFilter || undefined,
        feedback_type: feedbackTypeFilter || undefined,
        has_audio: hasAudioFilter,
        search: searchQuery || undefined,
        page,
        limit,
      })
      setItems(data.items || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error("Failed to fetch farmer feedback:", err)
      showToast("Error loading farmer feedback.")
    } finally {
      setLoading(false)
    }
  }, [statusFilter, categoryFilter, priorityFilter, feedbackTypeFilter, hasAudioFilter, searchQuery, page, limit])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  // Cleanup audio playback
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause()
      }
    }
  }, [audioElement])

  const toggleAudio = (feedbackId: string) => {
    if (playingAudioId === feedbackId && audioElement) {
      audioElement.pause()
      setPlayingAudioId(null)
      return
    }

    if (audioElement) {
      audioElement.pause()
    }

    const audio = new Audio(`/api/feedback/admin/${feedbackId}/audio`)
    setAudioElement(audio)
    setPlayingAudioId(feedbackId)

    audio.onended = () => {
      setPlayingAudioId(null)
    }
    audio.onerror = () => {
      showToast("Could not play private audio stream.")
      setPlayingAudioId(null)
    }
    audio.play().catch(() => {
      setPlayingAudioId(null)
    })
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await adminApi.updateFarmerFeedback(id, { status: newStatus })
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, status: newStatus as any } : it))
      )
      showToast(`Status updated to ${newStatus}`)
    } catch (err: any) {
      showToast(err.message || "Failed to update status")
    }
  }

  const handlePriorityChange = async (id: string, newPriority: string) => {
    try {
      await adminApi.updateFarmerFeedback(id, { priority: newPriority })
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, priority: newPriority as any } : it))
      )
      showToast(`Priority updated to ${newPriority}`)
    } catch (err: any) {
      showToast(err.message || "Failed to update priority")
    }
  }

  const handleToggleSpam = async (id: string, currentSpam: boolean) => {
    try {
      await adminApi.updateFarmerFeedback(id, { is_spam: !currentSpam })
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, is_spam: !currentSpam } : it))
      )
      showToast(!currentSpam ? "Marked as spam" : "Unmarked spam")
    } catch (err: any) {
      showToast(err.message || "Failed to update spam status")
    }
  }

  const handleStartEdit = (item: FarmerFeedbackItem) => {
    setEditingId(item.id)
    setEditNotes(item.internal_notes || "")
    setEditAssignedTo(item.assigned_to || "")
    setEditShowcase(item.is_public_showcase)
    setEditShowcaseSummary(item.public_improvement_summary || "")
  }

  const handleSaveEdit = async (id: string) => {
    setIsUpdating(true)
    try {
      const updated = await adminApi.updateFarmerFeedback(id, {
        internal_notes: editNotes,
        assigned_to: editAssignedTo,
        is_public_showcase: editShowcase,
        public_improvement_summary: editShowcaseSummary,
      })
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...updated } : it)))
      setEditingId(null)
      showToast("Notes and showcase settings saved.")
    } catch (err: any) {
      showToast(err.message || "Failed to save changes")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (id: string, ref: string) => {
    if (!confirm(`Are you sure you want to delete feedback ${ref}?`)) return
    try {
      await adminApi.deleteFarmerFeedback(id)
      setItems((prev) => prev.filter((it) => it.id !== id))
      setTotal((prev) => Math.max(0, prev - 1))
      showToast(`Feedback ${ref} deleted.`)
    } catch (err: any) {
      showToast(err.message || "Failed to delete feedback")
    }
  }

  // Summary Metrics
  const metrics = useMemo(() => {
    return {
      received: items.filter((i) => i.status === "received").length,
      underReview: items.filter((i) => i.status === "under_review").length,
      planned: items.filter((i) => i.status === "planned").length,
      completed: items.filter((i) => i.status === "completed").length,
      hasAudioCount: items.filter((i) => i.has_audio).length,
    }
  }, [items])

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold shadow-xl border border-stone-700 animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>Farmer Voice & Suggestions</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold border border-emerald-500/20">
              {total} Total
            </span>
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            Review audio recordings, guided choices, and issues submitted by farmers across India.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchItems()}
          className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground self-start sm:self-auto transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl border border-border bg-card">
          <div className="text-[11px] font-medium text-muted-foreground">New / Received</div>
          <div className="text-lg font-bold text-amber-600">{metrics.received}</div>
        </div>
        <div className="p-3.5 rounded-xl border border-border bg-card">
          <div className="text-[11px] font-medium text-muted-foreground">Under Review</div>
          <div className="text-lg font-bold text-blue-600">{metrics.underReview}</div>
        </div>
        <div className="p-3.5 rounded-xl border border-border bg-card">
          <div className="text-[11px] font-medium text-muted-foreground">Planned / Work</div>
          <div className="text-lg font-bold text-purple-600">{metrics.planned}</div>
        </div>
        <div className="p-3.5 rounded-xl border border-border bg-card">
          <div className="text-[11px] font-medium text-muted-foreground">Completed / Live</div>
          <div className="text-lg font-bold text-emerald-600">{metrics.completed}</div>
        </div>
        <div className="p-3.5 rounded-xl border border-border bg-card col-span-2 sm:col-span-1">
          <div className="text-[11px] font-medium text-muted-foreground">Voice Recordings</div>
          <div className="text-lg font-bold text-teal-600 flex items-center gap-1">
            <Mic className="w-4 h-4" />
            <span>{metrics.hasAudioCount}</span>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="p-4 rounded-xl border border-border bg-card/60 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference ID, farmer notes, or options..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Quick Filter Selects */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground"
            >
              <option value="">All Statuses</option>
              <option value="received">Received</option>
              <option value="under_review">Under Review</option>
              <option value="planned">Planned</option>
              <option value="completed">Completed</option>
              <option value="declined">Declined</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value)
                setPage(1)
              }}
              className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground"
            >
              <option value="">All Topics</option>
              <option value="mandi">Mandi Rates</option>
              <option value="weather">Weather</option>
              <option value="disease">Crop Doctor</option>
              <option value="marketplace">Marketplace</option>
              <option value="workers">Farm Labour</option>
              <option value="schemes">Govt Schemes</option>
              <option value="general">General / App</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value)
                setPage(1)
              }}
              className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground"
            >
              <option value="">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>

            <button
              type="button"
              onClick={() => {
                setHasAudioFilter(hasAudioFilter === true ? undefined : true)
                setPage(1)
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                hasAudioFilter === true
                  ? "bg-teal-600 text-white border-teal-600"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Voice Only</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Items List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-16 text-center text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
            Loading farmer feedback submissions...
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground border border-dashed border-border rounded-2xl p-8">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <h4 className="text-sm font-bold text-foreground">No submissions found</h4>
            <p className="text-xs text-muted-foreground mt-1">
              No farmer feedback matches the active search and filter criteria.
            </p>
          </div>
        ) : (
          items.map((item) => {
            const isEditing = editingId === item.id
            const isPlayingThisAudio = playingAudioId === item.id

            return (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  item.is_spam
                    ? "opacity-60 bg-muted/30 border-dashed border-muted"
                    : item.priority === "urgent"
                    ? "bg-rose-50/20 border-rose-500/40 dark:bg-rose-950/10 shadow-xs"
                    : "bg-card border-border shadow-xs"
                }`}
              >
                {/* Top Row: Ref, Language, Type, Priority, Status */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/80">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-foreground bg-muted px-2 py-0.5 rounded-md">
                      {item.feedback_ref}
                    </span>
                    <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                      {item.language}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 capitalize">
                      {item.feedback_type}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-400 capitalize">
                      {item.category}
                    </span>
                    {item.is_public_showcase && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Showcase
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Priority Selector */}
                    <select
                      value={item.priority}
                      onChange={(e) => handlePriorityChange(item.id, e.target.value)}
                      className={`text-xs font-bold px-2 py-1 rounded-md border ${
                        item.priority === "urgent"
                          ? "bg-red-500 text-white border-red-500"
                          : item.priority === "high"
                          ? "bg-amber-500 text-white border-amber-500"
                          : "bg-muted text-foreground border-border"
                      }`}
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>

                    {/* Status Selector */}
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                        item.status === "completed"
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : item.status === "planned"
                          ? "bg-purple-600 text-white border-purple-600"
                          : item.status === "under_review"
                          ? "bg-blue-600 text-white border-blue-600"
                          : item.status === "declined"
                          ? "bg-stone-500 text-white border-stone-500"
                          : "bg-amber-500 text-white border-amber-500"
                      }`}
                    >
                      <option value="received">Received</option>
                      <option value="under_review">Under Review</option>
                      <option value="planned">Planned</option>
                      <option value="completed">Completed</option>
                      <option value="declined">Declined</option>
                    </select>
                  </div>
                </div>

                {/* Content Body */}
                <div className="py-3 space-y-2.5">
                  {/* Guided Chip if present */}
                  {item.guided_option && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 text-xs font-medium border border-teal-200 dark:border-teal-800">
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Option: {item.guided_option}</span>
                    </div>
                  )}

                  {/* Audio Player if present */}
                  {item.has_audio && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30">
                      <button
                        type="button"
                        onClick={() => toggleAudio(item.id)}
                        className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs hover:bg-emerald-700 transition-colors"
                        aria-label={isPlayingThisAudio ? "Pause" : "Play"}
                      >
                        {isPlayingThisAudio ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                          <Mic className="w-3.5 h-3.5" />
                          <span>Farmer Voice Recording</span>
                        </div>
                        <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                          Duration: {item.audio_duration_seconds ? `${item.audio_duration_seconds}s` : "Audio file"} · {isPlayingThisAudio ? "Playing..." : "Click to listen"}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Written Note or Transcript */}
                  {item.content_text && (
                    <p className="text-xs sm:text-sm text-foreground italic bg-muted/40 p-3 rounded-xl border border-border/60">
                      &ldquo;{item.content_text}&rdquo;
                    </p>
                  )}

                  {/* Image attachment if present */}
                  {item.has_image && (
                    <div className="pt-1">
                      <a
                        href={`/api/feedback/admin/${item.id}/image`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Attached Photo</span>
                      </a>
                    </div>
                  )}

                  {/* Internal Notes / Showcase editing panel */}
                  {isEditing ? (
                    <div className="p-4 rounded-xl border border-border bg-muted/40 space-y-3 mt-3 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">
                          Staff Notes & Public Showcase
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="p-1 text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted-foreground">
                          Internal Staff Notes:
                        </label>
                        <textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          rows={2}
                          placeholder="Add team notes, investigation findings, or action items..."
                          className="w-full p-2.5 rounded-lg border border-border bg-background text-xs text-foreground focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted-foreground">
                          Assigned Staff / Team:
                        </label>
                        <input
                          type="text"
                          value={editAssignedTo}
                          onChange={(e) => setEditAssignedTo(e.target.value)}
                          placeholder="e.g. Engineering, Agronomist Desk, Operations"
                          className="w-full p-2 rounded-lg border border-border bg-background text-xs text-foreground"
                        />
                      </div>

                      <div className="space-y-2 pt-2 border-t border-border">
                        <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editShowcase}
                            onChange={(e) => setEditShowcase(e.target.checked)}
                            className="rounded text-primary focus:ring-primary"
                          />
                          <span>Publish in "You Suggested, We Improved" showcase</span>
                        </label>

                        {editShowcase && (
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-muted-foreground">
                              Public summary of what was improved (Strictly NO personal data):
                            </label>
                            <input
                              type="text"
                              value={editShowcaseSummary}
                              onChange={(e) => setEditShowcaseSummary(e.target.value)}
                              placeholder="e.g. Added APMC mandi distance in kilometers from farmer village."
                              className="w-full p-2 rounded-lg border border-border bg-background text-xs text-foreground"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-muted"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(item.id)}
                          disabled={isUpdating}
                          className="px-4 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5"
                        >
                          {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          <span>Save Changes</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display saved internal notes if any */
                    item.internal_notes && (
                      <div className="text-xs bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg text-amber-900 dark:text-amber-200">
                        <span className="font-bold">Team Note: </span>
                        {item.internal_notes}
                        {item.assigned_to && (
                          <span className="text-muted-foreground ml-2">
                            (Assigned: {item.assigned_to})
                          </span>
                        )}
                      </div>
                    )
                  )}
                </div>

                {/* Bottom Row: Context, Identity & Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/80 text-[11px] text-muted-foreground">
                  <div className="flex flex-wrap items-center gap-3">
                    <span>{new Date(item.created_at).toLocaleString()}</span>
                    <span>·</span>
                    <span>Source: {item.source_page || "/"}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <UserIcon className="w-3 h-3" />
                      {item.is_anonymous ? "Anonymous Farmer" : `User #${item.user_id}`}
                    </span>
                    {item.contact_info && (
                      <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                        <Phone className="w-3 h-3" />
                        {item.contact_info}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(item)}
                      className="px-2.5 py-1 rounded-lg border border-border text-xs font-semibold hover:bg-muted text-foreground flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{item.internal_notes ? "Edit Notes" : "Add Notes"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleSpam(item.id, item.is_spam)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                        item.is_spam
                          ? "bg-amber-600 text-white border-amber-600"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {item.is_spam ? "Spam" : "Mark Spam"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.feedback_ref)}
                      className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10"
                      title="Delete feedback"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <span className="text-xs text-muted-foreground">
            Showing {(page - 1) * limit + 1} - {Math.min(page * limit, total)} of {total}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page * limit >= total}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
