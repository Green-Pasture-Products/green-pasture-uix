import React from "react";
import Link from "next/link";
import { ShieldOff } from "lucide-react";
import AdminLayout from "@/_components/AdminLayout";

/** Shown in place of an admin page the signed-in staff member's roles don't open. */
const NoAccess: React.FC<{ module?: string; reason?: string }> = ({ module, reason }) => (
	<AdminLayout pageTitle="No access">
		<div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center" data-testid="no-access">
			<span className="mb-4 flex size-12 items-center justify-center rounded-full" style={{ background: "var(--surface-medium)", color: "var(--text-hint)" }}>
				<ShieldOff size={22} />
			</span>
			<h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
				{reason ? `${module ?? "This section"} is unavailable` : <>You don&apos;t have access{module ? ` to ${module}` : ""}</>}
			</h1>
			<p className="mt-1 text-sm" style={{ color: "var(--text-hint)" }}>
				{reason ?? "Your role doesn&apos;t include this section. Ask an administrator if you need it."}
			</p>
			<Link href="/admin/dashboard" className="mt-5 inline-flex h-10 items-center rounded-lg px-6 text-sm font-medium hover:underline" style={{ color: "var(--color-primary)" }}>
				Back to dashboard
			</Link>
		</div>
	</AdminLayout>
);

export default NoAccess;
