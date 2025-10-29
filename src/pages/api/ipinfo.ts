import { appConstants } from "@/_redux/constants";
import { logger } from "@/_utils";
import type { NextApiRequest, NextApiResponse } from "next";
import { IPinfoWrapper, IPinfo } from "node-ipinfo";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<IPinfo | { error: string }>
) {
	try {
		const ip =
			(req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
			req.socket.remoteAddress ||
			"";

		const token = appConstants.IPINFO_TOKEN;
		if (!token) {
			return res.status(500).json({ error: "IPINFO_TOKEN is missing" });
		}

		// Initialize IPinfo client
		const ipinfoWrapper = new IPinfoWrapper(token);

		// Fetch IP info
		const data: IPinfo = await ipinfoWrapper.lookupIp(ip);

		// Handle local development (bogon IPs)
		if (data.bogon && process.env.NODE_ENV === "development") {
			return res.status(200).json({
				...data,
				country: "NG", // Default for development
				city: "Isolo",
				region: "Lagos State",
			} as IPinfo);
		}

		res.status(200).json(data);
	} catch (error) {
		logger.error("IPInfo Error:", error);
		res.status(500).json({ error: "Failed to fetch IP info" });
	}
}
