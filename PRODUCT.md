# Product

## Register

brand

## Users

Nigerian (and broader West African diaspora) shoppers looking for organic dietary/wellness supplements — immunity, fertility, energy — sourced and pressed from real farmed roots, leaves, and seeds. They land on the marketing site to discover the brand story and shop, then move into the product/app surfaces (cart, checkout, orders) to buy. Heavy mobile usage.

## Product Purpose

GP Organics sells traceable, farm-to-jar organic supplements. The landing page's job is to earn trust in "real ingredients, real sourcing" fast, then move the visitor into the shelf (product catalog) and checkout without friction — especially on mobile, where most traffic lands.

## Brand Personality

Rooted/authentic, calm-confident, warm-natural. Voice draws on tactile, specific language ("pressed from organically farmed roots", "traced from Northern Nigerian soil") rather than generic wellness marketing speak. Deep teal + lime green + warm mint/cream palette, Fraunces serif for display (botanical, "grown not manufactured" feel) paired with DM Sans for UI.

## Anti-references

Generic SaaS/supplement-store templates: gradient-washed hero overlays, cookie-cutter product-card grids that clip on mobile, cramped side-by-side CTAs, carousels that silently overflow their container. Nothing that reads as "stock wellness brand" — specificity (real farm/place names, real numbers like "12 partner farms") over vague claims.

## Design Principles

- Mobile-first fit: hero art, filters, and product cards must resolve cleanly at phone width, not just scale down from desktop.
- No gradient crutches: rely on the existing solid-color token system (`--surface-*`, `--color-primary`) so light/dark theming stays consistent instead of a hardcoded gradient overlay.
- Real content over placeholders: testimonial names, quotes, and any user-facing copy should read as genuine, not lorem-ipsum-shaped.
- Reuse existing tokens/components (tailwind.config.ts brand colors, CSS custom properties in globals.css) rather than inventing new ad hoc styles per fix.

## Accessibility & Inclusion

Standard WCAG AA: body text ≥4.5:1 contrast, large/heading text ≥3:1, no color-only affordances, all interactive controls (filters, carousel dots, buttons) reachable and legible at mobile width. No stated additional requirements beyond that.
