"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  MessageCircle,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Globe,
  Ticket,
  HelpCircle,
  BookOpen,
  DollarSign,
  Activity,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { fetchWithAuth } from "@/lib/auth";

interface DashboardData {
  total_subscribers: number;
  linked_accounts: number;
  language_usage: Record<string, number>;
  delivery_status: Record<string, number>;
  total_turns: number;
  failed_turns: number;
  avg_latency_ms: number;
  unanswered_open: number;
  feedback: { total: number; helpful: number };
  costs: { estimated_cost_inr: number; monthly_budget_inr: number; budget_exceeded: boolean };
  conversations: Array<{
    id: number;
    masked_phone: string;
    language: string;
    current_state: string;
    account_linked: boolean;
    opted_in: boolean;
    last_active_at: string | null;
  }>;
}

interface SupportTicket {
  id: number;
  ticket_id: string;
  phone_number: string;
  farmer_name: string | null;
  query_summary: string;
  status: string;
  assigned_to: string | null;
  resolution_notes: string | null;
  created_at: string;
}

interface UnansweredItem {
  id: number;
  masked_phone: string;
  language: string;
  question_text: string;
  reason: string;
  resolved: boolean;
  created_at: string | null;
}

interface ErrorLogs {
  failed_messages: Array<{ id: number; masked_phone: string; message_type: string; error_message: string | null; created_at: string | null }>;
  failed_turns: Array<{ id: number; language: string; intent: string | null; error_code: string | null; latency_ms: number; created_at: string | null }>;
}

interface KnowledgeDoc {
  source: string;
  chunks: number;
  topics: string[];
}

