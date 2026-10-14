import React from "react";
import { useHasPrivilege } from "@/_hooks/usePrivilege";

interface CanProps {
	/** Holding ANY of these (or SUPER_ADMIN) shows the children. */
	privilege: string | readonly string[];
	/** Shown instead when the user lacks the privilege; nothing by default. */
	fallback?: React.ReactNode;
	children: React.ReactNode;
}

/**
 * Hides UI the signed-in staff member has no privilege to use. This is a convenience, not security: the API enforces
 * the same authorities, so a hidden button is never the only thing standing between a user and an action.
 */
const Can: React.FC<CanProps> = ({ privilege, fallback = null, children }) => {
	const hasPrivilege = useHasPrivilege();
	return <>{hasPrivilege(privilege) ? children : fallback}</>;
};

export default Can;
