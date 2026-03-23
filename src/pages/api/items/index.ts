import type { NextApiRequest, NextApiResponse } from "next";
import { appConstants } from "@/_redux/constants";

const BACKEND_URL = appConstants.API_BASE_URL;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No authorization header" });

    if (req.method === "GET") {
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
        return res.status(response.status).json({ error: "Failed to fetch items" });
      }

      const data = await response.json();
      return res.status(200).json(data);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error", details: String(error) });
  }
}