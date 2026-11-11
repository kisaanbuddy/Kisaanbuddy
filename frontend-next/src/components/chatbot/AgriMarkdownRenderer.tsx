"use client";

import React from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ListChecks,
  PhoneCall,
  SearchCheck,
  ShieldAlert,
  Sprout,
} from "lucide-react";

interface AgriMarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
  onOpenDirectory?: () => void;
}

type SectionTheme = {
  border: string;
  bg: string;
  titleColor: string;
  icon: React.ComponentType<{ className?: string }>;
  showDirectoryCta?: boolean;
};

function classifyAgriSection(headingText: string): SectionTheme | null {
  const h = headingText.toLowerCase();

  if (
    h.includes("problem identified") ||
    h.includes("problem explanation") ||
    h.includes("समस्या की पहचान") ||
    h.includes("पहचान") ||
    h.includes("disease:") ||
    h.includes("crop:")
  ) {
    return {
      border: "border-l-emerald-600 border-emerald-200/80 dark:border-emerald-800/60",
      bg: "bg-emerald-50/50 dark:bg-emerald-950/20",
      titleColor: "text-emerald-900 dark:text-emerald-300",
      icon: SearchCheck,
    };
  }

  if (
    h.includes("possible cause") ||
    h.includes("causes") ||
    h.includes("संभावित कारण") ||
    h.includes("कारण")
  ) {
    return {
      border: "border-l-amber-500 border-amber-200/70 dark:border-amber-800/50",
      bg: "bg-amber-50/40 dark:bg-amber-950/15",
      titleColor: "text-amber-900 dark:text-amber-300",
      icon: AlertCircle,
    };
  }

  if (
    h.includes("recommended solution") ||
    h.includes("organic treatment") ||
    h.includes("chemical treatment") ||
    h.includes("अनुशंसित समाधान") ||
    h.includes("समाधान") ||
    h.includes("जैविक") ||
    h.includes("रासायनिक") ||
    h.includes("उपचार")
  ) {
    return {
      border: "border-l-emerald-700 border-emerald-200/80 dark:border-emerald-700/60",
      bg: "bg-emerald-50/70 dark:bg-emerald-950/30",
      titleColor: "text-emerald-950 dark:text-emerald-200",
      icon: Sprout,
    };
  }

  if (
    h.includes("step-by-step") ||
    h.includes("instructions") ||
    h.includes("prevention") ||
    h.includes("कदम-दर-कदम") ||
    h.includes("निर्देश") ||
    h.includes("रोकथाम")
  ) {
    return {
      border: "border-l-teal-600 border-teal-200/70 dark:border-teal-800/50",
      bg: "bg-teal-50/40 dark:bg-teal-950/15",
      titleColor: "text-teal-950 dark:text-teal-300",
      icon: ListChecks,
    };
  }

  if (
    h.includes("precaution") ||
    h.includes("safety") ||
    h.includes("सावधान") ||
    h.includes("सुरक्षा") ||
    h.includes("चेतावनी")
  ) {
    return {
      border: "border-l-orange-500 border-orange-200/80 dark:border-orange-800/60",
      bg: "bg-orange-50/55 dark:bg-orange-950/20",
      titleColor: "text-orange-950 dark:text-orange-300",
      icon: ShieldAlert,
    };
  }

  if (
    h.includes("contact an agricultural expert") ||
    h.includes("when to contact") ||
    h.includes("market advice") ||
    h.includes("विशेषज्ञ से") ||
    h.includes("कब संपर्क") ||
    h.includes("कृषि विज्ञान केंद्र")
  ) {
    return {
      border: "border-l-emerald-800 border-emerald-200/80 dark:border-emerald-700/60",
      bg: "bg-emerald-50/40 dark:bg-emerald-950/20",
      titleColor: "text-emerald-950 dark:text-emerald-300",
      icon: PhoneCall,
      showDirectoryCta: true,
    };
  }

  return null;
}

