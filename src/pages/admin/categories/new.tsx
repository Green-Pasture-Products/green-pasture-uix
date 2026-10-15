import withAdminAuth from "@/_components/withAdminAuth";
import { NameDescriptionCreatePage } from "@/_components/NameDescriptionRecordPage";
import { categoryConfig } from "@/_components/nameDescriptionConfigs";

export default withAdminAuth(() => <NameDescriptionCreatePage config={categoryConfig} />);
