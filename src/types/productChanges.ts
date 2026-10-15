export type ProductChangeKind = "CREATE" | "UPDATE" | "ADD_PACK_SIZE";
export type ProductChangeStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface ProductChangeDiffRow {
	field: string;
	label: string;
	before: unknown;
	after: unknown;
}

export interface ProductChange {
	id: string;
	kind: ProductChangeKind;
	changeStatus: ProductChangeStatus;
	itemId: string | null;
	productName: string;
	payload: Record<string, any> | null;
	previous: Record<string, any> | null;
	note: string | null;
	requestedById: string | number;
	requestedByName: string;
	requestedAt: string;
	decidedById: string | number | null;
	decidedByName: string | null;
	decidedAt: string | null;
	decisionNote: string | null;
	appliedItemIds: string[] | null;
	categoryName?: string | null;
	diff?: ProductChangeDiffRow[];
}
