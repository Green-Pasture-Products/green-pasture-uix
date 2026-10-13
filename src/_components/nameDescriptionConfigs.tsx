import { Tag, Tags } from "lucide-react";
import type { RecordConfig } from "@/_components/NameDescriptionRecordPage";
import axiosInstance from "@/_utils/axiosInstance";

// Categories are the backend's "products" resource.
export const categoryConfig: RecordConfig = {
	entityType: "Product",
	label: "Category",
	listPath: "/admin/categories",
	listLabel: "Back to Categories",
	privileges: { write: ["UPDATE_PRODUCT", "MANAGE_PRODUCTS"], delete: ["DELETE_PRODUCT", "MANAGE_PRODUCTS"] },
	icon: Tags,
	api: {
		get: async (id) => (await axiosInstance.get(`products/${id}`)).data?.data ?? null,
		create: async (v) => void (await axiosInstance.post("products/create", v)),
		update: async (id, v) => void (await axiosInstance.patch(`products/update/${id}`, v)),
		setActive: async (id, active) => void (await axiosInstance.patch(`products/${active ? "activate" : "deactivate"}`, { ids: [id] })),
		remove: async (id) => void (await axiosInstance.delete(`products/${id}`)),
	},
};

export const tagConfig: RecordConfig = {
	entityType: "Tag",
	label: "Tag",
	listPath: "/admin/tags",
	listLabel: "Back to Tags",
	privileges: { write: ["UPDATE_PRODUCT", "MANAGE_PRODUCTS"], delete: ["DELETE_PRODUCT", "MANAGE_PRODUCTS"] },
	icon: Tag,
	api: {
		get: async (id) => (await axiosInstance.get(`tags/${id}`)).data?.data ?? null,
		create: async (v) => void (await axiosInstance.post("tags", v)),
		update: async (id, v) => void (await axiosInstance.patch(`tags/${id}`, v)),
		setActive: async (id, activate) => void (await axiosInstance.patch(`tags/${id}/status`, { activate })),
		remove: async (id) => void (await axiosInstance.delete(`tags/${id}`)),
	},
	extraFacts: (r) => [{ label: "Slug", value: (r as any).slug ? <code className="text-xs">{(r as any).slug}</code> : "" }],
};