/**
 * Safely render inline markdown: **bold**, *italic*, `code`, [label](url), and bare URLs.
 */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const tokenRegex =
    /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^\s)]+\)|https?:\/\/[^\s),;]+|\*[^*\n]+\*)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let idx = 0;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    const key = `${keyPrefix}-${idx++}`;

    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={key} className="font-bold text-foreground">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code
          key={key}
          className="px-1.5 py-0.5 rounded-md bg-emerald-950/5 dark:bg-white/10 font-mono text-[0.85em] text-emerald-900 dark:text-emerald-300"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("[") && token.includes("](")) {
      const m = /^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/.exec(token);
      if (m) {
        parts.push(
          <a
            key={key}
            href={m[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 font-semibold text-emerald-700 dark:text-emerald-400 underline decoration-emerald-500/40 underline-offset-2 hover:text-emerald-800 dark:hover:text-emerald-300"
          >
            <span>{m[1]}</span>
            <ExternalLink className="w-3 h-3 inline shrink-0" />
          </a>
        );
      } else {
        parts.push(token);
      }
    } else if (token.startsWith("http://") || token.startsWith("https://")) {
      const cleanUrl = token.replace(/[.,;!?]+$/, "");
      const trailing = token.slice(cleanUrl.length);
      parts.push(
        <React.Fragment key={key}>
          <a
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 font-semibold text-emerald-700 dark:text-emerald-400 underline decoration-emerald-500/40 underline-offset-2 hover:text-emerald-800 break-all"
          >
            <span>{cleanUrl.replace(/^https?:\/\//, "")}</span>
            <ExternalLink className="w-3 h-3 inline shrink-0" />
          </a>
          {trailing}
        </React.Fragment>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(
        <em key={key} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    } else {
      parts.push(token);
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

type BlockNode =
  | { type: "heading"; level: number; text: string }
  | { type: "bullet-list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "blockquote"; lines: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "paragraph"; lines: string[] };

function parseBlocks(raw: string): BlockNode[] {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const blocks: BlockNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Markdown heading: #, ##, ###, ####
    const headingMatch = /^(#{1,4})\s+(.+)$/.exec(trimmed);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2].replace(/\*\*/g, "").trim(),
      });
      i++;
      continue;
    }

    // Bold standalone section header like "**Problem Identified:**" or "6. 🏠 Organic Treatment:"
    const boldHeaderMatch = /^\*\*([^*]{3,70}):?\*\*$/.exec(trimmed);
    if (boldHeaderMatch && classifyAgriSection(boldHeaderMatch[1])) {
      blocks.push({
        type: "heading",
        level: 3,
        text: boldHeaderMatch[1].replace(/:$/, "").trim(),
      });
      i++;
      continue;
    }

    // Markdown table
    if (
      trimmed.startsWith("|") &&
      i + 1 < lines.length &&
      /^\|?\s*[-:|\s]+\|?\s*$/.test(lines[i + 1].trim())
    ) {
      const parseRow = (rowLine: string) =>
        rowLine
          .trim()
          .replace(/^\|/, "")
          .replace(/\|$/, "")
          .split("|")
          .map((c) => c.trim());
      const headers = parseRow(trimmed);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(parseRow(lines[i]));
        i++;
      }
      blocks.push({ type: "table", headers, rows });
      continue;
    }

    // Blockquote
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ type: "blockquote", lines: quoteLines });
      continue;
    }

    // Bullet list
    if (/^([-*•])\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^([-*•])\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^([-*•])\s+/, ""));
        i++;
      }
      blocks.push({ type: "bullet-list", items });
      continue;
    }

    // Ordered list (1. ..., 2. ...)
    if (/^\d+[.)]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+[.)]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+[.)]\s+/, ""));
        i++;
      }
      blocks.push({ type: "ordered-list", items });
      continue;
    }

    // Paragraph (gather until blank line or next structural block)
    const paraLines: string[] = [];
    while (i < lines.length) {
      const cur = lines[i].trim();
      if (
        !cur ||
        /^(#{1,4})\s+/.test(cur) ||
        /^([-*•])\s+/.test(cur) ||
        /^\d+[.)]\s+/.test(cur) ||
        cur.startsWith(">") ||
        (cur.startsWith("|") && i + 1 < lines.length && /^\|?\s*[-:|\s]+\|?\s*$/.test(lines[i + 1].trim()))
      ) {
        break;
      }
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: "paragraph", lines: paraLines });
    }
  }

  return blocks;
}

export function AgriMarkdownRenderer({
  content,
  isStreaming = false,
  onOpenDirectory,
}: AgriMarkdownRendererProps) {
  const blocks = parseBlocks(content);

  // Group blocks under structured agricultural sections when headings match known themes
  const rendered: React.ReactNode[] = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];

    if (block.type === "heading") {
      const theme = classifyAgriSection(block.text);
      if (theme) {
        const sectionBlocks: BlockNode[] = [];
        let j = i + 1;
        while (j < blocks.length && blocks[j].type !== "heading") {
          sectionBlocks.push(blocks[j]);
          j++;
        }

        const Icon = theme.icon;
        rendered.push(
          <div
            key={`sec-${i}`}
            className={`my-2.5 rounded-2xl border border-l-4 px-3.5 py-3 ${theme.border} ${theme.bg} space-y-2`}
          >
            <div className={`flex items-center gap-2 text-xs sm:text-[13px] font-bold ${theme.titleColor}`}>
              <Icon className="w-4 h-4 shrink-0" />
              <span>{block.text}</span>
            </div>

            {sectionBlocks.length > 0 && (
              <div className="space-y-1.5 text-[13px] sm:text-sm leading-relaxed text-foreground/90">
                {sectionBlocks.map((sb, sbIdx) => renderStandardBlock(sb, `sec-${i}-${sbIdx}`))}
              </div>
            )}

            {theme.showDirectoryCta && onOpenDirectory && (
              <button
                type="button"
                onClick={onOpenDirectory}
                className="inline-flex items-center gap-1.5 mt-1 px-3 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-emerald-600/30 hover:border-emerald-600 text-emerald-800 dark:text-emerald-300 text-xs font-semibold shadow-2xs transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                <span>View Verified KVK & Helpline Numbers</span>
              </button>
            )}
          </div>
        );
        i = j;
        continue;
      }
    }

    rendered.push(renderStandardBlock(block, `blk-${i}`));
    i++;
  }

  return (
    <div className="space-y-2 text-[13.5px] sm:text-[14.5px] leading-relaxed text-foreground selection:bg-emerald-500/20 break-words">
      {rendered}
      {isStreaming && (
        <span
          aria-hidden="true"
          className="inline-block w-2 h-4 ml-1 align-middle rounded-sm bg-emerald-600 animate-pulse"
        />
      )}
    </div>
  );
}

