import AppLayout from "@/layouts/app-layout";
import DownloadsHeader from "./header";
import { useEffect, useState } from "react";
import NewDownloadModal, {
  type NewDownloadValues,
} from "@components/downloads/new-download-modal";
import { toast } from "@components/ui/toast";
import type { DownloadProgress, Response } from "../../../../shared/response";
import { useDownload, type DownloadStatus } from "@/provider/download-provider";

export default function Page() {
  const [showNewDownload, setShowNewDownload] = useState(false);
  const { setActiveDownloads } = useDownload();

  async function handleStart(values: NewDownloadValues[]) {
    for (const value of values) {
      if (!value.url) {
        toast.add({
          title: "Invalid URL",
          description: "Please provide a valid download URL.",
          type: "error",
        });
        return;
      }

      if (!value.fileName) {
        value.fileName = crypto.randomUUID();
      }
    }

    for (const value of values) {
      await window.download.getRemoteFileAsync(
        value.fileName!,
        value.url,
        value.id,
      );
    }

    const dowloadStatusMap = values.reduce(
      (acc, value) => {
        const progress: DownloadStatus = {
          total: 0,
          downloaded: 0,
          progress: 0,
          fileUid: value.id,
          fileName: value.fileName!,
        };
        acc[value.id] = progress;
        return acc;
      },
      {} as Record<string, DownloadStatus>,
    );
    setActiveDownloads(dowloadStatusMap);
  }

  useEffect(() => {
    const unsubscribe = window.download.onProgress(
      (response: Response<DownloadProgress>) => {
        console.log(response);
      },
    );

    return () => unsubscribe();
  }, []);

  return (
    <AppLayout>
      <DownloadsHeader onNewDownload={() => setShowNewDownload(true)} />
      {showNewDownload && (
        <NewDownloadModal
          open={showNewDownload}
          onOpenChange={setShowNewDownload}
          onStart={handleStart}
        />
      )}
    </AppLayout>
  );
}
