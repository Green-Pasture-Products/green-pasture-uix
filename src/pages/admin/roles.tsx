import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import withAdminAuth from '@/_components/withAdminAuth';
import { Plus } from 'lucide-react';

import { BackendRole } from '@/types';
import AdminLayout from '@/_components/AdminLayout';
import { DataTable, Column, FilterDef } from '@/_UI/DataTable';
import ActionMenu from '@/_UI/ActionMenu';
import Badge from '@/_UI/Badge';
import Button from '@/_UI/Button';
import Modal from '@/_UI/Modal';
import toast from 'react-hot-toast';
import axiosInstance from '@/_utils/axiosInstance';

const VIEW_ICON = (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
);

const STATUS_ICON = (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
);

const ROLE_STATUS_FILTERS: FilterDef[] = [
	{
		key: 'filter',
		label: 'Status',
		options: [
			{ value: 'A', label: 'Active' },
			{ value: 'I', label: 'Inactive' },
		],
	},
];

const Roles: React.FC = () => {
	const router = useRouter();
	const [roles, setRoles] = useState<BackendRole[]>([]);
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(50);
	const [pagination, setPagination] = useState<any>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [filterValues, setFilterValues] = useState<Record<string, string>>({});
	const [statusTarget, setStatusTarget] = useState<BackendRole | null>(null);
	const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

	const fetchRoles = useCallback(() => {
		setLoading(true);
		const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
		const filterParam = filterValues.filter ? `&filter=${encodeURIComponent(filterValues.filter)}` : '';
		axiosInstance
			.get(`role?page=${currentPage}&limit=${pageSize}${searchParam}${filterParam}`)
			.then((res) => {
				const data = res.data?.data ?? res.data;
				setRoles(data?.items ?? data ?? []);
				setPagination(data?.meta ?? null);
			})
			.catch(() => {
				toast.error('Failed to load roles');
			})
			.finally(() => {
				setLoading(false);
			});
	}, [currentPage, searchTerm, filterValues, pageSize]);

	useEffect(() => {
		fetchRoles();
	}, [fetchRoles]);

	const handleSearch = useCallback((query: string) => {
		setSearchTerm(query);
		setCurrentPage(1);
	}, []);

	const handleFilterChange = useCallback((key: string, value: string) => {
		setFilterValues((prev) => ({ ...prev, [key]: value }));
		setCurrentPage(1);
	}, []);

	const handlePageChange = useCallback((page: number) => {
		setCurrentPage(page);
	}, []);

	const handlePageSizeChange = useCallback((size: number) => {
		setPageSize(size);
		setCurrentPage(1);
	}, []);

	const handleStatusUpdate = async () => {
		if (!statusTarget) return;
		const isActive = statusTarget.status === 'A';
		setIsUpdatingStatus(true);
		try {
			const endpoint = isActive ? 'role/deactivate' : 'role/activate';
			await axiosInstance.patch(endpoint, [statusTarget.id]);
			toast.success(`Role ${isActive ? 'deactivated' : 'activated'} successfully`);
			setStatusTarget(null);
			fetchRoles();
		} catch (err: any) {
			toast.error(err?.response?.data?.message || 'Failed to update role status');
		} finally {
			setIsUpdatingStatus(false);
		}
	};

	const columns: Column<BackendRole>[] = [
		{
			key: 'name',
			header: 'Name',
			render: (value: any) => (
				<span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
					{String(value).replace(/_/g, ' ')}
				</span>
			),
		},
		{
			key: 'description',
			header: 'Description',
			maxWidth: '300px',
			truncate: true,
			render: (value: any) => (
				<span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
					{value || '—'}
				</span>
			),
		},
		{
			key: 'permissions',
			header: 'Permissions',
			render: (value: any) => <Badge variant="info">{Array.isArray(value) ? value.length : 0}</Badge>,
		},
		{
			key: 'status',
			header: 'Status',
			render: (value: any) => (
				<Badge variant={value === 'A' ? 'success' : 'error'} dot>
					{value === 'A' ? 'Active' : 'Inactive'}
				</Badge>
			),
		},
		{
			key: 'createdAt',
			header: 'Created',
			render: (value: any) => (
				<span className="text-sm text-gray-500 dark:text-gray-400">
					{value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
				</span>
			),
		},
		{
			key: 'id',
			header: '',
			width: '50px',
			align: 'center' as const,
			render: (_: any, row: any) => (
				<ActionMenu items={[
					{ label: 'View', icon: VIEW_ICON, onClick: () => router.push(`/admin/role/${row.id}`) },
					{
						label: row.status === 'A' ? 'Deactivate' : 'Activate',
						icon: STATUS_ICON,
						onClick: () => setStatusTarget(row),
					},
				]} />
			),
		},
	];

	return (
		<AdminLayout>
			<div className="animate-page-enter space-y-6">
				<DataTable
					columns={columns}
					data={roles}
					isLoading={loading}
					onSearch={handleSearch}
					searchPlaceholder="Search roles..."
					pagination={pagination ?? undefined}
					onPageChange={handlePageChange}
					onPageSizeChange={handlePageSizeChange}
					onRowClick={(row) => router.push(`/admin/role/${row.id}`)}
					filters={ROLE_STATUS_FILTERS}
					filterValues={filterValues}
					onFilterChange={handleFilterChange}
					actions={
						<Button variant="filled" leftIcon={Plus} onClick={() => router.push('/admin/roles/new')}>
							Create Role
						</Button>
					}
					emptyMessage="No roles found"
				/>

				{/* Status Confirmation Modal */}
				<Modal
					isOpen={!!statusTarget}
					onClose={() => setStatusTarget(null)}
					title={`${statusTarget?.status === 'A' ? 'Deactivate' : 'Activate'} Role`}
					size="sm"
				>
					<div className="space-y-4">
						<p className="text-sm text-gray-600 dark:text-gray-300">
							Are you sure you want to {statusTarget?.status === 'A' ? 'deactivate' : 'activate'}{' '}
							<span className="font-semibold text-on-surface dark:text-white">
								{statusTarget?.name?.replace(/_/g, ' ')}
							</span>?
						</p>
						<div className="flex justify-end gap-3">
							<Button variant="outlined" color="secondary" size="sm" onClick={() => setStatusTarget(null)}>
								Cancel
							</Button>
							<Button
								variant="filled"
								color={statusTarget?.status === 'A' ? 'error' : 'primary'}
								size="sm"
								loading={isUpdatingStatus}
								onClick={handleStatusUpdate}
							>
								{statusTarget?.status === 'A' ? 'Deactivate' : 'Activate'}
							</Button>
						</div>
					</div>
				</Modal>
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(Roles);
