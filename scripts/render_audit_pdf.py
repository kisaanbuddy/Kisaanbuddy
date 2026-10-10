"""Render the KisaanBuddy AI audit Markdown into a print-ready HTML document."""
from __future__ import annotations

import html
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "KISAANBUDDY_AI_VOICE_AUDIT_2026-09-29.md"
OUTPUT = ROOT / "tmp" / "pdfs" / "kisaanbuddy_ai_voice_audit.html"


def inline(text: str) -> str:
    value = html.escape(text)
    value = re.sub(r"`([^`]+)`", r"<code>\1</code>", value)
    value = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", value)
    value = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', value)
    return value


def table_cell(cell: str) -> str:
    return inline(cell.strip())


def render_table(rows: list[str]) -> str:
    parsed = [[part.strip() for part in row.strip().strip("|").split("|")] for row in rows]
    if len(parsed) < 2:
        return ""
    header = parsed[0]
    body = parsed[2:] if re.match(r"^[|\s:-]+$", rows[1]) else parsed[1:]
    head = "".join(f"<th>{table_cell(c)}</th>" for c in header)
    rendered = []
    for row in body:
        padded = row + [""] * max(0, len(header) - len(row))
        rendered.append("<tr>" + "".join(f"<td>{table_cell(c)}</td>" for c in padded[:len(header)]) + "</tr>")
    return "<div class='table-wrap'><table><thead><tr>" + head + "</tr></thead><tbody>" + "".join(rendered) + "</tbody></table></div>"


def render_markdown(markdown: str) -> str:
    lines = markdown.splitlines()
    parts: list[str] = []
    index = 0
    while index < len(lines):
        line = lines[index]
        if not line.strip():
            index += 1
            continue
        if line.startswith("```"):
            block: list[str] = []
            index += 1
            while index < len(lines) and not lines[index].startswith("```"):
                block.append(lines[index])
                index += 1
            parts.append("<pre><code>" + html.escape("\n".join(block)) + "</code></pre>")
            index += 1
            continue
        if line.startswith("|"):
            rows: list[str] = []
            while index < len(lines) and lines[index].startswith("|"):
                rows.append(lines[index])
                index += 1
            parts.append(render_table(rows))
            continue
        heading = re.match(r"^(#{1,4})\s+(.+)$", line)
        if heading:
            level = len(heading.group(1))
            parts.append(f"<h{level}>{inline(heading.group(2))}</h{level}>")
            index += 1
            continue
        if re.match(r"^-{3,}\s*$", line):
            parts.append("<hr>")
            index += 1
            continue
        if line.startswith("> "):
            parts.append("<blockquote>" + inline(line[2:]) + "</blockquote>")
            index += 1
            continue
        if re.match(r"^-\s+", line):
            items: list[str] = []
            while index < len(lines) and re.match(r"^-\s+", lines[index]):
                items.append("<li>" + inline(re.sub(r"^-\s+", "", lines[index])) + "</li>")
                index += 1
            parts.append("<ul>" + "".join(items) + "</ul>")
            continue
        if re.match(r"^\d+\.\s+", line):
            items = []
            while index < len(lines) and re.match(r"^\d+\.\s+", lines[index]):
                items.append("<li>" + inline(re.sub(r"^\d+\.\s+", "", lines[index])) + "</li>")
                index += 1
            parts.append("<ol>" + "".join(items) + "</ol>")
            continue
        paragraph = [line]
        index += 1
        while index < len(lines):
            next_line = lines[index]
            if not next_line.strip() or next_line.startswith(("#", "|", "```", "> ", "- ")) or re.match(r"^\d+\.\s+", next_line):
                break
            paragraph.append(next_line)
            index += 1
        parts.append("<p>" + inline(" ".join(part.strip() for part in paragraph)) + "</p>")
    return "\n".join(parts)


def main() -> None:
    body = render_markdown(SOURCE.read_text(encoding="utf-8"))
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(
        """<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>KisaanBuddy AI + Voice Technical and Humanization Audit</title>
<style>
@page { size: A4; margin: 15mm 12mm 16mm; }
* { box-sizing: border-box; }
body { color:#17212b; font: 9.4pt/1.48 'Segoe UI','Nirmala UI','Mangal',Arial,sans-serif; }
h1,h2,h3,h4 { color:#075b42; line-height:1.2; page-break-after:avoid; }
h1 { font-size:25pt; border-bottom:4px solid #11966a; padding:0 0 8pt; margin:0 0 14pt; }
h2 { font-size:16pt; margin:25pt 0 10pt; border-bottom:1.5pt solid #80c9ad; padding-bottom:4pt; }
h3 { font-size:12pt; margin:16pt 0 6pt; } h4 { font-size:10pt; margin:12pt 0 5pt; }
p { margin:0 0 8pt; } strong { color:#063f30; } a { color:#0969a8; text-decoration:none; }
code { font:8.1pt Consolas,'Courier New',monospace; background:#eef6f2; padding:1pt 2pt; border-radius:2pt; }
pre { white-space:pre-wrap; background:#f3f7f5; border-left:3pt solid #20a374; padding:8pt; margin:8pt 0 11pt; page-break-inside:avoid; }
pre code { background:transparent; padding:0; } hr { border:0; border-top:1pt solid #b9d9ce; margin:17pt 0; }
ul,ol { margin:3pt 0 10pt 16pt; padding:0; } li { margin:2pt 0; } blockquote { margin:8pt 0; padding:7pt 9pt; background:#f1faf6; border-left:3pt solid #23a476; }
.table-wrap { margin:8pt 0 13pt; overflow:visible; } table { width:100%; border-collapse:collapse; font-size:7.2pt; line-height:1.28; page-break-inside:auto; }
thead { display:table-header-group; } tr { page-break-inside:avoid; } th { background:#075b42; color:white; text-align:left; padding:4.3pt; font-weight:700; } td { border:0.45pt solid #c9ddd5; vertical-align:top; padding:3.7pt; } tbody tr:nth-child(even) { background:#f5faf7; }
</style></head><body>""" + body + "</body></html>",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
