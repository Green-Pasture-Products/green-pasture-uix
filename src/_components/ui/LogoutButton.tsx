import { useRouter } from "next/router";
import { LogOut } from "lucide-react";
import React from "react";

import {
	removeAccessExpiryCookie,
	removeAccessToken,
	removeRefreshToken,
} from "@/_utils/storage";
import { persistor, useAppDispatch } from "@/_redux/store";
import { logout } from "@/_redux/reducers/auth.reducer";
import { authConstants } from "@/_redux/constants";
import { clearObjectFromStorage } from "@/_utils";

const LogoutButton = ({ onClick }: { onClick?: () => void }) => {
	const router = useRouter();
	const dispatch = useAppDispatch();

	const handleLogout = async () => {
		dispatch(logout());
		await persistor.purge();
		removeAccessExpiryCookie();
		removeAccessToken();
		removeRefreshToken();
		clearObjectFromStorage(authConstants.USER_KEY);
		router.push("/login");
	};

	return (
		<button
			onClick={() => {
				handleLogout();
				onClick && onClick();
			}}
			className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
		>
			<LogOut className="h-4 w-4 inline mr-2" />
			Sign out
		</button>
	);
};

export default LogoutButton;
