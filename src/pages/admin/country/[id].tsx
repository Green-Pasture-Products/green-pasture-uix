import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Globe, Info } from "lucide-react";
import toast from "react-hot-toast";

import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import RecordActivity from "@/_components/RecordActivity";
import { BackButton, DetailHeader, DetailSection, EditableSection } from "@/_UI/DetailField";
import { Switch } from "@/components/egfm/switch";
import { useHasPrivilege } from "@/_hooks/usePrivilege";
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

const SAMPLE_PRICES = [1000, 5000, 10000, 50000, 100000];

function money(amount: number, currencyCode: string): string {
	try {
		return new Intl.NumberFormat(undefined, { style: "currency", currency: currencyCode || "USD", maximumFractionDigits: amount < 1 ? 4 : 2 }).format(amount);
	} catch {
		return `${amount.toFixed(2)} ${currencyCode}`;
	}
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
				<div className="flex items-start justify-between gap-6 rounded-xl border p-4" style={{ borderColor: "var(--border-light)", background: "var(--surface-low)" }}>
					<div className="min-w-0">
						<label htmlFor="shippingEnabled" className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
							Accept shipping to this country
						</label>
						<p className="mt-1 text-xs" style={{ color: "var(--text-hint)" }}>
							Turning this off blocks checkout to this destination. It does not hide the country from browsing.
						</p>
					</div>
					<Switch id="shippingEnabled" checked={shippingEnabled} onCheckedChange={setShippingEnabled} className="mt-0.5" />
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
	const hasPrivilege = useHasPrivilege();
	const canManageStores = hasPrivilege("MANAGE_STORES");
	// Whether the store converts prices at all (Settings > Order & Shipping); unknown until it loads, or if this user cannot read it.
	const [conversion, setConversion] = useState<boolean | null>(null);
	useEffect(() => {
		axiosInstance
			.get("store/settings")
			.then((res) => setConversion(res.data?.data?.orderSettings?.multiCurrencyEnabled === true))
			.catch(() => setConversion(null));
	}, []);

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

	const factor = Number(country.priceFactor);
	const isBase = country.currencyCode === "NGN";
	const rateText = isBase ? "Base currency" : `${factor} ${country.currencyCode}`;

	return (
		<AdminLayout pageTitle={country.name}>
			<div className="mx-auto w-full max-w-6xl space-y-5">
				<BackButton onClick={() => router.push("/admin/countries")} label="Back to Countries" />
				<DetailHeader
					title={country.name}
					subtitle={`Country code ${country.code}`}
					status={<Badge variant={country.shippingEnabled ? "success" : "neutral"} dot>{country.shippingEnabled ? "Ships" : "Blocked"}</Badge>}
					metrics={[
						{ label: "Currency", value: country.currencyCode },
						{ label: isBase ? "Rate" : "1 NGN equals", value: rateText },
						{ label: "₦10,000 shows as", value: isBase ? "₦10,000" : money(factor * 10000, country.currencyCode) },
						{ label: "Shipping", value: country.shippingEnabled ? "Accepted" : "Blocked" },
					]}
				/>

				{!isBase && conversion === false && (
					<div role="status" className="flex items-start gap-3 rounded-xl border px-4 py-3 text-sm" style={{ borderColor: "var(--border-light)", background: "var(--surface-low)", color: "var(--text-secondary)" }}>
						<Info className="mt-0.5 size-4 shrink-0" style={{ color: "var(--color-primary)" }} />
						<p className="min-w-0">
							Currency conversion is <b>off</b> for the store, so visitors from {country.name} still see naira.{" "}
							{canManageStores && (
								<Link href="/admin/settings?tab=order" className="font-semibold underline" style={{ color: "var(--color-primary)" }}>
									Turn it on in Settings
								</Link>
							)}
						</p>
					</div>
				)}

				<div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
					<div className="min-w-0 space-y-5">
						<EditableSection
							key={`${country.currencyCode}-${country.priceFactor}-${country.shippingEnabled}`}
							title="Pricing & shipping"
							icon={Globe}
							canEdit
							defaultEditing={router.query.edit === "1"}
							facts={[
								{ label: "Currency", value: country.currencyCode },
								{ label: "Price factor", value: factor.toFixed(6) },
								{ label: "Shipping", value: country.shippingEnabled ? "Accepted" : "Blocked" },
							]}
						>
							{(close) => <EditCard country={country} onCancel={close} onSaved={load} />}
						</EditableSection>

						<DetailSection title={`What visitors from ${country.name} see`} description="Sample naira prices, converted at the rate above.">
							<div className="overflow-x-auto py-2">
								<table className="w-full text-sm">
									<thead>
										<tr className="text-left" style={{ color: "var(--text-hint)" }}>
											<th className="py-2 font-medium">Price in the catalogue</th>
											<th className="py-2 text-right font-medium">Shown as</th>
										</tr>
									</thead>
									<tbody>
										{SAMPLE_PRICES.map((naira) => (
											<tr key={naira} className="border-t" style={{ borderColor: "var(--border-light)" }}>
												<td className="py-2.5 tabular-nums">₦{naira.toLocaleString()}</td>
												<td className="py-2.5 text-right font-semibold tabular-nums">{isBase ? `₦${naira.toLocaleString()}` : money(naira * factor, country.currencyCode)}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</DetailSection>
					</div>

					<div className="min-w-0 space-y-5">
						<DetailSection title="How visitors are matched" description="Where a shopper is browsing from decides their currency.">
							<ol className="space-y-4 py-3 text-sm">
								{[
									["We look up their IP address", "On our server, as they browse. The result is remembered for 24 hours."],
									[`If it is in ${country.name}, prices show in ${country.currencyCode}`, "Anywhere else, or if the lookup fails, they see naira."],
									["Checkout looks again", "The server decides the currency charged, so it cannot be changed from the browser."],
								].map(([title, text], i) => (
									<li key={title} className="flex gap-3">
										<span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold" style={{ background: "var(--surface-medium)", color: "var(--color-primary)" }}>
											{i + 1}
										</span>
										<div className="min-w-0">
											<p className="font-medium" style={{ color: "var(--text-primary)" }}>
												{title}
											</p>
											<p className="mt-0.5 text-xs" style={{ color: "var(--text-hint)" }}>
												{text}
											</p>
										</div>
									</li>
								))}
							</ol>
						</DetailSection>

						<DetailSection title="VPNs and proxies" description="What happens when the IP is not where the shopper is.">
							<div className="space-y-2 py-3 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
								<p>A shopper on a VPN is matched to the VPN&apos;s country, not their own, so they can see (and be charged in) a currency that is not theirs.</p>
								<p>While price factors are plain exchange rates, as they are now, a VPN cannot get anyone a cheaper price. It only changes the currency shown.</p>
							</div>
						</DetailSection>
					</div>
				</div>
			</div>
			<RecordActivity type="Country" id={country.id} created={{ at: (country as any).createdAt, by: (country as any).createdBy }} />
		</AdminLayout>
	);
};

export default withAdminAuth(CountryDetail);
