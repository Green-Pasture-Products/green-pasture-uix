export const pageRoutes = [
	{
		id: 1,
		label: "dashboard",
		link: "/admin/dashboard",
		// icon: <DashboardIcon />,
		// allowedRoles: [5, 1, 2, 3, 4],
	},
	{
		id: 2,
		label: "users",
		link: "/admin/users",
		// icon: <RequestsIcon />,
		// allowedRoles: [5, 1, 3, 4],
	},
	{
		id: 3,
		label: "orders",
		link: "/admin/orders",
		// icon: <ItemsIcon />,
		// allowedRoles: [5, 1, 2, 3, 4],
	},
	{
		id: 4,
		label: "products",
		link: "/admin/products",
		// icon: <ItemsIcon />,
		// allowedRoles: [5, 1, 2, 3, 4],
	},
];

export const getPageNames = (link: string) => {
	switch (link) {
		case "/admin/dashboard":
			return "dashboard";
		case "/admin/users":
			return "users";
		case "/admin/users/[id]":
			return "users";
		case "/admin/products":
			return "products";
		case "/admin/products/[id]":
			return "products";
		case "/admin/orders":
			return "orders";
		case "/admin/orders/[id]":
			return "orders";
		case "/admin/profile":
			return "profile";
		default:
			return "";
	}
};
