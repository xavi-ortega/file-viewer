import { INodeViewer } from "@/lib/components/INodeViewer";
import { getKbId } from "@/lib/helpers/cookies";
import { getGoogleDriveConnection } from "@/lib/api/googleDriveConnection";
import { getOrganization } from "@/lib/api/organization";

export default async function Home() {
  const [{ organizationId }, { connectionId }, kbId] = await Promise.all([
    getOrganization(),
    getGoogleDriveConnection(),
    getKbId(),
  ]);

  console.log({ organizationId, connectionId, kbId });

  return (
    <INodeViewer
      title={"Google Drive Connection"}
      orgId={organizationId}
      connId={connectionId}
      kbId={kbId}
    />
  );
}
