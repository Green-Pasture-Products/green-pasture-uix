/** The same rule the API uses for tag slugs ("Pregnant & Nursing" -> "pregnant-nursing"), so a preview matches what is saved. */
export function slugify(name: string | undefined | null): string {
	return (name ?? "")
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}
