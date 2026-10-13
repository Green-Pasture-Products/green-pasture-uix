import withAdminAuth from "@/_components/withAdminAuth";
import { NameDescriptionRecordPage } from "@/_components/NameDescriptionRecordPage";
import { categoryConfig } from "@/_components/nameDescriptionConfigs";

export default withAdminAuth(() => <NameDescriptionRecordPage config={categoryConfig} />);
