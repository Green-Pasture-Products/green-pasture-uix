export interface InboxNotification {
	id: string;
	title: string;
	message: string;
	type: string;
	isRead: boolean;
	metadata?: Record<string, any> | null;
	createdAt: string;
}

export interface ActivityEventRow {
	id: string;
	occurredAt: string;
	action: "CREATE" | "UPDATE" | "DELETE" | "SECURITY";
	actorId: string | null;
	actorName: string;
	entityType: string;
	entityId: string | null;
	summary: string;
	changes: Record<string, [unknown, unknown]> | null;
}

export type AnnouncementAudience = "ALL" | "CUSTOMERS" | "STAFF";

export interface Announcement {
	id: string;
	title: string;
	message: string;
	audience: AnnouncementAudience;
	isActive: boolean;
	expiresAt: string | null;
	createdByName: string | null;
	createdAt: string;
}

export interface PageMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}
