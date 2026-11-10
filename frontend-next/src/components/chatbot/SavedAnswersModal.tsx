"use client";

import React, { useState } from "react";
import { X, Bookmark, Search, Trash2, Copy, Check, MessageSquare, Download } from "lucide-react";
import { SavedAnswer } from "@/lib/conversation-store";

interface SavedAnswersModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedAnswers: SavedAnswer[];
  onRemoveAnswer: (id: string) => void;
  onAskQuestion?: (q: string) => void;
}

export function SavedAnswersModal({
  isOpen,
  onClose,
  savedAnswers,
  onRemoveAnswer,
  onAskQuestion
}: SavedAnswersModalProps) {
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = savedAnswers.filter(
    (a) =>
      a.question.toLowerCase().includes(search.toLowerCase()) ||
      a.answer.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedAnswers, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `kisaanbuddy_saved_answers_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-card border border-border/80 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-border/60 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
              <Bookmark className="w-5 h-5 fill-amber-500/20" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Saved Farming Answers ({savedAnswers.length})</h3>
              <p className="text-xs text-muted-foreground">Your bookmarked agronomic recommendations, dosages and scheme details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Export Toolbar */}
        <div className="p-3 border-b border-border/50 flex items-center gap-2 bg-muted/5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search saved advice, chemicals, dosage..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-border/60 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          {savedAnswers.length > 0 && (
            <button
              onClick={handleExport}
              className="flex items-center gap-1 py-1.5 px-3 rounded-xl border border-border/60 bg-background hover:bg-muted text-xs font-semibold text-foreground transition-colors shrink-0"
              title="Export as JSON"
            >
              <Download className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Export</span>
            </button>
          )}
        </div>

        {/* Answers List */}
        <div className="p-4 overflow-y-auto space-y-3 custom-scrollbar flex-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
              <Bookmark className="w-8 h-8 mx-auto text-muted-foreground/30" />
              <p className="font-semibold">No saved answers found</p>
              <p className="max-w-xs mx-auto text-[11px]">
                Bookmark any valuable response from the AI assistant by clicking the bookmark icon on message bubbles.
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl border border-border/60 bg-background/80 hover:border-border transition-all space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <h4 className="font-bold text-foreground text-xs leading-snug">{item.question}</h4>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {new Date(item.dateSaved).toLocaleDateString()}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-muted/30 border border-border/40 text-foreground/90 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto custom-scrollbar text-[11px]">
                  {item.answer}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
                  {onAskQuestion && (
                    <button
                      onClick={() => {
                        onAskQuestion(item.question);
                        onClose();
                      }}
                      className="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      Ask Follow-up
                    </button>
                  )}
                  <div className="flex items-center gap-1 ml-auto">
                    <button
                      onClick={() => handleCopy(item.id, `${item.question}\n\n${item.answer}`)}
                      className="p-1 text-muted-foreground hover:text-foreground rounded"
                      title="Copy to clipboard"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => onRemoveAnswer(item.id)}
                      className="p-1 text-muted-foreground hover:text-red-500 rounded"
                      title="Delete saved answer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
