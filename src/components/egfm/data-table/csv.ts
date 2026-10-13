import * as React from "react";

/**
 * Plain text of a rendered cell, so columns built with `cell` export without
 * each needing an `exportValue`. Walks host-element children only — it doesn't
 * call function components, so a cell whose text lives inside one (rather
 * than in the JSX passed to it) needs an explicit `exportValue`.
 */
export function nodeText(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeText).filter(Boolean).join(" ");
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) return nodeText(node.props.children);
  return "";
}

/** One quoted CSV field, same quoting as MuiTable's buildCSV, plus a formula-injection guard for spreadsheet apps. */
export function csvField(value: unknown): string {
  let s = String(value ?? "").replace(/\s+/g, " ").trim();
  if (/^[=+\-@]/.test(s) && Number.isNaN(Number(s))) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export function toCsv(headers: string[], rows: unknown[][]): string {
  return [headers, ...rows].map((r) => r.map(csvField).join(",")).join("\n");
}

export function downloadCsv(fileName: string, csv: string) {
  // BOM so Excel reads accented producer/supplier names as UTF-8.
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName.endsWith(".csv") ? fileName : `${fileName}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
