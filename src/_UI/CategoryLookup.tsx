"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Plus, Search, Tags } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/egfm/popover";
import { FieldShell } from "./FieldShell";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { categoryAction } from "@/_redux/actions/category.action";
import { htmlToText } from "@/_utils/htmlToText";
import { cn } from "@/lib/utils";

interface CategoryLookupProps {
	value?: string;
	onChange: (id: string) => void;
	label?: string;
	required?: boolean;
	error?: string;
	hint?: string;
	disabled?: boolean;
}

const fold = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/**
 * Pick a category from a searchable list that shows what each one is (name and a line of its description), so the
 * right one is obvious without opening the Categories page. Finds by any word in the name or description. A "New category"
 * shortcut opens the create page in another tab, so a half-filled product form is never lost.
 */
const CategoryLookup: React.FC<CategoryLookupProps> = ({ value, onChange, label = "Category", required, error, hint, disabled }) => {
	const dispatch = useAppDispatch();
	const { productCategories, isFetchingAllCategories } = useAppSelector((s: any) => s.category);
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [active, setActive] = useState(0);

	useEffect(() => {
		if (!productCategories.length) dispatch(categoryAction.fetchAllCategories({ limit: 100 }));
	}, [dispatch, productCategories.length]);

	const selected = productCategories.find((c: any) => String(c.id) === String(value));
	const shown = useMemo(() => {
		const q = fold(query.trim());
		if (!q) return productCategories;
		return productCategories.filter((c: any) => fold(`${c.name} ${htmlToText(c.description)}`).includes(q));
	}, [productCategories, query]);

	const pick = (id: string) => {
		onChange(id);
		setOpen(false);
	};

	const onKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "ArrowDown" || e.key === "ArrowUp") {
			e.preventDefault();
			setActive((i) => Math.min(Math.max(i + (e.key === "ArrowDown" ? 1 : -1), 0), shown.length - 1));
		} else if (e.key === "Enter") {
			e.preventDefault();
			if (shown[active]) pick(String(shown[active].id));
		}
	};

	return (
		<FieldShell label={label} required={required} error={error} hint={hint}>
			<Popover
				open={open}
				onOpenChange={(next) => {
					setOpen(next);
					if (next) {
						setQuery("");
						setActive(Math.max(0, productCategories.findIndex((c: any) => String(c.id) === String(value))));
					}
				}}
			>
				<PopoverTrigger asChild>
					<button
						type="button"
						role="combobox"
						aria-expanded={open}
						aria-haspopup="listbox"
						aria-invalid={!!error}
						disabled={disabled}
						className="border-input bg-card hover:border-brand/60 focus:ring-ring flex min-h-11 w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive"
					>
						<span className="bg-brand/15 text-brand-ink flex size-7 shrink-0 items-center justify-center rounded-lg">
							<Tags className="size-4" />
						</span>
						<span className="min-w-0 flex-1">
							<span className={cn("block truncate text-sm font-medium", !selected && "text-muted-foreground font-normal")}>{selected ? selected.name : isFetchingAllCategories ? "Loading categories…" : "Choose a category"}</span>
						</span>
						<ChevronDown className={cn("text-muted-foreground size-4 shrink-0 transition-transform duration-200", open && "rotate-180")} />
					</button>
				</PopoverTrigger>
				<PopoverContent align="start" className="w-(--radix-popover-trigger-width) min-w-64 rounded-xl p-2">
					<div className="relative mb-2">
						<Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
						<input
							type="text"
							autoFocus
							placeholder="Search categories"
							aria-label="Search categories"
							autoComplete="off"
							value={query}
							onChange={(e) => {
								setQuery(e.target.value);
								setActive(0);
							}}
							onKeyDown={onKeyDown}
							className="border-input bg-background focus-visible:ring-ring h-10 w-full rounded-lg border pr-3 pl-9 text-sm outline-none focus-visible:ring-2"
						/>
					</div>
					<ul role="listbox" aria-label="Categories" className="max-h-72 space-y-0.5 overflow-y-auto">
						{shown.length === 0 && <li className="text-muted-foreground px-3 py-6 text-center text-sm">No category matches “{query}”.</li>}
						{shown.map((c: any, i: number) => {
							const isSelected = String(c.id) === String(value);
							const about = htmlToText(c.description);
							return (
								<li
									key={c.id}
									role="option"
									aria-selected={isSelected}
									onClick={() => pick(String(c.id))}
									onMouseMove={() => setActive(i)}
									className={cn("flex min-h-12 cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 select-none", i === active && "bg-accent")}
								>
									<Check className={cn("text-brand size-4 shrink-0 stroke-[2.5]", !isSelected && "invisible")} />
									<span className="min-w-0 flex-1">
										<span className={cn("block truncate text-sm", isSelected && "font-semibold")}>{c.name}</span>
										{about && <span className="text-muted-foreground block truncate text-xs">{about}</span>}
									</span>
								</li>
							);
						})}
					</ul>
					<a href="/admin/categories/new" target="_blank" rel="noreferrer" className="text-brand-ink hover:bg-accent mt-1 flex min-h-11 items-center gap-2 rounded-lg px-2.5 text-sm font-medium">
						<Plus className="size-4" /> New category
					</a>
				</PopoverContent>
			</Popover>
		</FieldShell>
	);
};

export default CategoryLookup;
