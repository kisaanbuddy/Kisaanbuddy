"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowLeft, 
  Search, 
  Check, 
  X, 
  Edit, 
  Trash2, 
  Loader2, 
  ShieldAlert, 
  MessageSquare,
  Star,
  Calendar,
  RefreshCw,
  AlertTriangle,
  CheckCircle2
} from "lucide-react"
import { useAuth, fetchWithAuth } from "@/lib/auth"
import { useLanguage } from "@/lib/language"
import { GlassCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Testimonial = {
  id: string
  name: string
  location: string
  crop: string
  text: string
  stars: number
  status: "pending" | "approved" | "rejected"
  created_at: string
  updated_at?: string
}

export default function AdminClient() {
  const { user, ready } = useAuth()
  const { t } = useLanguage()

  // Data states
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  
  // Modals state
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [deletingTestimonial, setDeletingTestimonial] = useState<Testimonial | null>(null)
  
  // Form edit state
  const [editName, setEditName] = useState("")
  const [editLocation, setEditLocation] = useState("")
  const [editCrop, setEditCrop] = useState("")
  const [editStars, setEditStars] = useState(5)
  const [editText, setEditText] = useState("")
  const [editStatus, setEditStatus] = useState<"pending" | "approved" | "rejected">("pending")
  const [submittingEdit, setSubmittingEdit] = useState(false)
  const [submittingDelete, setSubmittingDelete] = useState(false)

  // Notification toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null)

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  // Load testimonials
  const loadTestimonials = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      if (statusFilter !== "all") {
        queryParams.append("status", statusFilter)
      }
      if (search.trim()) {
        queryParams.append("search", search.trim())
      }

      const res = await fetchWithAuth(`/api/testimonials?${queryParams}`)
      if (res.ok) {
        const data = await res.json()
        setTestimonials(data)
      } else {
        setToast({ message: "Failed to fetch testimonials from database.", type: "error" })
      }
    } catch (err) {
      setToast({ message: "Network error: Connection to backend failed.", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  // Reload when status filter changes
  useEffect(() => {
    if (ready && user && user.role.toLowerCase() === "admin") {
      loadTestimonials()
    }
  }, [ready, user, statusFilter])

  // Moderate direct action (Approve/Reject)
  const handleModerate = async (id: string, newStatus: "approved" | "rejected") => {
    try {
      const res = await fetchWithAuth(`/api/testimonials/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })

      if (res.ok) {
        const updated = await res.json()
        setTestimonials(prev => prev.map(t => t.id === id ? updated : t))
        setToast({ 
          message: `Testimonial successfully ${newStatus === "approved" ? "approved" : "rejected"}!`, 
          type: "success" 
        })
      } else {
        setToast({ message: "Failed to update moderation status.", type: "error" })
      }
    } catch (err) {
      setToast({ message: "Network error: Testimonial update failed.", type: "error" })
    }
  }

  // Open Edit Modal
  const openEditModal = (t: Testimonial) => {
    setEditingTestimonial(t)
    setEditName(t.name)
    setEditLocation(t.location)
    setEditCrop(t.crop)
    setEditStars(t.stars)
    setEditText(t.text)
    setEditStatus(t.status)
  }

  // Submit Edit Form
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTestimonial) return

    setSubmittingEdit(true)
    try {
      const res = await fetchWithAuth(`/api/testimonials/${editingTestimonial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          location: editLocation.trim(),
          crop: editCrop.trim(),
          stars: editStars,
          text: editText.trim(),
          status: editStatus
        })
      })

      if (res.ok) {
        const updated = await res.json()
        setTestimonials(prev => prev.map(t => t.id === editingTestimonial.id ? updated : t))
        setToast({ message: "Testimonial updated successfully!", type: "success" })
        setEditingTestimonial(null)
      } else {
        setToast({ message: "Failed to update testimonial fields.", type: "error" })
      }
    } catch (err) {
      setToast({ message: "Network error: Connection to backend failed.", type: "error" })
    } finally {
      setSubmittingEdit(false)
    }
  }

  // Confirm Delete
  const handleDeleteConfirm = async () => {
    if (!deletingTestimonial) return

    setSubmittingDelete(true)
    try {
      const res = await fetchWithAuth(`/api/testimonials/${deletingTestimonial.id}`, {
        method: "DELETE"
      })

      if (res.status === 204 || res.ok) {
        setTestimonials(prev => prev.filter(t => t.id !== deletingTestimonial.id))
        setToast({ message: "Testimonial deleted successfully!", type: "success" })
        setDeletingTestimonial(null)
      } else {
        setToast({ message: "Failed to delete testimonial.", type: "error" })
      }
    } catch (err) {
      setToast({ message: "Network error: Deletion failed.", type: "error" })
    } finally {
      setSubmittingDelete(false)
    }
  }

  // Format timestamp helper
  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return "-"
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    } catch {
      return dateStr
    }
  }

  // 1. Loading Authentication readiness
  if (!ready) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
        <span className="text-sm text-muted-foreground font-bold">Verifying admin credentials...</span>
      </div>
    )
  }

  // 2. Unauthenticated user view
  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center select-none">
        <GlassCard className="border-red-500/10 bg-gradient-to-br from-[#0c0814] to-transparent">
          <CardHeader className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shadow-lg shadow-red-500/5">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-display font-black text-white mt-2">
              Admin Access Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-xs text-muted-foreground leading-relaxed">
              This dashboard is guarded. Please sign in with an administrator account to view and moderate testimonials.
            </p>
            <div className="flex flex-col gap-2">
              <Link href="/login?redirect=/admin">
                <Button className="w-full bg-sky-500 hover:bg-sky-600 text-slate-950 font-extrabold text-xs py-3.5 rounded-xl transition-all">
                  Sign In as Admin
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-white">
                  Back to Homepage
                </Button>
              </Link>
            </div>
          </CardContent>
        </GlassCard>
      </div>
    )
  }

  // 3. Authenticated but unauthorized view (Not Admin)
  if (user.role.toLowerCase() !== "admin") {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center select-none">
        <GlassCard className="border-red-500/15 bg-gradient-to-br from-[#0c0814] to-transparent">
          <CardHeader className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-display font-black text-white mt-2">
              Permission Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your account role is registered as <strong className="text-amber-400 uppercase">{user.role}</strong>. You do not have authorization to moderate or edit platform reviews.
            </p>
            <div className="flex flex-col gap-2">
              <Link href="/">
                <Button className="w-full bg-sky-500 hover:bg-sky-600 text-slate-950 font-extrabold text-xs py-3.5 rounded-xl">
                  Back to Homepage
                </Button>
              </Link>
            </div>
          </CardContent>
        </GlassCard>
      </div>
    )
  }

  // 4. Authorized Admin Dashboard View
  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto px-1 select-none">
      
      {/* Header breadcrumb */}
      <div className="flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 text-xs text-muted-foreground hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Header Panel */}
      <div className="bg-gradient-to-br from-[#05111d] via-[#091b2e] to-[#030910] border border-sky-500/10 p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -m-8 opacity-5">
          <MessageSquare className="h-48 w-48 text-sky-400" />
        </div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
            A
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-sky-400">
            Control Center
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight text-white">
          Testimonial Moderator System
        </h1>
        <p className="mt-2 text-xs text-muted-foreground max-w-xl leading-relaxed">
          Manage, search, edit, approve, or delete farmer success stories appearing on the KisaanBuddy landing page.
        </p>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#040814]/40 border border-white/5 p-4 rounded-2xl w-full">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadTestimonials()}
            placeholder="Search testimonials by name, crop, or keywords..."
            className="w-full h-10 bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.05] border border-white/10 focus:border-sky-500/40 rounded-xl pl-9 pr-16 text-xs text-white transition-all focus:outline-none"
          />
          <button
            onClick={loadTestimonials}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-sky-500 hover:bg-sky-600 text-slate-950 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all"
          >
            Search
          </button>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-1.5 p-1 rounded-xl bg-white/[0.02] border border-white/5 shrink-0">
          {[
            { id: "all", label: "All" },
            { id: "pending", label: "Pending" },
            { id: "approved", label: "Approved" },
            { id: "rejected", label: "Rejected" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                statusFilter === tab.id
                  ? "bg-sky-500/10 border border-sky-500/20 text-sky-400"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main List Table */}
      <GlassCard className="overflow-hidden border-white/[0.05]">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
              <span className="text-xs text-muted-foreground font-semibold">Loading data entries...</span>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-2">
              <AlertTriangle className="h-8 w-8 text-amber-500/60" />
              <h3 className="text-sm font-bold text-white">No Testimonials Found</h3>
              <p className="text-xs text-muted-foreground">Try modifying your filters or search keywords.</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full border-collapse text-left text-xs select-none">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01] text-muted-foreground font-bold tracking-wider uppercase text-[10px] select-none">
                    <th className="p-4 pl-6">Farmer</th>
                    <th className="p-4">Crop / Location</th>
                    <th className="p-4">Message Context</th>
                    <th className="p-4 text-center">Stars</th>
                    <th className="p-4">Moderation</th>
                    <th className="p-4">Created / Updated</th>
                    <th className="p-4 pr-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {testimonials.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.01] transition-colors group">
                      {/* Name */}
                      <td className="p-4 pl-6 font-bold text-white align-top">
                        {item.name}
                      </td>
                      
                      {/* Location & Crop */}
                      <td className="p-4 align-top space-y-1">
                        <div className="font-semibold text-slate-300">{item.crop}</div>
                        <div className="text-[10px] text-muted-foreground">{item.location}</div>
                      </td>

                      {/* Review Text */}
                      <td className="p-4 align-top max-w-sm">
                        <p className="text-slate-300 leading-relaxed line-clamp-3">
                          &ldquo;{item.text}&rdquo;
                        </p>
                      </td>

                      {/* Stars */}
                      <td className="p-4 align-top text-center">
                        <div className="flex items-center justify-center gap-0.5 select-none">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < item.stars ? "fill-amber-400 text-amber-400" : "text-white/10"}`} />
                          ))}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4 align-top">
                        <span className={`inline-flex items-center rounded px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide border ${
                          item.status === "approved"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : item.status === "rejected"
                            ? "bg-red-500/10 border-red-500/20 text-red-400"
                            : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        }`}>
                          {item.status}
                        </span>
                      </td>

                      {/* Timestamps */}
                      <td className="p-4 align-top text-[10px] text-muted-foreground space-y-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> C: {formatTimestamp(item.created_at)}
                        </div>
                        {item.updated_at && item.updated_at !== item.created_at && (
                          <div className="flex items-center gap-1 text-sky-400/80">
                            <RefreshCw className="h-2.5 w-2.5 animate-spin-slow" /> U: {formatTimestamp(item.updated_at)}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 align-top">
                        <div className="flex items-center justify-center gap-2">
                          
                          {/* Approve Action */}
                          {item.status !== "approved" && (
                            <button
                              onClick={() => handleModerate(item.id, "approved")}
                              title="Approve Review"
                              className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-500 hover:text-slate-950 transition-all"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {/* Reject Action */}
                          {item.status !== "rejected" && (
                            <button
                              onClick={() => handleModerate(item.id, "rejected")}
                              title="Reject Review"
                              className="h-7 w-7 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {/* Edit Action */}
                          <button
                            onClick={() => openEditModal(item)}
                            title="Edit fields"
                            className="h-7 w-7 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center hover:bg-sky-500 hover:text-slate-950 transition-all"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete Action */}
                          <button
                            onClick={() => setDeletingTestimonial(item)}
                            title="Delete review"
                            className="h-7 w-7 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </GlassCard>

      {/* Edit Dialog Modal Overlay */}
      <AnimatePresence>
        {editingTestimonial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg rounded-3xl border border-white/5 bg-slate-900 p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setEditingTestimonial(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 mb-6 pb-3 border-b border-white/5">
                <Edit className="h-4.5 w-4.5 text-sky-400" />
                <h3 className="text-base font-extrabold text-white">Edit Testimonial</h3>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                
                {/* Farmer Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Farmer Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full h-10 bg-white/[0.03] border border-white/10 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Location */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Location</label>
                    <input
                      type="text"
                      required
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="w-full h-10 bg-white/[0.03] border border-white/10 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  {/* Crop */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Crop / Label</label>
                    <input
                      type="text"
                      required
                      value={editCrop}
                      onChange={(e) => setEditCrop(e.target.value)}
                      className="w-full h-10 bg-white/[0.03] border border-white/10 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Stars Rating */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Rating Score</label>
                    <select
                      value={editStars}
                      onChange={(e) => setEditStars(Number(e.target.value))}
                      className="w-full h-10 bg-[#0b1424] border border-white/10 rounded-xl px-3 text-xs text-white focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Stars</option>)}
                    </select>
                  </div>

                  {/* Status Moderation */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Moderation Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="w-full h-10 bg-[#0b1424] border border-white/10 rounded-xl px-3 text-xs text-white focus:outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Review Text */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Review Message</label>
                  <textarea
                    required
                    rows={4}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500 resize-none"
                  />
                </div>

                {/* Submit Actions */}
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setEditingTestimonial(null)}
                    className="text-xs font-bold rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submittingEdit}
                    className="bg-sky-500 hover:bg-sky-600 text-slate-950 font-extrabold text-xs px-6 py-2 rounded-xl transition-all flex items-center gap-1.5"
                  >
                    {submittingEdit && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Save Changes
                  </Button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal Overlay */}
      <AnimatePresence>
        {deletingTestimonial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl border border-white/5 bg-slate-900 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-2.5 text-red-400">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <h3 className="text-base font-extrabold">Confirm Deletion</h3>
              </div>
              
              <p className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to permanently delete the testimonial submitted by <strong>{deletingTestimonial.name}</strong>? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setDeletingTestimonial(null)}
                  className="text-xs font-bold rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteConfirm}
                  disabled={submittingDelete}
                  className="bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs px-6 py-2 rounded-xl flex items-center gap-1.5"
                >
                  {submittingDelete && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Delete
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success/Error Floating Toast Overlay */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl border p-4 shadow-2xl backdrop-blur-md flex items-start gap-3 bg-[#0a1224]/95 select-none"
            style={{
              borderColor: toast.type === "success" ? "rgba(16, 185, 129, 0.3)" : toast.type === "warning" ? "rgba(245, 158, 11, 0.3)" : "rgba(239, 68, 68, 0.3)",
            }}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : toast.type === "warning" ? (
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <X className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white">
                {toast.type === "success" ? "Success" : toast.type === "warning" ? "Notice" : "Error"}
              </h4>
              <p className="text-[11px] text-gray-300 leading-relaxed font-semibold">
                {toast.message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
