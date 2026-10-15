import withAdminAuth from "@/_components/withAdminAuth";
import { NameDescriptionCreatePage } from "@/_components/NameDescriptionRecordPage";
import { tagConfig } from "@/_components/nameDescriptionConfigs";

export default withAdminAuth(() => <NameDescriptionCreatePage config={tagConfig} />);
