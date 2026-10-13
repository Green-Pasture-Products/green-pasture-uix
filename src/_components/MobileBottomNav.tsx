"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { Menu } from "lucide-react";

import { MODULES, findOwningModule } from "@/_navigations/modules";
import { useHasPrivilege } from "@/_hooks/usePrivilege";
import { useInboxUnread } from "@/_hooks/useInboxUnread";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

/** The handful of pages worth one tap on a phone; everything else lives behind "More" (the sidebar sheet). */
const QUICK = ["/admin/dashboard", "/admin/orders", "/admin/inbox", "/admin/products"];

export function MobileBottomNav() {
	const router = useRouter();
	const hasPrivilege = useHasPrivilege();
	const { setOpenMobile } = useSidebar();
	const unread = useInboxUnread(true);
	const pathname = router.asPath.split("?")[0];
	const activePath = findOwningModule(pathname)?.path;
	const items = QUICK.map((p) => MODULES.find((m) => m.path === p)).filter((m): m is NonNullable<typeof m> => !!m && hasPrivilege(m.privilege));

	return (
		<nav
			aria-label="Primary"
			data-testid="mobile-bottom-nav"
			className="bg-background/90 border-border/80 fixed inset-x-0 bottom-0 z-40 flex border-t px-2 pt-1.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg backdrop-blur-xl md:hidden"
		>
			{items.map((m) => {
				const active = activePath === m.path;
				return (
					<Link key={m.path} href={m.path} aria-current={active ? "page" : undefined} className="flex flex-1 flex-col items-center gap-0.5">
						<span className={cn("relative flex h-8 w-14 items-center justify-center rounded-full transition-colors", active ? "bg-brand/15 text-ink dark:bg-brand/20 dark:text-brand shadow-xs" : "text-muted-foreground")}>
							<m.icon className={cn("size-[18px] transition-transform", active && "scale-110")} />
							{m.path === "/admin/inbox" && unread > 0 && (
								<span className="bg-brand text-brand-foreground absolute -top-0.5 right-1.5 flex size-4 items-center justify-center rounded-full text-[9px] font-bold">{unread > 9 ? "9+" : unread}</span>
							)}
						</span>
						<span className={cn("text-[10px] font-medium", active ? "text-foreground font-bold" : "text-muted-foreground")}>{m.title}</span>
					</Link>
				);
			})}
			<button type="button" onClick={() => setOpenMobile(true)} className="flex flex-1 flex-col items-center gap-0.5" aria-label="More pages">
				<span className="text-muted-foreground flex h-8 w-14 items-center justify-center rounded-full">
					<Menu className="size-[18px]" />
				</span>
				<span className="text-muted-foreground text-[10px] font-medium">More</span>
			</button>
		</nav>
	);
}
