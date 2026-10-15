import React from "react";
import Link from "next/link";

/** A calm, centred card for a page whose feature is switched off. */
const FeatureNotice: React.FC<{ message: string; href: string; linkLabel: string }> = ({ message, href, linkLabel }) => (
	<div className="gp-feature-in flex min-h-[50vh] items-center justify-center p-4" data-testid="feature-notice">
		<div className="w-full max-w-md rounded-2xl p-8 text-center" style={{ background: "var(--surface-paper)", border: "1px solid var(--border-light)" }}>
			<p className="text-sm" style={{ color: "var(--text-secondary)" }}>
				{message}
			</p>
			<Link href={href} className="mt-4 inline-block text-sm font-medium hover:underline" style={{ color: "var(--color-primary)" }}>
				{linkLabel}
			</Link>
		</div>
	</div>
);

export default FeatureNotice;
