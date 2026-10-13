import withAdminAuth from "@/_components/withAdminAuth";
import { NameDescriptionRecordPage } from "@/_components/NameDescriptionRecordPage";
import { tagConfig } from "@/_components/nameDescriptionConfigs";

export default withAdminAuth(() => <NameDescriptionRecordPage config={tagConfig} />);
