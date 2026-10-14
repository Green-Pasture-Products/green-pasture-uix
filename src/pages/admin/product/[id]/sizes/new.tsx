import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import { BackButton } from "@/_UI/DetailField";
import FormSelectDropdown from "@/_UI/FormSelect";
import CurrencyInput from "@/_UI/CurrencyInput";
import NumberInput from "@/_UI/NumberInput";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/_utils/axiosInstance";
import { WEIGHT_UNITS } from "@/_utils/formatWeight";

const EMPTY = { weightValue: "", weightUnit: "", price: "", originalPrice: "", unit: "" };

/** A new pack size of an existing product: its own listing, grouped with the source and starting as a draft. */
const NewPackSize: React.FC = () => {
	const router = useRouter();
	const id = router.query.id as string | undefined;
	const [productName, setProductName] = useState("");
	const [form, setForm] = useState(EMPTY);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (!id) return;
		axiosInstance
			.get(`items/${id}`)
			.then((res) => setProductName((res.data?.data ?? res.data)?.name ?? ""))
			.catch(() => {});
	}, [id]);

	const back = () => router.push(`/admin/product/${id}`);

	// Mirrors the create page's per-size rules, so a mistake shows up under the field instead of as a toast after the round trip.
	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!id) return;
		const errs: Record<string, string> = {};
		const weightValue = Number(form.weightValue);
		const price = Number(form.price);
		const originalPrice = form.originalPrice === "" ? null : Number(form.originalPrice);
		const unit = form.unit === "" ? NaN : Number(form.unit);
		if (!(weightValue > 0)) errs.weightValue = "Pack size must be greater than 0";
		if (!form.weightUnit) errs.weightUnit = "Pick a unit for the pack size";
		if (!(price > 0)) errs.price = "Selling price must be greater than 0";
		if (originalPrice !== null && !(originalPrice > price)) errs.originalPrice = "Original price must be greater than selling price";
		if (!Number.isInteger(unit) || unit < 0) errs.unit = "Units must be 0 or more";
		setErrors(errs);
		if (Object.keys(errs).length) return;

		setSaving(true);
		try {
			await axiosInstance.post(`items/${id}/variants`, { weightValue, weightUnit: form.weightUnit, price, originalPrice, unit });
			toast.success("Pack size added");
			router.push(`/admin/product/${id}`);
		} catch (err: any) {
			toast.error(err?.response?.data?.message || "Failed to add pack size");
			setSaving(false);
		}
	};

	return (
		<AdminLayout pageTitle="Add pack size">
			<div className="mx-auto w-full max-w-3xl space-y-6">
				<BackButton onClick={back} label={`Back to ${productName || "product"}`} />
				<div>
					<h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
						Add pack size
					</h1>
					<p className="text-sm" style={{ color: "var(--text-hint)" }}>
						A new listing grouped with {productName || "this product"}. It shares the category, description, tags and images, and starts as a draft.
					</p>
				</div>

				<form onSubmit={submit} aria-label="Add pack size" className="border-border bg-card overflow-hidden rounded-xl border">
					<div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
						<NumberInput label="Pack Size" placeholder="e.g. 250" prefix="Size" step="0.01" min={0} value={form.weightValue} onChange={(v) => setForm((f) => ({ ...f, weightValue: v }))} error={errors.weightValue} />
						<FormSelectDropdown label="Unit" value={form.weightUnit} onChange={(v) => setForm((f) => ({ ...f, weightUnit: v }))} options={WEIGHT_UNITS.map((u) => ({ value: u, label: u }))} placeholder="Select a unit" searchable={false} error={errors.weightUnit} />
						<CurrencyInput label="Selling Price" required placeholder="0.00" value={form.price} onChange={(v) => setForm((f) => ({ ...f, price: v }))} error={errors.price} />
						<CurrencyInput label="Original Price" placeholder="0.00 (leave empty if not on sale)" value={form.originalPrice} onChange={(v) => setForm((f) => ({ ...f, originalPrice: v }))} error={errors.originalPrice} />
						<NumberInput label="Available Units" placeholder="0" required prefix="Qty" value={form.unit} onChange={(v) => setForm((f) => ({ ...f, unit: v }))} error={errors.unit} />
					</div>
					<div className="border-border bg-secondary/15 flex justify-end gap-2 border-t px-5 py-3">
						<Button type="button" variant="outline" size="sm" onClick={back} disabled={saving}>
							Cancel
						</Button>
						<Button type="submit" size="sm" disabled={saving}>
							{saving ? "Adding…" : "Add size"}
						</Button>
					</div>
				</form>
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(NewPackSize, "CREATE_PRODUCT");
