import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import { BackButton, DetailHeader, DetailSection, DetailRow } from "@/_UI/DetailField";
import Badge from "@/_UI/Badge";
import { formatPhoneDisplay } from "@/_UI/FormatValue";
import axiosInstance from "@/_utils/axiosInstance";
import { BackendStaff } from "@/types";

const StaffDetail: React.FC = () => {
	const router = useRouter();
	const { id } = router.query;
	const [staff, setStaff] = useState<BackendStaff | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!router.isReady || !id) return;
		setLoading(true);
		axiosInstance
			.get(`staff/${id}`)
			.then((res) => {
				setStaff(res.data?.data ?? res.data);
			})
			.catch(() => {
				setStaff(null);
			})
			.finally(() => {
				setLoading(false);
			});
	}, [id, router.isReady]);

	if (loading) {
		return (
			<AdminLayout>
				<div className="max-w-4xl mx-auto space-y-5 animate-page-enter">
					<div className="h-8 w-20 rounded animate-pulse" style={{ background: "var(--surface-medium)" }} />
					<div className="h-40 rounded-xl animate-pulse" style={{ background: "var(--surface-medium)" }} />
					<div className="h-48 rounded-xl animate-pulse" style={{ background: "var(--surface-medium)" }} />
				</div>
			</AdminLayout>
		);
	}

	if (!staff) {
		return (
			<AdminLayout>
				<div className="max-w-4xl mx-auto space-y-5 animate-page-enter">
					<BackButton />
					<div
						className="rounded-xl px-6 py-16 text-center"
						style={{ background: "var(--surface-paper)", border: "1px solid var(--border-light)" }}
					>
						<p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
							Staff member not found
						</p>
					</div>
				</div>
			</AdminLayout>
		);
	}

	const profile = staff.profile;

	return (
		<AdminLayout>
			<div className="max-w-4xl mx-auto space-y-5 animate-page-enter">
				<BackButton />

				<DetailHeader
					title={`${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`}
					subtitle="Staff Member"
					status={
						<Badge variant={staff.status === "ACTIVE" ? "success" : "neutral"} dot>
							{staff.status}
						</Badge>
					}
				/>

				<DetailSection title="Profile Information">
					<DetailRow label="Email" value={profile?.email} />
					<DetailRow label="Phone" value={formatPhoneDisplay(profile?.phoneNumber)} />
					<DetailRow label="Gender" value={profile?.gender ?? "—"} />
					<DetailRow
						label="Role"
						value={
							<Badge variant="info">
								{profile?.profileType ?? "Staff"}
							</Badge>
						}
					/>
					<DetailRow
						label="Status"
						value={
							<Badge variant={staff.status === "ACTIVE" ? "success" : "neutral"} dot>
								{staff.status}
							</Badge>
						}
					/>
					<DetailRow
						label="Joined"
						value={new Date(staff.createdAt).toLocaleDateString("en-US", {
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					/>
				</DetailSection>
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(StaffDetail);
