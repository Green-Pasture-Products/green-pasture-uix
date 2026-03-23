import type { NextApiRequest, NextApiResponse } from "next";
import { appConstants } from "@/_redux/constants";
import formidable from "formidable";

const BACKEND_URL = appConstants.API_BASE_URL;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid item ID" });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No authorization header" });

    if (req.method === "PATCH") {
      const form = formidable();
      const [fields] = await form.parse(req);

      const formData = new FormData();
      if (fields.productId?.[0]) formData.append("productId", String(Number(fields.productId[0])));
      if (fields.name?.[0]) formData.append("name", fields.name[0]);
      if (fields.price?.[0]) formData.append("price", String(parseFloat(fields.price[0])));
      if (fields.unit?.[0]) formData.append("unit", String(parseInt(fields.unit[0])));
      if (fields.description?.[0]) formData.append("description", fields.description[0]);

      const response = await fetch(`${BACKEND_URL}items/${id}`, {
        method: "PATCH",
        headers: { "Authorization": authHeader },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return res.status(response.status).json({ error: errorData.message || "Failed to update item" });
      }

      const data = await response.json();
      return res.status(200).json(data);
    }

    if (req.method === "DELETE") {
      const response = await fetch(`${BACKEND_URL}items/${id}`, {
        method: "DELETE",
        headers: { "Authorization": authHeader },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return res.status(response.status).json({ error: errorData.message || "Failed to delete item" });
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });

  } catch (error) {
    return res.status(500).json({ error: "Internal server error", details: String(error) });
  }
}

export const config = {
  api: { bodyParser: false },
};