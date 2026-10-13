import { Tag } from "lucide-react";
import withAdminAuth from "@/_components/withAdminAuth";
import { NameDescriptionRecordPage, type RecordConfig } from "@/_components/NameDescriptionRecordPage";
import axiosInstance from "@/_utils/axiosInstance";

const config: RecordConfig = {
	entityType: "Tag",
	label: "Tag",
	listPath: "/admin/tags",
	listLabel: "Back to Tags",
	privileges: { write: ["UPDATE_PRODUCT", "MANAGE_PRODUCTS"], delete: ["DELETE_PRODUCT", "MANAGE_PRODUCTS"] },
	icon: Tag,
	api: {
		get: async (id) => (await axiosInstance.get(`tags/${id}`)).data?.data ?? null,
		update: async (id, v) => void (await axiosInstance.patch(`tags/${id}`, v)),
		setActive: async (id, activate) => void (await axiosInstance.patch(`tags/${id}/status`, { activate })),
		remove: async (id) => void (await axiosInstance.delete(`tags/${id}`)),
	},
	extraFacts: (r) => [{ label: "Slug", value: (r as any).slug ? <code className="text-xs">{(r as any).slug}</code> : "" }],
};

export default withAdminAuth(() => <NameDescriptionRecordPage config={config} />);
