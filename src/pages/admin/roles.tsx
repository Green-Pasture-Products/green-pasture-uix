import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import withAdminAuth from '@/_components/withAdminAuth';
import { Plus } from 'lucide-react';

import { BackendRole } from '@/types';
import AdminLayout from '@/_components/AdminLayout';
import { DataTable, Column } from '@/_UI/DataTable';
import Badge from '@/_UI/Badge';
import Button from '@/_UI/Button';
import toast from 'react-hot-toast';
import axiosInstance from '@/_utils/axiosInstance';

const Roles: React.FC = () => {
	const router = useRouter();
	const [roles, setRoles] = useState<BackendRole[]>([]);
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [pagination, setPagination] = useState<any>(null);
	const [searchTerm, setSearchTerm] = useState('');

	const fetchRoles = useCallback(() => {
		setLoading(true);
		const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
		axiosInstance
			.get(`role?page=${currentPage}&limit=50${searchParam}`)
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
	}, [currentPage, searchTerm]);

	useEffect(() => {
		fetchRoles();
	}, [fetchRoles]);

	const handleSearch = useCallback((query: string) => {
		setSearchTerm(query);
		setCurrentPage(1);
	}, []);

	const handlePageChange = useCallback((page: number) => {
		setCurrentPage(page);
	}, []);

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
					{value || '\u2014'}
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
				<Badge variant={String(value) === 'ACTIVE' ? 'success' : 'neutral'} dot>
					{String(value)}
				</Badge>
			),
		},
		{
			key: 'createdAt',
			header: 'Created',
			render: (value: any) => (
				<span className="text-sm text-gray-500 dark:text-gray-400">
					{value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '\u2014'}
				</span>
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
					onRowClick={(row) => router.push(`/admin/role/${row.id}`)}
					actions={
						<Button variant="filled" leftIcon={Plus} onClick={() => router.push('/admin/roles/new')}>
							Create Role
						</Button>
					}
					emptyMessage="No roles found"
				/>
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(Roles);
