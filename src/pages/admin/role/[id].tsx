import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import withAdminAuth from '@/_components/withAdminAuth';
import AdminLayout from '@/_components/AdminLayout';
import { BackButton, DetailHeader, DetailSection, DetailRow } from '@/_UI/DetailField';
import Badge from '@/_UI/Badge';
import Button from '@/_UI/Button';
import PageLoader from '@/_UI/PageLoader';
import toast from 'react-hot-toast';
import axiosInstance from '@/_utils/axiosInstance';
import { BackendRole, BackendPermission } from '@/types';
import { Pencil, Shield } from 'lucide-react';

const formatPermissionName = (name: string) => {
	return name
		.replace(/_/g, ' ')
		.toLowerCase()
		.replace(/\b\w/g, (c) => c.toUpperCase());
};

const RoleDetail: React.FC = () => {
	const router = useRouter();
	const { id } = router.query;
	const [role, setRole] = useState<BackendRole | null>(null);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<'details' | 'privileges'>('details');

	useEffect(() => {
		if (!router.isReady || !id) return;
		setLoading(true);

		axiosInstance
			.post(`role/details/${id}`)
			.then((res) => {
				const roleData = res.data?.data ?? res.data;
				setRole(roleData);
			})
			.catch(() => {
				toast.error('Failed to load role details');
			})
			.finally(() => {
				setLoading(false);
			});
	}, [id, router.isReady]);

	if (loading) {
		return (
			<AdminLayout>
				<PageLoader fullScreen={false} message="Loading role details..." />
			</AdminLayout>
		);
	}

	if (!role) {
		return (
			<AdminLayout>
				<div className="max-w-4xl mx-auto space-y-5 animate-page-enter">
					<BackButton />
					<div
						className="rounded-xl px-6 py-16 text-center"
						style={{ background: 'var(--surface-paper)', border: '1px solid var(--border-light)' }}
					>
						<p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
							Role not found
						</p>
					</div>
				</div>
			</AdminLayout>
		);
	}

	const tabs = [
		{ id: 'details' as const, label: 'Details' },
		{ id: 'privileges' as const, label: 'Privileges' },
	];

	return (
		<AdminLayout>
			<div className="max-w-4xl mx-auto space-y-5 animate-page-enter">
				<BackButton />

				<DetailHeader
					title={formatPermissionName(role.name)}
					subtitle="Role"
					status={
						<Badge variant={role.status === 'ACTIVE' ? 'success' : 'neutral'} dot>
							{role.status}
						</Badge>
					}
				/>

				{/* Tabs */}
				<div
					className="flex gap-0 rounded-xl overflow-hidden"
					style={{
						background: 'var(--surface-paper)',
						border: '1px solid var(--border-light)',
						boxShadow: 'var(--shadow-sm)',
					}}
				>
					{tabs.map((tab) => {
						const isActive = activeTab === tab.id;
						return (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className="px-5 py-3 text-sm font-medium transition-all duration-200 cursor-pointer relative"
								style={{
									color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
									background: isActive ? 'rgba(22,163,74,0.05)' : 'transparent',
								}}
								onMouseEnter={(e) => {
									if (!isActive) e.currentTarget.style.background = 'var(--surface-low)';
								}}
								onMouseLeave={(e) => {
									if (!isActive) e.currentTarget.style.background = 'transparent';
								}}
							>
								{tab.label}
								{isActive && (
									<span
										className="absolute bottom-0 left-0 right-0 h-0.5"
										style={{ background: 'var(--color-primary)' }}
									/>
								)}
							</button>
						);
					})}
				</div>

				{/* Tab Content */}
				{activeTab === 'details' && (
					<DetailSection
						title="Role Information"
						action={
							<Button
								variant="outlined"
								size="sm"
								leftIcon={Pencil}
								onClick={() => router.push(`/admin/roles/new?id=${role.id}`)}
							>
								Edit Role
							</Button>
						}
					>
						<DetailRow label="Name" value={role.name} />
						<DetailRow label="Description" value={role.description || '\u2014'} />
						<DetailRow
							label="Status"
							value={
								<Badge variant={role.status === 'ACTIVE' ? 'success' : 'neutral'} dot>
									{role.status}
								</Badge>
							}
						/>
						<DetailRow
							label="Permissions"
							value={<Badge variant="info">{role.permissions?.length ?? 0}</Badge>}
						/>
						<DetailRow
							label="Created"
							value={
								role.createdAt
									? new Date(role.createdAt).toLocaleDateString('en-US', {
											year: 'numeric',
											month: 'long',
											day: 'numeric',
									  })
									: '\u2014'
							}
						/>
					</DetailSection>
				)}

				{activeTab === 'privileges' && (
					<DetailSection
						title={`Assigned Privileges (${role.permissions?.length ?? 0})`}
						action={
							<Button
								variant="outlined"
								size="sm"
								leftIcon={Pencil}
								onClick={() => router.push(`/admin/roles/new?id=${role.id}`)}
							>
								Manage Privileges
							</Button>
						}
					>
						{!role.permissions || role.permissions.length === 0 ? (
							<div className="px-5 py-10 text-center">
								<Shield size={32} className="mx-auto mb-2" style={{ color: 'var(--text-hint)' }} />
								<p className="text-sm" style={{ color: 'var(--text-hint)' }}>
									No privileges assigned to this role
								</p>
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr style={{ borderBottom: '1px solid var(--border-light)' }}>
											<th
												className="text-left text-xs font-semibold px-5 py-3"
												style={{ color: 'var(--text-hint)' }}
											>
												Name
											</th>
											<th
												className="text-left text-xs font-semibold px-5 py-3"
												style={{ color: 'var(--text-hint)' }}
											>
												Description
											</th>
										</tr>
									</thead>
									<tbody>
										{role.permissions.map((perm: BackendPermission) => (
											<tr
												key={perm.id}
												style={{ borderBottom: '1px solid var(--border-light)' }}
											>
												<td className="px-5 py-3">
													<span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
														{formatPermissionName(perm.name)}
													</span>
												</td>
												<td className="px-5 py-3">
													<span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
														{perm.description || '\u2014'}
													</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</DetailSection>
				)}
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(RoleDetail);
