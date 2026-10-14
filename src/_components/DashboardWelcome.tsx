import React from "react";
import Link from "next/link";
import AdminLayout from "@/_components/AdminLayout";
import { useAppSelector } from "@/_redux/store";
import { useHasPrivilege } from "@/_hooks/usePrivilege";
import { MODULES } from "@/_navigations/modules";

/** Dashboard for staff whose roles don't include analytics: a greeting and shortcuts to what they can open. */
const DashboardWelcome: React.FC = () => {
	const user = useAppSelector((s) => s.auth.user);
	const hasPrivilege = useHasPrivilege();
	const shortcuts = MODULES.filter((m) => m.path !== "/admin/dashboard" && hasPrivilege(m.privilege));

	return (
		<AdminLayout>
			<div className="space-y-6" data-testid="dashboard-welcome">
				<div>
					<h2 className="text-xl font-medium tracking-tight">Welcome{user?.firstName ? `, ${user.firstName}` : ""}</h2>
					<p className="text-muted-foreground mt-1 text-sm">Here is what your role gives you access to.</p>
				</div>
				<div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
					{shortcuts.map((m) => (
						<Link key={m.path} href={m.path} className="flex items-center gap-3 rounded-xl border bg-card p-4 text-sm font-medium transition-colors hover:bg-muted">
							<m.icon size={18} style={{ color: "var(--color-primary)" }} />
							{m.title}
						</Link>
					))}
				</div>
			</div>
		</AdminLayout>
	);
};

export default DashboardWelcome;
