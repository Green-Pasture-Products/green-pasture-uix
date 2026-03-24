import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import { BackButton, DetailHeader, DetailSection, DetailRow } from "@/_UI/DetailField";
import Badge from "@/_UI/Badge";
import { formatPhoneDisplay } from "@/_UI/FormatValue";
import PageLoader from "@/_UI/PageLoader";
import axiosInstance from "@/_utils/axiosInstance";
import { BackendCustomer } from "@/types";

const CustomerDetail: React.FC = () => {
	const router = useRouter();
	const { id } = router.query;
	const [customer, setCustomer] = useState<BackendCustomer | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!router.isReady || !id) return;
		setLoading(true);
		axiosInstance
			.get(`customers/${id}`)
			.then((res) => {
				setCustomer(res.data?.data ?? res.data);
			})
			.catch(() => {
				setCustomer(null);
			})
			.finally(() => {
				setLoading(false);
			});
	}, [id, router.isReady]);

	if (loading) {
		return (
			<AdminLayout>
				<PageLoader fullScreen={false} message="Loading customer details..." />
			</AdminLayout>
		);
	}

	if (!customer) {
		return (
			<AdminLayout>
				<div className="max-w-4xl mx-auto space-y-5 animate-page-enter">
					<BackButton />
					<div
						className="rounded-xl px-6 py-16 text-center"
						style={{ background: "var(--surface-paper)", border: "1px solid var(--border-light)" }}
					>
						<p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
							Customer not found
						</p>
					</div>
				</div>
			</AdminLayout>
		);
	}

	const profile = customer.profile;
	const address = profile?.address;

	return (
		<AdminLayout>
			<div className="max-w-4xl mx-auto space-y-5 animate-page-enter">
				<BackButton />

				<DetailHeader
					title={`${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`}
					subtitle={profile?.email}
					status={
						<Badge variant={customer.status === "ACTIVE" ? "success" : "neutral"} dot>
							{customer.status}
						</Badge>
					}
				/>

				<DetailSection title="Profile Information">
					<DetailRow label="Email" value={profile?.email} />
					<DetailRow label="Phone" value={formatPhoneDisplay(profile?.phoneNumber)} />
					<DetailRow label="Gender" value={profile?.gender ?? "—"} />
					<DetailRow
						label="Status"
						value={
							<Badge variant={customer.status === "ACTIVE" ? "success" : "neutral"} dot>
								{customer.status}
							</Badge>
						}
					/>
					<DetailRow
						label="Joined Date"
						value={new Date(customer.createdAt).toLocaleDateString("en-US", {
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					/>
				</DetailSection>

				{address && (
					<DetailSection title="Address">
						<DetailRow label="Street" value={address.street} />
						<DetailRow label="City" value={address.city} />
						<DetailRow label="State" value={address.state} />
						<DetailRow label="Country" value={address.country} />
						<DetailRow label="Postal Code" value={address.postalCode} />
					</DetailSection>
				)}
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(CustomerDetail);
