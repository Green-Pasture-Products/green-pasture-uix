import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import * as changeCase from "change-case";

import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import { BackButton } from "@/_UI/DetailField";
import { FormInput } from "@/_UI/FormField";
import PhoneInput from "@/_UI/PhoneInput";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/_utils/axiosInstance";

interface RoleOption {
	id: string;
	name: string;
}

const EMPTY_FORM = { firstName: "", lastName: "", email: "", phoneNumber: "", roleIds: [] as string[] };

const NewInvitation: React.FC = () => {
	const router = useRouter();
	const [roles, setRoles] = useState<RoleOption[]>([]);
	const [form, setForm] = useState(EMPTY_FORM);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [inviting, setInviting] = useState(false);

	// PhoneInput hands back local digits only; the dial code arrives separately and
	// the two are joined into E.164 at submit time (same contract as signup).
	const phoneDialRef = useRef("+234");

	useEffect(() => {
		axiosInstance
			.get("role/all")
			.then((res) => {
				const data = res.data?.data;
				if (Array.isArray(data)) setRoles(data.map((r: any) => ({ id: String(r.id), name: changeCase.capitalCase(r.name) })));
			})
			.catch(() => {});
	}, []);

	const toggleRole = (roleId: string) => setForm((f) => ({ ...f, roleIds: f.roleIds.includes(roleId) ? f.roleIds.filter((id) => id !== roleId) : [...f.roleIds, roleId] }));

	const validate = () => {
		const e: Record<string, string> = {};
		if (!form.firstName.trim()) e.firstName = "First name is required";
		if (!form.lastName.trim()) e.lastName = "Last name is required";
		if (!form.email.trim()) e.email = "Email is required";
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email address";
		if (!form.phoneNumber.trim()) e.phoneNumber = "Phone number is required";
		else if (form.phoneNumber.replace(/\D/g, "").length < 7) e.phoneNumber = "Phone number is too short";
		if (form.roleIds.length === 0) e.roleIds = "Select at least one role";
		setErrors(e);
		return Object.keys(e).length === 0;
	};

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validate()) return;
		setInviting(true);
		try {
			await axiosInstance.post("staff-invitations", {
				firstName: form.firstName.trim(),
				lastName: form.lastName.trim(),
				email: form.email.trim(),
				phoneNumber: `${phoneDialRef.current}${form.phoneNumber}`,
				roleIds: form.roleIds,
			});
			toast.success("Invitation sent");
			router.push("/admin/invitations");
		} catch (err: any) {
			toast.error(err?.response?.data?.message || "Failed to send invitation");
			setInviting(false);
		}
	};

	const back = () => router.push("/admin/invitations");

	return (
		<AdminLayout pageTitle="Invite staff member">
			<div className="mx-auto w-full max-w-3xl space-y-6">
				<BackButton onClick={back} label="Back to Invitations" />
				<div>
					<h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
						Invite staff member
					</h1>
					<p className="text-sm" style={{ color: "var(--text-hint)" }}>
						They&apos;ll get an email link to set a password and activate their account.
					</p>
				</div>

				<form onSubmit={submit} aria-label="Invite staff member" className="border-border bg-card overflow-hidden rounded-xl border">
					<div className="space-y-4 p-5">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<FormInput label="First Name" placeholder="Enter first name" required value={form.firstName} onChange={(e: any) => setForm((f) => ({ ...f, firstName: e.target.value }))} error={errors.firstName} />
							<FormInput label="Last Name" placeholder="Enter last name" required value={form.lastName} onChange={(e: any) => setForm((f) => ({ ...f, lastName: e.target.value }))} error={errors.lastName} />
						</div>
						<FormInput label="Email" type="email" placeholder="staff@example.com" required value={form.email} onChange={(e: any) => setForm((f) => ({ ...f, email: e.target.value }))} error={errors.email} />
						<PhoneInput label="Phone Number" required value={form.phoneNumber} onChange={(local) => setForm((f) => ({ ...f, phoneNumber: local }))} onCountryChange={(dial) => (phoneDialRef.current = dial)} error={errors.phoneNumber} />

						<fieldset>
							<legend className="mb-2 block text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
								Roles <span className="text-red-500">*</span>
							</legend>
							<div className="flex flex-wrap gap-x-6 gap-y-2">
								{roles.map((r) => (
									<label key={r.id} className="flex cursor-pointer select-none items-center gap-2 text-sm" style={{ color: "var(--text-primary)" }}>
										<input type="checkbox" checked={form.roleIds.includes(r.id)} onChange={() => toggleRole(r.id)} className="size-4 cursor-pointer rounded" />
										{r.name}
									</label>
								))}
							</div>
							{errors.roleIds && <p className="mt-1.5 text-xs text-red-500">{errors.roleIds}</p>}
						</fieldset>
					</div>
					<div className="border-border bg-secondary/15 flex justify-end gap-2 border-t px-5 py-3">
						<Button type="button" variant="outline" size="sm" onClick={back} disabled={inviting}>
							Cancel
						</Button>
						<Button type="submit" size="sm" disabled={inviting}>
							{inviting ? "Sending…" : "Send invitation"}
						</Button>
					</div>
				</form>
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(NewInvitation);