export function WhatsAppAdminPanel() {
  const [subTab, setSubTab] = useState<"overview" | "tickets" | "unanswered" | "errors" | "knowledge">("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [unanswered, setUnanswered] = useState<UnansweredItem[]>([]);
  const [errors, setErrors] = useState<ErrorLogs>({ failed_messages: [], failed_turns: [] });
  const [knowledge, setKnowledge] = useState<KnowledgeDoc[]>([]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dRes, tRes, uRes, eRes, kRes] = await Promise.all([
        fetchWithAuth("/api/whatsapp/admin/dashboard"),
        fetchWithAuth("/api/whatsapp/admin/tickets"),
        fetchWithAuth("/api/whatsapp/admin/unanswered"),
        fetchWithAuth("/api/whatsapp/admin/errors"),
        fetchWithAuth("/api/whatsapp/admin/knowledge"),
      ]);
      if (!dRes.ok) throw new Error(`Dashboard load failed (${dRes.status})`);
      setDashboard(await dRes.json());
      if (tRes.ok) setTickets(await tRes.json());
      if (uRes.ok) setUnanswered(await uRes.json());
      if (eRes.ok) setErrors(await eRes.json());
      if (kRes.ok) setKnowledge(await kRes.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load WhatsApp admin data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const resolveTicket = async (ticketId: string) => {
    const res = await fetchWithAuth(`/api/whatsapp/admin/tickets/${encodeURIComponent(ticketId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "RESOLVED" }),
    });
    if (res.ok) loadAll();
  };

  const resolveUnanswered = async (id: number) => {
    const res = await fetchWithAuth(`/api/whatsapp/admin/unanswered/${id}`, { method: "PATCH" });
    if (res.ok) loadAll();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-emerald-600" />
            WhatsApp AI Assistant Control Center
          </h2>
          <p className="text-sm text-slate-500">
            Privacy-conscious analytics, support tickets, unanswered queries, delivery logs, and knowledge base status.
          </p>
        </div>
        <button
          onClick={loadAll}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {(
          [
            { id: "overview", label: "Overview & Conversations" },
            { id: "tickets", label: `Support Tickets (${tickets.length})` },
            { id: "unanswered", label: `Unanswered (${unanswered.filter((u) => !u.resolved).length})` },
            { id: "errors", label: `Errors (${errors.failed_messages.length + errors.failed_turns.length})` },
            { id: "knowledge", label: `Knowledge Base (${knowledge.length})` },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              subTab === t.id ? "bg-emerald-100 text-emerald-800" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {subTab === "overview" && dashboard && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="text-xs text-slate-500 flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Subscribers / Linked</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{dashboard.total_subscribers} <span className="text-sm font-normal text-slate-500">({dashboard.linked_accounts} linked)</span></div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="text-xs text-slate-500 flex items-center gap-1"><Activity className="w-4 h-4 text-blue-600" /> Turns / Avg Latency</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{dashboard.total_turns} <span className="text-sm font-normal text-slate-500">({dashboard.avg_latency_ms} ms)</span></div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="text-xs text-slate-500 flex items-center gap-1"><DollarSign className="w-4 h-4 text-amber-600" /> Estimated Spend</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">₹{dashboard.costs.estimated_cost_inr} <span className="text-sm font-normal text-slate-500">/ ₹{dashboard.costs.monthly_budget_inr}</span></div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-4 h-4 text-purple-600" /> Failed Turns / Open Gaps</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{dashboard.failed_turns} / {dashboard.unanswered_open}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><Globe className="w-4 h-4 text-emerald-600" /> Language Usage</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(dashboard.language_usage).map(([lang, count]) => (
                  <span key={lang} className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                    {lang}: {count}
                  </span>
                ))}
                {Object.keys(dashboard.language_usage).length === 0 && <span className="text-sm text-slate-400">No conversations recorded yet.</span>}
              </div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Message Delivery Status</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(dashboard.delivery_status).map(([st, count]) => (
                  <span key={st} className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                    {st}: {count}
                  </span>
                ))}
                {Object.keys(dashboard.delivery_status).length === 0 && <span className="text-sm text-slate-400">No messages logged yet.</span>}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white overflow-x-auto">
            <h3 className="font-semibold text-slate-800 mb-3">Recent Conversations (Masked PII)</h3>
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 border-b">
                <tr>
                  <th className="py-2 pr-4">Phone (Masked)</th>
                  <th className="py-2 pr-4">Language</th>
                  <th className="py-2 pr-4">State</th>
                  <th className="py-2 pr-4">Linked</th>
                  <th className="py-2">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {dashboard.conversations.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2 pr-4 font-mono">{c.masked_phone}</td>
                    <td className="py-2 pr-4">{c.language}</td>
                    <td className="py-2 pr-4">{c.current_state}</td>
                    <td className="py-2 pr-4">{c.account_linked ? "Yes" : "No"}</td>
                    <td className="py-2 text-slate-500">{c.last_active_at ? new Date(c.last_active_at).toLocaleString() : "—"}</td>
                  </tr>
                ))}
                {dashboard.conversations.length === 0 && (
                  <tr><td colSpan={5} className="py-4 text-center text-slate-400">No conversations yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === "tickets" && (
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
          {tickets.map((t) => (
            <div key={t.id} className="p-3 rounded-lg border border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-semibold text-slate-800 flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-emerald-600" />
                  {t.ticket_id} <span className="text-xs px-2 py-0.5 rounded bg-slate-100">{t.status}</span>
                </div>
                <p className="text-sm text-slate-600 mt-1">{t.query_summary}</p>
              </div>
              {t.status !== "RESOLVED" && (
                <button onClick={() => resolveTicket(t.ticket_id)} className="px-3 py-1.5 rounded bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700">
                  Mark Resolved
                </button>
              )}
            </div>
          ))}
          {tickets.length === 0 && <p className="text-sm text-slate-400">No support tickets found.</p>}
        </div>
      )}

      {subTab === "unanswered" && (
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
          {unanswered.map((u) => (
            <div key={u.id} className="p-3 rounded-lg border border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  {u.masked_phone} • {u.language} • {u.reason}
                </div>
                <p className="text-sm text-slate-800 mt-1">{u.question_text}</p>
              </div>
              {!u.resolved ? (
                <button onClick={() => resolveUnanswered(u.id)} className="px-3 py-1.5 rounded bg-emerald-600 text-white text-xs font-medium">
                  Mark Addressed
                </button>
              ) : (
                <span className="text-xs text-emerald-700 font-medium">Resolved</span>
              )}
            </div>
          ))}
          {unanswered.length === 0 && <p className="text-sm text-slate-400">No unanswered questions logged.</p>}
        </div>
      )}

      {subTab === "errors" && (
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-4">
          <h3 className="font-semibold text-slate-800">Failed Messages & Turn Errors</h3>
          {errors.failed_messages.map((m) => (
            <div key={`m-${m.id}`} className="p-3 rounded bg-red-50 text-xs text-red-800">
              [{m.masked_phone}] {m.message_type}: {m.error_message || "Delivery failed"}
            </div>
          ))}
          {errors.failed_turns.map((t) => (
            <div key={`t-${t.id}`} className="p-3 rounded bg-amber-50 text-xs text-amber-800">
              [{t.language}] {t.intent || "unknown"}: {t.error_code || "Turn error"} ({t.latency_ms} ms)
            </div>
          ))}
          {errors.failed_messages.length === 0 && errors.failed_turns.length === 0 && (
            <p className="text-sm text-slate-400">No failed messages or turn errors.</p>
          )}
        </div>
      )}

      {subTab === "knowledge" && (
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
          {knowledge.map((k) => (
            <div key={k.source} className="p-3 rounded-lg border border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-medium text-slate-800 text-sm">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                {k.source}
              </div>
              <div className="text-xs text-slate-500">
                {k.chunks} chunks • Topics: {k.topics.join(", ") || "general"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
