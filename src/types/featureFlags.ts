export interface FlagConfig {
	name: string;
	description: string;
	module: string;
	enabled: boolean;
	/** 0-100 */
	rolloutPercentage: number;
	/** Role names */
	targetRoles: string[];
	/** Profile ids */
	targetAccountIds: string[];
}

export type FlagSnapshot = FlagConfig & { key: string };
export type FeatureFlagChangeKind = "CREATE" | "UPDATE" | "DELETE";
export type FeatureFlagChangeStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface FeatureFlagChange {
	id: string;
	flagId: string | null;
	flagKey: string;
	kind: FeatureFlagChangeKind;
	/** The change's workflow state. (Not `status`: that name belongs to the entity's own active/inactive flag.) */
	changeStatus: FeatureFlagChangeStatus;
	emergency: boolean;
	reason: string;
	previous: FlagSnapshot | null;
	proposed: FlagSnapshot | null;
	requestedById: string;
	requestedByName: string;
	requestedAt: string;
	decidedById: string | null;
	decidedByName: string | null;
	decidedAt: string | null;
	decisionNote: string | null;
}

export interface FeatureFlag extends FlagConfig {
	id: string;
	key: string;
	system: boolean;
	createdAt: string;
	updatedAt: string;
	pendingChange: FeatureFlagChange | null;
	/** What the current visitor-agnostic evaluation resolves to. */
	effective: boolean;
}

export type FeatureFlagDetail = FeatureFlag & { history: FeatureFlagChange[] };
