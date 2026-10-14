import RecordActivity from "@/_components/RecordActivity";
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import withAdminAuth from '@/_components/withAdminAuth';
import AdminLayout from '@/_components/AdminLayout';
import { BackButton, DetailHeader, DetailSection, FactGrid } from '@/_UI/DetailField';
import Badge from '@/_UI/Badge';
import Button from '@/_UI/Button';
import Modal from '@/_UI/Modal';
import Can from '@/_components/Can';
import PageLoader from '@/_UI/PageLoader';
import toast from 'react-hot-toast';
import axiosInstance from '@/_utils/axiosInstance';
import { BackendRole, BackendPermission } from '@/types';
import { KeyRound, Pencil, Power, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const titleCase = (name: string) => name.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
const singular = (w: string) => (w.length > 3 && w.endsWith('S') && !w.endsWith('SS') ? w.slice(0, -1) : w);

interface PermissionGroup {
	title: string;
	items: { id: string; action: string; description?: string; assigned: boolean }[];
}

/** "CREATE_PRODUCT", "MANAGE_PRODUCTS" and "READ_PRODUCT" share a card: the action is the first word, the module the rest. */
function groupPermissions(all: BackendPermission[], assigned: Set<string>): PermissionGroup[] {
	const groups = new Map<string, PermissionGroup>();
	for (const p of all) {
		const [action, ...rest] = p.name.split('_');
		const module = rest.length ? rest.join('_') : action;
		const key = singular(module);
		let g = groups.get(key);
		if (!g) groups.set(key, (g = { title: titleCase(module), items: [] }));
		g.items.push({ id: String(p.id), action: rest.length ? action : 'ACCESS', description: p.description, assigned: assigned.has(String(p.id)) });
	}
	// Modules the role touches first, then alphabetical.
	return [...groups.values()].sort((a, b) => Number(b.items.some((i) => i.assigned)) - Number(a.items.some((i) => i.assigned)) || a.title.localeCompare(b.title));
}

const RoleDetail: React.FC = () => {
	const router = useRouter();
	const { id } = router.query;
	const [role, setRole] = useState<BackendRole | null>(null);
	const [allPermissions, setAllPermissions] = useState<BackendPermission[]>([]);
	const [loading, setLoading] = useState(true);
	const [statusModalOpen, setStatusModalOpen] = useState(false);
	const [toggling, setToggling] = useState(false);

	const load = async () => {
		const res = await axiosInstance.post(`role/details/${id}`);
		setRole(res.data?.data ?? res.data);
	};

	useEffect(() => {
		if (!router.isReady || !id) return;
		setLoading(true);
		Promise.all([
			load(),
			// The full list lets the card show what the role does NOT have, not just what it has.
			axiosInstance
				.get('permission?page=1&limit=200')
				.then((res) => {
					const d = res.data?.data ?? res.data;
					setAllPermissions(d?.items ?? d ?? []);
				})
				.catch(() => {}),
		])
			.catch(() => toast.error('Failed to load role details'))
			.finally(() => setLoading(false));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id, router.isReady]);

	const handleToggleStatus = async () => {
		if (!role) return;
		setToggling(true);
		const endpoint = role.status === 'A' ? 'role/deactivate' : 'role/activate';
		try {
			await axiosInstance.patch(endpoint, [role.id]);
			toast.success(role.status === 'A' ? 'Role deactivated' : 'Role activated');
			setStatusModalOpen(false);
			await load();
		} catch (err: any) {
			toast.error(err?.response?.data?.message || 'Failed to update status');
		} finally {
			setToggling(false);
		}
	};

	const assignedIds = useMemo(() => new Set((role?.permissions ?? []).map((p: BackendPermission) => String(p.id))), [role]);
	// If the full list could not be loaded, fall back to showing just what is assigned.
	const groups = useMemo(() => groupPermissions(allPermissions.length ? allPermissions : (role?.permissions ?? []), assignedIds), [allPermissions, role, assignedIds]);

	const roleTitle = role ? role.name.replace(/_/g, ' ') : 'Role Details';

	if (loading) {
		return (
			<AdminLayout pageTitle={roleTitle}>
				<PageLoader fullScreen={false} message="Loading role details..." />
			</AdminLayout>
		);
	}

	if (!role) {
		return (
			<AdminLayout pageTitle={roleTitle}>
				<div className="border-border bg-card mx-auto max-w-3xl space-y-3 rounded-xl border p-8 text-center">
					<p className="text-sm font-semibold">Role not found.</p>
					<Button variant="outlined" size="sm" onClick={() => router.push('/admin/roles')}>
						Back to Roles &amp; Permissions
					</Button>
				</div>
			</AdminLayout>
		);
	}

	const active = role.status === 'A';
	const edit = () => router.push(`/admin/roles/new?id=${role.id}`);

	return (
		<AdminLayout pageTitle={roleTitle}>
			<div className="mx-auto w-full max-w-5xl space-y-6">
				<BackButton onClick={() => router.push('/admin/roles')} label="Back to Roles & Permissions" />

				<DetailHeader
					title={titleCase(role.name)}
					subtitle={role.description || undefined}
					status={<Badge variant={active ? 'success' : 'neutral'} dot>{active ? 'Active' : 'Inactive'}</Badge>}
					metrics={[
						{ label: 'Permissions', value: role.permissions?.length ?? 0 },
						{ label: 'Last modified', value: role.updatedAt ? new Date(role.updatedAt).toLocaleString() : '\u2014' },
						{ label: 'Created', value: role.createdAt ? new Date(role.createdAt).toLocaleDateString() : '\u2014' },
					]}
					actions={
						<Can privilege="MANAGE_ROLES">
							<Button variant="outlined" size="sm" color={active ? 'error' : 'primary'} onClick={() => setStatusModalOpen(true)} loading={toggling} disabled={toggling}>
								<Power className="mr-1.5 h-4 w-4" />
								{active ? 'Deactivate' : 'Activate'}
							</Button>
						</Can>
					}
				/>

				<DetailSection
					title="Role details"
					icon={ShieldCheck}
					action={
						<Can privilege="MANAGE_ROLES">
							<Button variant="text" size="sm" leftIcon={Pencil} onClick={edit}>
								Edit
							</Button>
						</Can>
					}
				>
					<FactGrid facts={[{ label: 'Role name', value: titleCase(role.name) }, { label: 'Description', value: role.description }]} />
				</DetailSection>

				<DetailSection
					title={`Permissions (${role.permissions?.length ?? 0})`}
					icon={KeyRound}
					description="“Manage” covers read, write and delete on its module."
					action={
						<Can privilege="MANAGE_ROLES">
							<Button variant="outlined" size="sm" leftIcon={Pencil} onClick={edit}>
								Edit permissions
							</Button>
						</Can>
					}
				>
					{groups.length === 0 ? (
						<p className="text-muted-foreground px-1 py-8 text-center text-sm">No permissions assigned to this role.</p>
					) : (
						<div className="grid gap-4 py-3 md:grid-cols-2">
							{groups.map((g) => (
								<div key={g.title} className="border-border rounded-xl border p-4">
									<h4 className="text-foreground mb-3 text-sm font-semibold">{g.title}</h4>
									<div className="flex flex-wrap gap-2">
										{g.items.map((i) => (
											<span
												key={i.id}
												title={i.description}
												className={cn(
													'inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-semibold tracking-wide',
													i.assigned
														? i.action === 'MANAGE'
															? 'border-violet-500/50 bg-violet-500/10 text-violet-600 dark:text-violet-300'
															: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
														: 'text-muted-foreground border-border',
												)}
											>
												{i.assigned && <span aria-hidden>✓</span>}
												{i.action}
											</span>
										))}
									</div>
								</div>
							))}
						</div>
					)}
				</DetailSection>
			</div>
			{/* Status Confirmation Modal */}
			<Modal
				isOpen={statusModalOpen}
				onClose={() => setStatusModalOpen(false)}
				title={`${role?.status === 'A' ? 'Deactivate' : 'Activate'} Role`}
				size="sm"
			>
				<div className="space-y-4">
					<p className="text-sm text-gray-600 dark:text-gray-300">
						Are you sure you want to {role?.status === 'A' ? 'deactivate' : 'activate'}{' '}
						<span className="font-semibold text-on-surface dark:text-white">
							{role?.name?.replace(/_/g, ' ')}
						</span>?
					</p>
					<div className="flex justify-end gap-3">
						<Button variant="outlined" color="secondary" size="sm" onClick={() => setStatusModalOpen(false)}>
							Cancel
						</Button>
						<Button
							variant="filled"
							color={role?.status === 'A' ? 'error' : 'primary'}
							size="sm"
							loading={toggling}
							onClick={handleToggleStatus}
						>
							{role?.status === 'A' ? 'Deactivate' : 'Activate'}
						</Button>
					</div>
				</div>
			</Modal>
			<RecordActivity type="Role" id={role?.id} />
		</AdminLayout>
	);
};

export default withAdminAuth(RoleDetail);
