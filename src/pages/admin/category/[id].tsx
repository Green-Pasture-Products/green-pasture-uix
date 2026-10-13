import { Tags } from "lucide-react";
import withAdminAuth from "@/_components/withAdminAuth";
import { NameDescriptionRecordPage, type RecordConfig } from "@/_components/NameDescriptionRecordPage";
import axiosInstance from "@/_utils/axiosInstance";

// Categories are the backend's "products" resource.
const config: RecordConfig = {
	entityType: "Product",
	label: "Category",
	listPath: "/admin/categories",
	listLabel: "Back to Categories",
	privileges: { write: ["UPDATE_PRODUCT", "MANAGE_PRODUCTS"], delete: ["DELETE_PRODUCT", "MANAGE_PRODUCTS"] },
	icon: Tags,
	api: {
		get: async (id) => (await axiosInstance.get(`products/${id}`)).data?.data ?? null,
		update: async (id, v) => void (await axiosInstance.patch(`products/update/${id}`, v)),
		setActive: async (id, active) => void (await axiosInstance.patch(`products/${active ? "activate" : "deactivate"}`, { ids: [id] })),
		remove: async (id) => void (await axiosInstance.delete(`products/${id}`)),
	},
};

export default withAdminAuth(() => <NameDescriptionRecordPage config={config} />);
