import { createContext, useContext } from "react";
import { DEFAULTS, resolveFeature, type FeatureKey } from "@/_utils/featureFlags";

export interface FeaturesState {
	flags: Record<string, boolean>;
	/** True once the server has answered at least once. */
	ready: boolean;
	refresh: () => Promise<void>;
}

export const FeatureContext = createContext<FeaturesState>({ flags: DEFAULTS, ready: false, refresh: async () => {} });

export const useFeatures = () => useContext(FeatureContext);

/** Whether a feature flag is on for the current visitor. */
export function useFeature(key: FeatureKey): boolean {
	return resolveFeature(useContext(FeatureContext).flags, key);
}
