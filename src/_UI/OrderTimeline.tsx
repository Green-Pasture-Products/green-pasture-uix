"use client";

import React from "react";
import OrderProgress from "@/_UI/OrderProgress";

interface OrderTimelineProps {
	status: string;
	createdAt: string;
	shippingDate?: string;
	deliveredDate?: string;
}

function formatDate(dateStr?: string): string | undefined {
	if (!dateStr) return undefined;
	try {
		return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
	} catch {
		return undefined;
	}
}

/** The customer's order tracking card: the same animated journey the admin sees, with the dates the customer cares about. */
const OrderTimeline: React.FC<OrderTimelineProps> = ({ status, createdAt, shippingDate, deliveredDate }) => (
	<div
		className="rounded-xl overflow-hidden"
		style={{
			background: "var(--surface-paper)",
			border: "1px solid var(--border-light)",
			boxShadow: "var(--shadow-sm)",
		}}
	>
		<div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
			<h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
				Order Timeline
			</h3>
		</div>
		<div className="px-5 py-6">
			<OrderProgress
				status={status}
				labels={{ PENDING: "Order placed" }}
				details={{ PENDING: formatDate(createdAt), IN_TRANSIT: formatDate(shippingDate), DELIVERED: formatDate(deliveredDate) }}
			/>
		</div>
	</div>
);

export default OrderTimeline;