function renderStandardBlock(block: BlockNode, key: string): React.ReactNode {
  switch (block.type) {
    case "heading": {
      const sizeCls =
        block.level <= 2
          ? "text-sm sm:text-[15px] font-bold text-emerald-950 dark:text-emerald-200 pt-1.5"
          : "text-[13px] sm:text-sm font-bold text-emerald-900 dark:text-emerald-300 pt-1";
      return (
        <h4 key={key} className={sizeCls}>
          {renderInline(block.text, key)}
        </h4>
      );
    }

    case "bullet-list":
      return (
        <ul key={key} className="space-y-1.5 pl-1">
          {block.items.map((item, idx) => (
            <li key={`${key}-li-${idx}`} className="flex items-start gap-2">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
              <span className="flex-1">{renderInline(item, `${key}-li-${idx}`)}</span>
            </li>
          ))}
        </ul>
      );

    case "ordered-list":
      return (
        <ol key={key} className="space-y-1.5 pl-1">
          {block.items.map((item, idx) => (
            <li key={`${key}-ol-${idx}`} className="flex items-start gap-2.5">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-600/10 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <span className="flex-1">{renderInline(item, `${key}-ol-${idx}`)}</span>
            </li>
          ))}
        </ol>
      );

    case "blockquote":
      return (
        <blockquote
          key={key}
          className="border-l-3 border-emerald-500/60 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-r-xl px-3 py-2 text-xs sm:text-[13px] text-emerald-950/90 dark:text-emerald-200/90 space-y-1"
        >
          {block.lines.map((l, idx) => (
            <p key={`${key}-bq-${idx}`}>{renderInline(l, `${key}-bq-${idx}`)}</p>
          ))}
        </blockquote>
      );

    case "table":
      return (
        <div
          key={key}
          className="my-2 overflow-x-auto rounded-xl border border-emerald-900/10 dark:border-stone-700 bg-white dark:bg-stone-900/60"
        >
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-emerald-50/80 dark:bg-emerald-950/40 border-b border-emerald-900/10 dark:border-stone-700">
                {block.headers.map((h, idx) => (
                  <th
                    key={`${key}-th-${idx}`}
                    className="px-3 py-2 font-bold text-emerald-950 dark:text-emerald-200 whitespace-nowrap"
                  >
                    {renderInline(h, `${key}-th-${idx}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {block.rows.map((row, rIdx) => (
                <tr key={`${key}-tr-${rIdx}`} className="hover:bg-emerald-50/30 dark:hover:bg-stone-800/40">
                  {row.map((cell, cIdx) => (
                    <td key={`${key}-td-${rIdx}-${cIdx}`} className="px-3 py-2 text-foreground/90">
                      {renderInline(cell, `${key}-td-${rIdx}-${cIdx}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "paragraph":
    default:
      return (
        <div key={key} className="space-y-1">
          {block.lines.map((line, idx) => {
            // Highlight subtle safety/advisory callout lines
            const trimmed = line.trim();
            if (trimmed.startsWith("⚠️") || trimmed.toLowerCase().startsWith("safety")) {
              return (
                <p
                  key={`${key}-p-${idx}`}
                  className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200/80 dark:border-amber-800/50 text-xs sm:text-[13px] text-amber-950 dark:text-amber-200"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{renderInline(trimmed.replace(/^⚠️\s*/, ""), `${key}-p-${idx}`)}</span>
                </p>
              );
            }
            if (trimmed.startsWith("✅") || trimmed.startsWith("📞")) {
              return (
                <p
                  key={`${key}-p-${idx}`}
                  className="flex items-start gap-2 p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/25 border border-emerald-200/70 dark:border-emerald-800/50 text-xs sm:text-[13px] text-emerald-950 dark:text-emerald-200 font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{renderInline(trimmed, `${key}-p-${idx}`)}</span>
                </p>
              );
            }
            return (
              <p key={`${key}-p-${idx}`} className="leading-relaxed">
                {renderInline(line, `${key}-p-${idx}`)}
              </p>
            );
          })}
        </div>
      );
  }
}
