import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Globe, ToggleLeft, ToggleRight } from "lucide-react";
import toast from "react-hot-toast";

import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import RecordActivity from "@/_components/RecordActivity";
import { BackButton, DetailHeader, EditableSection } from "@/_UI/DetailField";
import Badge from "@/_UI/Badge";
import { FormInput } from "@/_UI/FormField";
import NumberInput from "@/_UI/NumberInput";
import PageLoader from "@/_UI/PageLoader";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/_utils/axiosInstance";
import { isPlausiblePriceFactor } from "@/_utils/priceFactor";
import type { BackendCountry } from "@/types";

const NAIRA_SAMPLE = 10000;

/** "₦10,000 shows as $6.20": the storefront effect of a rate, spelled out so a typo is obvious. */
function previewEffect(factor: number, currencyCode: string): string {
	if (!Number.isFinite(factor) || factor <= 0) return "";
	const converted = factor * NAIRA_SAMPLE;
	let str: string;
	try {
		str = new Intl.NumberFormat(undefined, { style: "currency", currency: currencyCode || "USD" }).format(converted);
	} catch {
		str = `${converted.toFixed(2)} ${currencyCode}`;
	}
	return `₦${NAIRA_SAMPLE.toLocaleString()} shows as ${str}`;
}

function EditCard({ country, onCancel, onSaved }: { country: BackendCountry; onCancel: () => void; onSaved: () => void }) {
	// NGN is the app's base currency: useCurrency does priceInNaira * priceFactor, so its rate must stay exactly 1.
	const isBase = country.currencyCode === "NGN";
	const [currencyCode, setCurrencyCode] = useState(country.currencyCode);
	const [priceFactor, setPriceFactor] = useState(String(Number(country.priceFactor)));
	const [shippingEnabled, setShippingEnabled] = useState(country.shippingEnabled);
	const [error, setError] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);

	const save = async (e: React.FormEvent) => {
		e.preventDefault();
		const code = currencyCode.trim().toUpperCase();
		if (!/^[A-Z]{3}$/.test(code)) return setError("Currency code must be exactly 3 letters (e.g. USD).");
		const factor = Number(priceFactor);
		if (isBase) {
			if (factor !== 1) return setError("Nigeria is the base currency, so its price factor must stay 1.");
		} else if (!isPlausiblePriceFactor(factor)) return setError("Price factor must be a number greater than 0 and less than 1 (e.g. 0.00062 for USD).");

		setSaving(true);
		setError(null);
		try {
			await axiosInstance.put(`country/modify/${country.id}`, { currencyCode: code, priceFactor: factor, shippingEnabled });
			toast.success("Country saved");
			onSaved();
		} catch (err: any) {
			toast.error(err?.response?.data?.message || "Failed to update country");
			setSaving(false);
		}
	};

	return (
		<form onSubmit={save} aria-label="Edit country" className="border-border bg-card overflow-hidden rounded-xl border">
			<div className="space-y-4 p-5">
				<FormInput label="Currency code" placeholder="USD" required maxLength={3} value={currencyCode} disabled={isBase} onChange={(e: any) => setCurrencyCode(e.target.value.toUpperCase())} />
				{isBase ? (
					<div>
						<FormInput label="Price factor" value="1.000000" disabled />
						<p className="mt-1.5 text-xs" style={{ color: "var(--text-hint)" }}>
							Nigeria is the base currency: its rate is fixed at 1.
						</p>
					</div>
				) : (
					<div>
						<NumberInput label="Price factor" placeholder="0.00062" required value={priceFactor} onChange={setPriceFactor} hint="The NGN → this currency rate used to price the storefront. Must be greater than 0 and less than 1." />
						{previewEffect(Number(priceFactor), currencyCode) && (
							<p className="mt-1.5 text-xs font-medium" style={{ color: "var(--color-primary)" }}>
								{previewEffect(Number(priceFactor), currencyCode)}
							</p>
						)}
					</div>
				)}
				<div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "var(--border-light)", background: "var(--surface-low)" }}>
					<div className="min-w-0">
						<label htmlFor="shippingEnabled" className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
							Accept shipping to this country
						</label>
						<p className="mt-1 text-xs" style={{ color: "var(--text-hint)" }}>
							Turning this off blocks checkout to this destination. It does not hide the country from browsing.
						</p>
					</div>
					<button
						id="shippingEnabled"
						type="button"
						role="switch"
						aria-checked={shippingEnabled}
						onClick={() => setShippingEnabled((v) => !v)}
						className="flex shrink-0 cursor-pointer items-center gap-2 self-start rounded-full px-3 py-2 text-xs font-semibold transition-colors sm:self-auto"
						style={{ background: shippingEnabled ? "rgba(154,202,60,0.14)" : "var(--surface-medium)", color: shippingEnabled ? "var(--color-primary)" : "var(--text-hint)" }}
					>
						{shippingEnabled ? <ToggleRight className="h-5 w-5" aria-hidden="true" /> : <ToggleLeft className="h-5 w-5" aria-hidden="true" />}
						{shippingEnabled ? "On" : "Off"}
					</button>
				</div>
				{error && (
					<p role="alert" className="text-xs" style={{ color: "#ef4444" }}>
						{error}
					</p>
				)}
			</div>
			<div className="border-border bg-secondary/15 flex justify-end gap-2 border-t px-5 py-3">
				<Button type="button" variant="outline" size="sm" onClick={onCancel}>
					Cancel
				</Button>
				<Button type="submit" size="sm" disabled={saving}>
					{saving ? "Saving…" : "Save changes"}
				</Button>
			</div>
		</form>
	);
}

