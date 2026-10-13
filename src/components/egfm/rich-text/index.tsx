import * as React from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import DOMPurify from "dompurify";
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Code, Italic, Link2, List, ListOrdered, Quote, Redo2, Strikethrough,
  Underline as UnderlineIcon, Undo2,
} from "lucide-react";
import { cn } from "../lib/utils";

/** The tags the editor makes; the server's allow-list (tradewings-api AnnouncementHtml) matches it. */
const ALLOWED_TAGS = ["p", "br", "strong", "em", "u", "s", "code", "blockquote", "ul", "ol", "li", "a"];
const TAG = /<\s*\/?\s*[a-zA-Z][^>]*>/;
const ALIGN = /text-align\s*:\s*(left|center|right|justify)/i;

/** Rich-text typography on the theme tokens, so it flips with light/dark. */
const RICH_TEXT = cn(
  "text-sm text-foreground break-words",
  "[&_p]:my-1 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_li>p]:my-0",
  "[&_blockquote]:my-1 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
  "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]",
  "[&_a]:text-brand-ink [&_a]:underline [&_strong]:font-semibold",
);

// DOMPurify only has its full API with a real DOM. This app renders on the server too, where the
// default export is an inert factory (no addHook/sanitize), so hooks are registered lazily in the browser.
let hooksReady = false;
function ensureHooks(): boolean {
  if (typeof window === "undefined" || typeof DOMPurify.addHook !== "function" || !DOMPurify.isSupported) return false;
  if (hooksReady) return true;
  hooksReady = true;
  DOMPurify.addHook("uponSanitizeAttribute", (_node, data) => {
    if (data.attrName !== "style") return;
    const m = ALIGN.exec(data.attrValue);
    if (m) data.attrValue = `text-align: ${m[1].toLowerCase()}`;
    else data.keepAttr = false;
  });
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A") {
      node.setAttribute("rel", "noopener noreferrer");
      node.setAttribute("target", "_blank");
    }
  });
  return true;
}

export type { Editor as RichTextEditorInstance } from "@tiptap/react";

/** Text without tags (older plain-text records) is text, not markup. */
export function isHtml(value: string | null | undefined): boolean {
  return !!value && TAG.test(value);
}

export function sanitizeHtml(html: string): string {
  // No DOM (server render): emit nothing rather than unsanitised markup.
  if (!ensureHooks()) return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ["href", "style"],
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:)/i,
  });
}

/** The words a reader sees: what required and max-length checks should count, not the markup. */
export function richTextToPlain(value: string | null | undefined): string {
  if (!value) return "";
  if (!isHtml(value)) return value.trim();
  return (new DOMParser().parseFromString(value, "text/html").body.textContent ?? "").replace(/\s+/g, " ").trim();
}

export function SanitizedHtml({ html, className, fallback = null }: { html?: string | null; className?: string; fallback?: React.ReactNode }) {
  const clean = React.useMemo(() => (html && isHtml(html) ? sanitizeHtml(html) : null), [html]);
  if (!html?.trim()) return <>{fallback}</>;
  if (clean === null) return <div className={cn(RICH_TEXT, "whitespace-pre-wrap", className)}>{html}</div>;
  return <div className={cn(RICH_TEXT, className)} dangerouslySetInnerHTML={{ __html: clean }} />;
}

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  id?: string;
  placeholder?: string;
  minHeight?: number;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
}

