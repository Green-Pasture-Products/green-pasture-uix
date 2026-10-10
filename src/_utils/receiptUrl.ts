export const isPdfReceipt = (url: string, fileName?: string): boolean =>
	/\.pdf(?:$|[?#])/i.test(url) || Boolean(fileName && fileName.toLowerCase().endsWith(".pdf"));

/**
 * Cloudinary may block direct inline PDF delivery with a 401. Its attachment
 * delivery flag permits the same PDF to be downloaded/opened by the user.
 */
export const getReceiptDeliveryUrl = (url: string, fileName?: string): string => {
	if (!isPdfReceipt(url, fileName) || !url.includes("res.cloudinary.com")) return url;
	return url.replace(/\/image\/upload\//i, "/image/upload/fl_attachment/");
};