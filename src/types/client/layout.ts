import { ReactNode } from "react";

export interface LayoutProps {
	children: ReactNode;
	pageTitle?: string | null;
	isLoading?: boolean;
}
