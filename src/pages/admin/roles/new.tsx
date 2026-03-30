import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import withAdminAuth from '@/_components/withAdminAuth';
import AdminLayout from '@/_components/AdminLayout';
import { BackButton } from '@/_UI/DetailField';
import Button from '@/_UI/Button';
import { FormInput, FormTextarea } from '@/_UI/FormField';
import PageLoader from '@/_UI/PageLoader';
import toast from 'react-hot-toast';
import axiosInstance from '@/_utils/axiosInstance';
import { BackendPermission } from '@/types';
import { Search, ChevronsRight, ChevronRight, ChevronLeft, ChevronsLeft, Shield } from 'lucide-react';

const formatPermissionName = (name: string) => {
	return name
		.replace(/_/g, ' ')
		.toLowerCase()
		.replace(/\b\w/g, (c) => c.toUpperCase());
};

const inputStyle: React.CSSProperties = {
	background: 'var(--surface-base)',
	border: '1px solid var(--border-light)',
	color: 'var(--text-primary)',
};

const RoleForm: React.FC = () => {
	const router = useRouter();
	const editId = router.query.id as string | undefined;
	const isEditMode = !!editId;

	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [allPermissions, setAllPermissions] = useState<BackendPermission[]>([]);
	const [selectedPermissions, setSelectedPermissions] = useState<BackendPermission[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	// Transfer list state
	const [availableSearch, setAvailableSearch] = useState('');
	const [selectedSearch, setSelectedSearch] = useState('');
	const [checkedAvailable, setCheckedAvailable] = useState<Set<number>>(new Set());
	const [checkedSelected, setCheckedSelected] = useState<Set<number>>(new Set());

	useEffect(() => {
		if (!router.isReady) return;

		const fetchData = async () => {
			setLoading(true);
			try {
				const permRes = await axiosInstance.get('permission?page=1&limit=200');
				const permData = permRes.data?.data ?? permRes.data;
				const perms: BackendPermission[] = permData?.items ?? permData ?? [];
				setAllPermissions(perms);

				if (editId) {
					const roleRes = await axiosInstance.post(`role/details/${editId}`);
					const roleData = roleRes.data?.data ?? roleRes.data;
					setName(roleData.name ?? '');
					setDescription(roleData.description ?? '');
					setSelectedPermissions(roleData.permissions ?? []);
				}
			} catch {
				toast.error('Failed to load data');
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [router.isReady, editId]);

	const selectedIds = useMemo(() => new Set(selectedPermissions.map((p) => p.id)), [selectedPermissions]);

	const availablePermissions = useMemo(() => allPermissions.filter((p) => !selectedIds.has(p.id)), [allPermissions, selectedIds]);

	const filteredAvailable = useMemo(() => {
		if (!availableSearch) return availablePermissions;
		const q = availableSearch.toLowerCase();
		return availablePermissions.filter((p) => formatPermissionName(p.name).toLowerCase().includes(q));
	}, [availablePermissions, availableSearch]);

	const filteredSelected = useMemo(() => {
		if (!selectedSearch) return selectedPermissions;
		const q = selectedSearch.toLowerCase();
		return selectedPermissions.filter((p) => formatPermissionName(p.name).toLowerCase().includes(q));
	}, [selectedPermissions, selectedSearch]);

	// Transfer actions
	const moveSelectedRight = () => {
		const toMove = availablePermissions.filter((p) => checkedAvailable.has(p.id));
		if (!toMove.length) return;
		setSelectedPermissions((prev) => [...prev, ...toMove]);
		setCheckedAvailable(new Set());
	};

	const moveAllRight = () => {
		setSelectedPermissions((prev) => [...prev, ...availablePermissions]);
		setCheckedAvailable(new Set());
	};

	const moveSelectedLeft = () => {
		const toRemoveIds = checkedSelected;
		if (!toRemoveIds.size) return;
		setSelectedPermissions((prev) => prev.filter((p) => !toRemoveIds.has(p.id)));
		setCheckedSelected(new Set());
	};

	const moveAllLeft = () => {
		setSelectedPermissions([]);
		setCheckedSelected(new Set());
	};

	const toggleAvailableCheck = (id: number) => {
		setCheckedAvailable((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const toggleSelectedCheck = (id: number) => {
		setCheckedSelected((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const toggleAllAvailable = () => {
		if (checkedAvailable.size === filteredAvailable.length && filteredAvailable.length > 0) {
			setCheckedAvailable(new Set());
		} else {
			setCheckedAvailable(new Set(filteredAvailable.map((p) => p.id)));
		}
	};

	const toggleAllSelected = () => {
		if (checkedSelected.size === filteredSelected.length && filteredSelected.length > 0) {
			setCheckedSelected(new Set());
		} else {
			setCheckedSelected(new Set(filteredSelected.map((p) => p.id)));
		}
	};

	const handleSubmit = async () => {
		if (!name.trim()) {
			toast.error('Role name is required');
			return;
		}
		setSaving(true);
		try {
			const payload = {
				name: name.trim(),
				description: description.trim(),
				permissions: selectedPermissions.map((p) => ({ id: p.id, name: p.name })),
			};

			if (isEditMode) {
				await axiosInstance.patch(`role/modify/${editId}`, payload);
				toast.success('Role updated successfully');
			} else {
				await axiosInstance.post('role/create', payload);
				toast.success('Role created successfully');
			}
			router.push('/admin/roles');
		} catch (err: any) {
			toast.error(err?.response?.data?.message ?? `Failed to ${isEditMode ? 'update' : 'create'} role`);
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<AdminLayout>
				<PageLoader fullScreen={false} message={isEditMode ? 'Loading role...' : 'Loading permissions...'} />
			</AdminLayout>
		);
	}

	return (
		<AdminLayout>
			<div className="animate-page-enter space-y-5">
				<BackButton />

				<div className="flex items-center gap-3">
					<div
						className="w-10 h-10 rounded-lg flex items-center justify-center"
						style={{ background: 'rgba(22,163,74,0.08)' }}
					>
						<Shield size={20} style={{ color: 'var(--color-primary)' }} />
					</div>
					<div>
						<h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
							{isEditMode ? 'Edit Role' : 'Create Role'}
						</h1>
						<p className="text-sm" style={{ color: 'var(--text-hint)' }}>
							{isEditMode ? 'Update role details and privileges' : 'Define a new role with privileges'}
						</p>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Left Column - Role Form */}
					<div className="lg:col-span-1">
						<div
							className="rounded-xl overflow-hidden"
							style={{
								background: 'var(--surface-paper)',
								border: '1px solid var(--border-light)',
								boxShadow: 'var(--shadow-sm)',
							}}
						>
							<div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border-light)' }}>
								<h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
									Role Details
								</h3>
							</div>
							<div className="p-5 space-y-4">
								<FormInput
									label="Role Name"
									required
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="e.g. INVENTORY_MANAGER"
								/>
								<FormTextarea
									label="Description"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									placeholder="Brief description of this role"
									rows={3}
								/>

								<div
									className="rounded-lg px-3 py-2.5 text-sm"
									style={{ background: 'var(--surface-low)', color: 'var(--text-secondary)' }}
								>
									<span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
										{selectedPermissions.length}
									</span>{' '}
									privilege{selectedPermissions.length !== 1 ? 's' : ''} selected
								</div>

								<div className="flex gap-3 pt-2">
									<Button variant="outlined" onClick={() => router.push('/admin/roles')} className="flex-1">
										Cancel
									</Button>
									<Button variant="filled" onClick={handleSubmit} loading={saving} className="flex-1">
										{isEditMode ? 'Update Role' : 'Create Role'}
									</Button>
								</div>
							</div>
						</div>
					</div>

					{/* Right Column - Transfer List */}
					<div className="lg:col-span-2">
						<div
							className="rounded-xl overflow-hidden"
							style={{
								background: 'var(--surface-paper)',
								border: '1px solid var(--border-light)',
								boxShadow: 'var(--shadow-sm)',
							}}
						>
							<div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border-light)' }}>
								<h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
									Assign Privileges
								</h3>
							</div>
							<div className="p-5">
								<div className="flex flex-col md:flex-row gap-3 items-stretch">
									{/* Available Pane */}
									<div
										className="flex-1 rounded-lg overflow-hidden flex flex-col"
										style={{
											border: '1px solid var(--border-light)',
											background: 'var(--surface-paper)',
											minHeight: '400px',
										}}
									>
										<div className="px-3 py-3 space-y-2" style={{ borderBottom: '1px solid var(--border-light)' }}>
											<div className="flex items-center justify-between">
												<span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
													Available Privileges ({availablePermissions.length})
												</span>
											</div>
											<div className="relative">
												<Search
													size={14}
													className="absolute left-2.5 top-1/2 -translate-y-1/2"
													style={{ color: 'var(--text-hint)' }}
												/>
												<input
													type="text"
													value={availableSearch}
													onChange={(e) => setAvailableSearch(e.target.value)}
													placeholder="Search..."
													className="w-full rounded-md pl-8 pr-3 py-1.5 text-xs outline-none transition-colors"
													style={inputStyle}
													onFocus={(e) => {
														e.currentTarget.style.borderColor = 'var(--color-primary)';
													}}
													onBlur={(e) => {
														e.currentTarget.style.borderColor = 'var(--border-light)';
													}}
												/>
											</div>
											<label className="flex items-center gap-2 cursor-pointer">
												<input
													type="checkbox"
													checked={checkedAvailable.size === filteredAvailable.length && filteredAvailable.length > 0}
													onChange={toggleAllAvailable}
													className="shrink-0 w-3.5 h-3.5 rounded cursor-pointer"
													style={{ accentColor: 'var(--color-primary)' }}
												/>
												<span className="text-xs" style={{ color: 'var(--text-hint)' }}>
													Select All
												</span>
											</label>
										</div>
										<div className="flex-1 overflow-y-auto" style={{ maxHeight: '320px' }}>
											{filteredAvailable.length === 0 ? (
												<div className="flex items-center justify-center h-full py-8">
													<span className="text-xs" style={{ color: 'var(--text-hint)' }}>
														No available privileges
													</span>
												</div>
											) : (
												filteredAvailable.map((perm) => (
													<label
														key={perm.id}
														className="flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors"
														style={{
															borderBottom: '1px solid var(--border-light)',
															background: checkedAvailable.has(perm.id) ? 'var(--surface-low)' : 'transparent',
														}}
														onMouseEnter={(e) => {
															if (!checkedAvailable.has(perm.id)) e.currentTarget.style.background = 'var(--surface-low)';
														}}
														onMouseLeave={(e) => {
															if (!checkedAvailable.has(perm.id)) e.currentTarget.style.background = 'transparent';
														}}
													>
														<input
															type="checkbox"
															checked={checkedAvailable.has(perm.id)}
															onChange={() => toggleAvailableCheck(perm.id)}
															className="shrink-0 w-3.5 h-3.5 rounded cursor-pointer"
															style={{ accentColor: 'var(--color-primary)' }}
														/>
														<span className="text-xs" style={{ color: 'var(--text-primary)' }}>
															{formatPermissionName(perm.name)}
														</span>
													</label>
												))
											)}
										</div>
									</div>

									{/* Center Transfer Buttons */}
									<div className="flex md:flex-col items-center justify-center gap-2 py-2 md:py-0 md:px-1">
										<Button
											variant="outlined"
											size="sm"
											onClick={moveAllRight}
											disabled={availablePermissions.length === 0}
											title="Move all right"
										>
											<ChevronsRight size={14} />
										</Button>
										<Button
											variant="outlined"
											size="sm"
											onClick={moveSelectedRight}
											disabled={checkedAvailable.size === 0}
											title="Move selected right"
										>
											<ChevronRight size={14} />
										</Button>
										<Button
											variant="outlined"
											size="sm"
											onClick={moveSelectedLeft}
											disabled={checkedSelected.size === 0}
											title="Move selected left"
										>
											<ChevronLeft size={14} />
										</Button>
										<Button
											variant="outlined"
											size="sm"
											onClick={moveAllLeft}
											disabled={selectedPermissions.length === 0}
											title="Move all left"
										>
											<ChevronsLeft size={14} />
										</Button>
									</div>

									{/* Selected Pane */}
									<div
										className="flex-1 rounded-lg overflow-hidden flex flex-col"
										style={{
											border: '1px solid var(--border-light)',
											background: 'var(--surface-paper)',
											minHeight: '400px',
										}}
									>
										<div className="px-3 py-3 space-y-2" style={{ borderBottom: '1px solid var(--border-light)' }}>
											<div className="flex items-center justify-between">
												<span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
													Selected Privileges ({selectedPermissions.length})
												</span>
											</div>
											<div className="relative">
												<Search
													size={14}
													className="absolute left-2.5 top-1/2 -translate-y-1/2"
													style={{ color: 'var(--text-hint)' }}
												/>
												<input
													type="text"
													value={selectedSearch}
													onChange={(e) => setSelectedSearch(e.target.value)}
													placeholder="Search..."
													className="w-full rounded-md pl-8 pr-3 py-1.5 text-xs outline-none transition-colors"
													style={inputStyle}
													onFocus={(e) => {
														e.currentTarget.style.borderColor = 'var(--color-primary)';
													}}
													onBlur={(e) => {
														e.currentTarget.style.borderColor = 'var(--border-light)';
													}}
												/>
											</div>
											<label className="flex items-center gap-2 cursor-pointer">
												<input
													type="checkbox"
													checked={checkedSelected.size === filteredSelected.length && filteredSelected.length > 0}
													onChange={toggleAllSelected}
													className="shrink-0 w-3.5 h-3.5 rounded cursor-pointer"
													style={{ accentColor: 'var(--color-primary)' }}
												/>
												<span className="text-xs" style={{ color: 'var(--text-hint)' }}>
													Select All
												</span>
											</label>
										</div>
										<div className="flex-1 overflow-y-auto" style={{ maxHeight: '320px' }}>
											{filteredSelected.length === 0 ? (
												<div className="flex items-center justify-center h-full py-8">
													<span className="text-xs" style={{ color: 'var(--text-hint)' }}>
														No privileges selected
													</span>
												</div>
											) : (
												filteredSelected.map((perm) => (
													<label
														key={perm.id}
														className="flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors"
														style={{
															borderBottom: '1px solid var(--border-light)',
															background: checkedSelected.has(perm.id) ? 'var(--surface-low)' : 'transparent',
														}}
														onMouseEnter={(e) => {
															if (!checkedSelected.has(perm.id)) e.currentTarget.style.background = 'var(--surface-low)';
														}}
														onMouseLeave={(e) => {
															if (!checkedSelected.has(perm.id)) e.currentTarget.style.background = 'transparent';
														}}
													>
														<input
															type="checkbox"
															checked={checkedSelected.has(perm.id)}
															onChange={() => toggleSelectedCheck(perm.id)}
															className="shrink-0 w-3.5 h-3.5 rounded cursor-pointer"
															style={{ accentColor: 'var(--color-primary)' }}
														/>
														<span className="text-xs" style={{ color: 'var(--text-primary)' }}>
															{formatPermissionName(perm.name)}
														</span>
													</label>
												))
											)}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(RoleForm);
