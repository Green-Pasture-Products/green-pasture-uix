import type { NextApiRequest, NextApiResponse } from "next";
import { appConstants } from "@/_redux/constants";

const BACKEND_URL = appConstants.API_BASE_URL;

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		// Extract auth token from headers
		const authHeader = req.headers.authorization;
		if (!authHeader) {
			return res.status(401).json({ error: "No authorization header" });
		}

		if (req.method === "GET") {
			// Fetch all products from backend
			const { page = 1, limit = 100, search = "", filter = "" } = req.query;
			const queryParams = new URLSearchParams({
				page: String(page),
				limit: String(limit),
				...(search && { search: String(search) }),
				...(filter && { filter: String(filter) }),
			});

			const response = await fetch(`${BACKEND_URL}items?${queryParams}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"Authorization": authHeader,
				},
			});

			if (!response.ok) {
				return res.status(response.status).json({
					error: "Failed to fetch products from backend",
				});
			}

			const data = await response.json();
			return res.status(200).json(data);
		}

		if (req.method === "POST") {
			// Create a new product - use /items endpoint
			const response = await fetch(`${BACKEND_URL}items`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": authHeader,
				},
				body: JSON.stringify(req.body),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				return res.status(response.status).json({
					error: errorData.message || "Failed to create product",
				});
			}

			const data = await response.json();
			return res.status(201).json(data);
		}

		return res.status(405).json({ error: "Method not allowed" });
	} catch (error) {
		console.error("Products API error:", error);
		return res
			.status(500)
			.json({ error: "Internal server error", details: String(error) });
	}
}
