import React, { useState } from "react";
import { Download, Eye, X } from "lucide-react";
import { getReceiptDeliveryUrl, getReceiptPreviewUrl, isPdfReceipt } from "@/_utils/receiptUrl";

export interface ReceiptItem {
	id?: string;
	url?: string | null;
	fileName?: string | null;
	purgedAt?: string | null;
	createdAt?: string;
}

interface ReceiptListProps {
	receipts?: ReceiptItem[];
	/** Single-receipt fields on older payments that predate the receipts list. */
	legacyUrl?: string | null;
	legacyFileName?: string | null;
}

/** Every proof of payment on a payment, each viewable in a modal (PDFs show as a page-1 image) and downloadable. */
export const ReceiptList: React.FC<ReceiptListProps> = ({ receipts, legacyUrl, legacyFileName }) => {
	const [viewing, setViewing] = useState<ReceiptItem | null>(null);
	const list: ReceiptItem[] = receipts?.length ? receipts : legacyUrl ? [{ url: legacyUrl, fileName: legacyFileName }] : [];
	if (!list.length) return null;

	return (
		<>
			<ul className="space-y-2">
				{list.map((r, i) => (
					<li key={r.id ?? i} className="flex flex-wrap items-center gap-2">
						<span className="min-w-0 flex-1 truncate text-sm" style={{ color: "var(--text-secondary)" }}>
							{i + 1}. {r.fileName || "Uploaded receipt"}
						</span>
						{r.url ? (
							<>
								<button
									type="button"
									onClick={() => setViewing(r)}
									className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white"
									style={{ backgroundColor: "var(--color-primary)" }}
								>
									<Eye size={14} /> View
								</button>
								<a
									href={getReceiptDeliveryUrl(r.url, r.fileName ?? undefined)}
									target="_blank"
									rel="noopener noreferrer"
									download={r.fileName || true}
									className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium"
									style={{ borderColor: "var(--border-light)", color: "var(--text-primary)" }}
								>
									<Download size={14} /> Download
								</a>
							</>
						) : (
							<span className="text-xs" style={{ color: "var(--text-hint)" }}>
								File removed after delivery
							</span>
						)}
					</li>
				))}
			</ul>

			{viewing?.url && (
				<div
					className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 sm:p-4"
					role="dialog"
					aria-modal="true"
					onClick={(e) => e.target === e.currentTarget && setViewing(null)}
				>
					<div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
						<div className="flex items-center justify-between gap-3 border-b px-4 py-3">
							<p className="truncate text-sm font-semibold text-gray-900">{viewing.fileName || "Payment receipt"}</p>
							<div className="flex shrink-0 items-center gap-2">
								<a
									href={getReceiptDeliveryUrl(viewing.url, viewing.fileName ?? undefined)}
									target="_blank"
									rel="noopener noreferrer"
									download={viewing.fileName || true}
									className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm text-gray-700"
								>
									<Download size={16} /> <span className="hidden sm:inline">Download</span>
								</a>
								<button type="button" onClick={() => setViewing(null)} aria-label="Close receipt viewer" className="rounded-lg p-2 text-gray-600 hover:bg-gray-100">
									<X size={20} />
								</button>
							</div>
						</div>
						<div className="flex min-h-0 flex-1 items-start justify-center overflow-auto bg-gray-100 p-3">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={getReceiptPreviewUrl(viewing.url, viewing.fileName ?? undefined)}
								alt={viewing.fileName || "Payment receipt"}
								className="h-auto max-w-full object-contain"
							/>
						</div>
						{isPdfReceipt(viewing.url, viewing.fileName ?? undefined) && (
							<p className="border-t px-4 py-2 text-xs text-gray-500">Showing page 1 of the PDF. Use Download for the full document.</p>
						)}
					</div>
				</div>
			)}
		</>
	);
};

export default ReceiptList;