const CountryDetail: React.FC = () => {
	const router = useRouter();
	const id = router.query.id as string | undefined;
	const [country, setCountry] = useState<BackendCountry | null>(null);
	const [loading, setLoading] = useState(true);

	const load = useCallback(async () => {
		if (!id) return;
		try {
			const res = await axiosInstance.get(`country/${id}`);
			setCountry(res.data?.data ?? res.data ?? null);
		} catch {
			setCountry(null);
		} finally {
			setLoading(false);
		}
	}, [id]);
	useEffect(() => {
		load();
	}, [load]);

	if (loading)
		return (
			<AdminLayout pageTitle="Country">
				<PageLoader fullScreen={false} message="Loading country..." />
			</AdminLayout>
		);
	if (!country)
		return (
			<AdminLayout pageTitle="Country">
				<div className="border-border bg-card mx-auto max-w-3xl space-y-3 rounded-xl border p-8 text-center">
					<p className="text-sm font-semibold">Country not found.</p>
					<Button variant="outline" size="sm" onClick={() => router.push("/admin/countries")}>
						Back to Countries
					</Button>
				</div>
			</AdminLayout>
		);

	return (
		<AdminLayout pageTitle={country.name}>
			<div className="mx-auto w-full max-w-5xl space-y-6">
				<BackButton onClick={() => router.push("/admin/countries")} label="Back to Countries" />
				<DetailHeader
					title={country.name}
					subtitle={`Country code ${country.code}`}
					status={<Badge variant={country.shippingEnabled ? "success" : "neutral"} dot>{country.shippingEnabled ? "Ships" : "Blocked"}</Badge>}
					metrics={[
						{ label: "Currency", value: country.currencyCode },
						{ label: "Price factor", value: Number(country.priceFactor).toFixed(6) },
					]}
				/>
				<EditableSection
					key={`${country.currencyCode}-${country.priceFactor}-${country.shippingEnabled}`}
					title="Pricing & shipping"
					icon={Globe}
					canEdit
					defaultEditing={router.query.edit === "1"}
					facts={[
						{ label: "Currency", value: country.currencyCode },
						{ label: "Price factor", value: Number(country.priceFactor).toFixed(6) },
						{ label: "Shipping", value: country.shippingEnabled ? "Accepted" : "Blocked" },
					]}
				>
					{(close) => <EditCard country={country} onCancel={close} onSaved={load} />}
				</EditableSection>
			</div>
			<RecordActivity type="Country" id={country.id} />
		</AdminLayout>
	);
};

export default withAdminAuth(CountryDetail);
