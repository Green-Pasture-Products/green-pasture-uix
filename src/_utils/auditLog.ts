import type { ActivityEventRow } from "@/types/live";

export type AuditKind = { label: string; variant: "info" | "success" | "warning" | "error" | "neutral" };

/** What an audit entry is, in the words an admin would use. */
export function auditKind(e: Pick<ActivityEventRow, "action" | "metadata">): AuditKind {
	switch (e.action) {
		case "REQUEST":
			return { label: "Request", variant: "neutral" };
		case "SECURITY":
			return e.metadata?.event === "sign-in" ? { label: "Sign-in", variant: "info" } : { label: "Security", variant: "warning" };
		case "CREATE":
			return { label: "Created", variant: "success" };
		case "UPDATE":
			return { label: "Updated", variant: "info" };
		case "DELETE":
			return { label: "Deleted", variant: "error" };
		case "COMMENT":
			return { label: "Comment", variant: "neutral" };
		default:
			return { label: e.action, variant: "neutral" };
	}
}

export const auditFailed = (e: Pick<ActivityEventRow, "metadata">) => e.metadata?.outcome === "failed";

/** Customer, Staff, Anonymous (a sign-in that never identified anyone) or System (jobs, webhooks, seeders). */
export function actorLabel(type?: string | null): string {
	switch (type) {
		case "CLIENT":
			return "Customer";
		case "STAFF":
			return "Staff";
		case "ANONYMOUS":
			return "Anonymous";
		case "SYSTEM":
			return "System";
		default:
			return "—";
	}
}