export function RichTextEditor({ value, onChange, id, placeholder, minHeight = 140, "aria-label": ariaLabel, "aria-invalid": invalid }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        horizontalRule: false,
        trailingNode: false,
        link: { openOnClick: false, autolink: true, protocols: ["mailto"], HTMLAttributes: { rel: "noopener", target: null } },
      }),
      TextAlign.configure({ types: ["paragraph"] }),
    ],
    content: value || "",
    immediatelyRender: false,
    // An empty doc is "<p></p>"; report "" so required checks and dirty comparisons behave.
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
    editorProps: {
      attributes: {
        ...(id ? { id } : {}),
        ...(ariaLabel ? { "aria-label": ariaLabel } : {}),
        role: "textbox",
        "aria-multiline": "true",
        class: cn(RICH_TEXT, "px-3 py-2 focus:outline-none"),
        style: `min-height:${minHeight}px`,
      },
    },
  });

  // Push in values loaded after mount, but never echo our own edits back (that resets the cursor).
  React.useEffect(() => {
    if (editor && value && value !== editor.getHTML()) editor.commands.setContent(value, { emitUpdate: false });
  }, [value, editor]);

  React.useEffect(() => {
    editor?.setOptions({ editorProps: { attributes: { ...editor.options.editorProps.attributes, "aria-invalid": String(!!invalid) } } });
  }, [editor, invalid]);

  if (!editor) return <div className="w-full animate-pulse rounded-lg border border-border/80 bg-muted" style={{ height: minHeight + 44 }} aria-hidden="true" />;

  return (
    <div
      data-invalid={invalid || undefined}
      className={cn(
        "overflow-hidden rounded-lg border border-input bg-card shadow-xs transition-all duration-150",
        "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring",
        "data-[invalid]:border-destructive data-[invalid]:focus-within:ring-destructive",
      )}
    >
      <Toolbar editor={editor} />
      <div className="relative">
        {editor.isEmpty && placeholder && <p className="pointer-events-none absolute px-3 py-2 text-sm text-muted-foreground">{placeholder}</p>}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function ToolbarButton({ onClick, active, label, disabled, children }: { onClick: () => void; active?: boolean; label: string; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()} // keep the selection while clicking
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={!!active}
      title={label}
      className={cn(
        "flex size-7 items-center justify-center rounded-md transition-colors disabled:opacity-30",
        active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

const Divider = () => <span className="mx-1 h-4 w-px shrink-0 bg-border" />;

const ALIGNMENTS = [["left", AlignLeft], ["center", AlignCenter], ["right", AlignRight], ["justify", AlignJustify]] as const;

function Toolbar({ editor }: { editor: Editor }) {
  const run = () => editor.chain().focus();
  return (
    <div role="toolbar" aria-label="Formatting" className="flex flex-wrap items-center gap-0.5 border-b border-border/80 bg-muted/50 px-1.5 py-1">
      <ToolbarButton onClick={() => run().undo().run()} disabled={!editor.can().undo()} label="Undo"><Undo2 className="size-3.5" /></ToolbarButton>
      <ToolbarButton onClick={() => run().redo().run()} disabled={!editor.can().redo()} label="Redo"><Redo2 className="size-3.5" /></ToolbarButton>
      <Divider />
      <ToolbarButton onClick={() => run().toggleBold().run()} active={editor.isActive("bold")} label="Bold"><Bold className="size-3.5" /></ToolbarButton>
      <ToolbarButton onClick={() => run().toggleItalic().run()} active={editor.isActive("italic")} label="Italic"><Italic className="size-3.5" /></ToolbarButton>
      <ToolbarButton onClick={() => run().toggleUnderline().run()} active={editor.isActive("underline")} label="Underline"><UnderlineIcon className="size-3.5" /></ToolbarButton>
      <ToolbarButton onClick={() => run().toggleStrike().run()} active={editor.isActive("strike")} label="Strikethrough"><Strikethrough className="size-3.5" /></ToolbarButton>
      <ToolbarButton onClick={() => run().toggleCode().run()} active={editor.isActive("code")} label="Code"><Code className="size-3.5" /></ToolbarButton>
      <Divider />
      {ALIGNMENTS.map(([align, Icon]) => (
        <ToolbarButton key={align} onClick={() => run().setTextAlign(align).run()} active={editor.isActive({ textAlign: align })} label={`Align ${align}`}>
          <Icon className="size-3.5" />
        </ToolbarButton>
      ))}
      <Divider />
      <ToolbarButton onClick={() => run().toggleBulletList().run()} active={editor.isActive("bulletList")} label="Bullet list"><List className="size-3.5" /></ToolbarButton>
      <ToolbarButton onClick={() => run().toggleOrderedList().run()} active={editor.isActive("orderedList")} label="Numbered list"><ListOrdered className="size-3.5" /></ToolbarButton>
      <ToolbarButton onClick={() => run().toggleBlockquote().run()} active={editor.isActive("blockquote")} label="Quote"><Quote className="size-3.5" /></ToolbarButton>
      <ToolbarButton
        onClick={() => {
          if (editor.isActive("link")) return void run().unsetLink().run();
          const url = window.prompt("Link URL (https:// or mailto:)");
          if (url) run().extendMarkRange("link").setLink({ href: url }).run();
        }}
        active={editor.isActive("link")}
        label="Link"
      >
        <Link2 className="size-3.5" />
      </ToolbarButton>
    </div>
  );
}
