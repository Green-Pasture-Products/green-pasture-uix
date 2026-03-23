"use client";

import React from "react";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import Badge from "./Badge";

interface StatCardProps {
	title: string;
	value: string | number;
	change?: string;
	changeType?: "positive" | "negative" | "neutral";
	icon: LucideIcon;
	iconColor?: string;
	index?: number;
}

const StatCard: React.FC<StatCardProps> = ({
	title,
	value,
	change,
	changeType = "neutral",
	icon: Icon,
	iconColor,
	index = 0,
}) => {
	const changeBadgeVariant =
		changeType === "positive"
			? "success"
			: changeType === "negative"
				? "error"
				: "neutral";

	const ChangeIcon =
		changeType === "positive"
			? TrendingUp
			: changeType === "negative"
				? TrendingDown
				: null;

	return (
		<div
			className="animate-stat-pop opacity-0 rounded-xl bg-white dark:bg-white/[0.04] border border-[rgba(22,163,74,0.06)] dark:border-white/8 shadow-sm dark:shadow-none transition-all duration-300 p-6"
			style={{ animationDelay: `${index * 100}ms` }}
		>
			<div className="flex items-start justify-between">
				<div
					className={`p-3 rounded-xl ${
						iconColor
							? iconColor
							: "bg-primary-100 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"
					}`}
				>
					<Icon size={22} />
				</div>
				{change && (
					<Badge variant={changeBadgeVariant} size="sm" dot>
						<span className="inline-flex items-center gap-1">
							{ChangeIcon && <ChangeIcon size={12} />}
							{change}
						</span>
					</Badge>
				)}
			</div>
			<p className="text-sm text-on-surface-variant dark:text-white/50 mt-4">
				{title}
			</p>
			<p className="text-2xl font-bold text-on-surface dark:text-white/90 mt-1">
				{value}
			</p>
		</div>
	);
};

export default StatCard;
