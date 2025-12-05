export const appConstants = {
	API_BASE_URL:
		process.env.NEXT_PUBLIC_API_BASE_URL ||
		`http://localhost:3080/api/v1/`,

	IPINFO_TOKEN: process.env.IPINFO_TOKEN || `81a1cbe5574c88`,

	WHATSAPP_URL:
		process.env.WHATSAPP_URL ||
		`https://chat.whatsapp.com/EvV74KvWbB34wU0Zyte1tN`,

	FACEBOOK_URL:
		process.env.FACEBOOK_URL || `https://www.facebook.com/share/1GGim6eNuU/`,

	INSTAGRAM_URL:
		process.env.INSTAGRAM_URL ||
		`https://www.instagram.com/greenpastureorganics`,

	ROOT_STORAGE: "Green_Pastures_GlObAl-StAtE" as const,

	FREE_SHIPPING_THRESHOLD: 50000 as const,

	SHIPPING_FEE: 10000 as const,
};
