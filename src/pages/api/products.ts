import type { NextApiRequest, NextApiResponse } from "next";
import { appConstants } from "@/_redux/constants";
import formidable from "formidable";

const BACKEND_URL = appConstants.API_BASE_URL;

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		// Extract auth token from headers
		const authHeader = req.headers.authorization;
		console.log("API Route - Auth header:", authHeader);
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

			console.log("Fetching products with token:", authHeader);
			
			const response = await fetch(`${BACKEND_URL}products?${queryParams}`, {
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
			const form = formidable()
			const [fields] = await form.parse(req);

			console.log("Parsed fields:", fields); // verify what's coming in

			const productId = fields.productId?.[0];
			const name = fields.name?.[0];
			const price = fields.price?.[0];
			const unit = fields.unit?.[0];
			const description = fields.description?.[0];
			const images = fields.images;

			//Build form data for backend
			const formData = new FormData();
			formData.append("productId", String(Number(productId)));
  			formData.append("name", String(name));
  			formData.append("price", String(parseFloat(price!)));
  			formData.append("unit", String(parseInt(unit!)));
  			formData.append("description", String(description || ""));
  			//Object.entries(req.body).forEach(([key, value]) => {
    		//formData.append(key, String(value));
  		//});
			//  Fetch each Cloudinary URL and append as a blob
  		if (images && images.length > 0) {
    		for (const imageUrl of images) {
      			try {
        			const imageResponse = await fetch(imageUrl);
        			const imageBlob = await imageResponse.blob();
        			const filename = imageUrl.split("/").pop() || "image.jpg";
        			formData.append("images", imageBlob, filename);
      			} catch (err) {
        			console.error("Failed to fetch image:", imageUrl, err);
      				}
    		}
  		} else {
    		return res.status(400).json({ error: "At least one image is required." });
  			}

  			const response = await fetch(`${BACKEND_URL}items`, { //items endpoint
    			method: "POST",
    			headers: {
      				"Authorization": authHeader, //NO Content-Type — let fetch set it
    			},
    			body: formData,
  			});

			console.log("API Route - Backend response status:", response.status);
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				console.log("API Route - Backend error:", errorData);
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

export const config = {
  api: {
    bodyParser: false, // ✅ required for multipart/form-data
  },
};
