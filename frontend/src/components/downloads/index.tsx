import AppLayout from "@/layouts/app-layout";
import DownloadsHeader from "./header";
import { useState } from "react";
import NewDownloadModal from "./new-download-moda";

export default function Page() {
  const [showNewDownload, setShowNewDownload] = useState(false);

  return (
    <AppLayout>
      <DownloadsHeader onNewDownload={() => setShowNewDownload(true)} />
      {showNewDownload && (
        <NewDownloadModal
          open={showNewDownload}
          onOpenChange={setShowNewDownload}
        />
      )}
    </AppLayout>
  );
}
