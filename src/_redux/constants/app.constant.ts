export const appConstants = {
	API_BASE_URL:
		process.env.NEXT_PUBLIC_API_BASE_URL ||
		`https://green-pasture-api.onrender.com/api/v1/`,

	IPINFO_TOKEN: process.env.IPINFO_TOKEN || `81a1cbe5574c88`,

	WHATSAPP_URL:
		process.env.WHATSAPP_URL ||
		`https://chat.whatsapp.com/EvV74KvWbB34wU0Zyte1tN`,

	FACEBOOK_URL:
		process.env.FACEBOOK_URL || `https://www.facebook.com/share/1GGim6eNuU/`,

	INSTAGRAM_URL:
		process.env.INSTAGRAM_URL ||
		`https://www.instagram.com/greenpastureorganics`,

	ROOT_STORAGE: "Green_Pastures_GlObAl-StAtE_v2" as const,


	SHIPPING_FEE: 10000 as const,

	STORE_NAME: "Green Pastures Organics" as const,

	CONTACT: {
		PHONE: "+234 701 884 5177",
		PHONE_HREF: "tel:+2347018845177",
		EMAIL: "hello@gporganics.com",
		EMAIL_HREF: "mailto:hello@gporganics.com",
		ADDRESS: "Lagos, Nigeria",
	} as const,

	ADMIN_ROLES: ["STAFF", "ADMIN", "SUPER_ADMIN", "MANAGER"] as const,
};
