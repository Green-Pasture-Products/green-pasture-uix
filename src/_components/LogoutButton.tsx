import { useLogout } from "@/_utils/hooks";
import { LogOut } from "lucide-react";

interface LogoutProps {
	className?: string;
	onClick?: () => void;
}

export function LogoutButton({ className, onClick }: LogoutProps) {
	const { handleLogout, isLoggingOut } = useLogout();

	return (
		<button
			onClick={() => {
				handleLogout();
				onClick && onClick();
			}}
			disabled={isLoggingOut}
			className={className}
		>
			<LogOut className="h-4 w-4 inline mr-2" />
			{isLoggingOut ? "Logging out..." : "Log out"}
		</button>
	);
}
