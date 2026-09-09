import ActiveDownloadsPanel from "./active-dowloads-panel";
import DownloadsHeader from "./header";
import { useEffect, useState } from "react";
import NewDownloadModal, {
  type NewDownloadValues,
} from "@components/downloads/new-download-modal";
import { toast } from "@components/ui/toast";
import type { DownloadProgress, Response } from "../../../../shared/response";
import { useDownload, type DownloadStatus } from "@/provider/download-provider";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@components/ui/button";
import { ChevronUpIcon, DownloadIcon } from "lucide-react";

export default function Page() {
  const [showNewDownload, setShowNewDownload] = useState(false);
  const {
    setActiveDownloads,
    setShowActiveDownloadsPanel,
    showActiveDownloadsPanel,
  } = useDownload();

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

    const dowloadStatusMap = values.reduce(
      (acc, value) => {
        const progress: DownloadStatus = {
          total: 0,
          downloaded: 0,
          progress: 0,
          fileUid: value.id,
          fileName: value.fileName!,
          fileBaseDir: "",
          status: "started",
        };
        acc[value.id] = progress;
        return acc;
      },
      {} as Record<string, DownloadStatus>,
    );
    setActiveDownloads(dowloadStatusMap);
    setShowActiveDownloadsPanel(true);

    for (const value of values) {
      // send request without awaiting
      window.download.getRemoteFileAsync(value.fileName!, value.url, value.id);
    }
  }

  // on progress update from the download manager
  useEffect(() => {
    const unsubscribe = window.download.onProgress(
      (response: Response<DownloadProgress>) => {
        setActiveDownloads((prev) => {
          const updated = { ...prev };
          updated[response.data!.fileUid] = {
            total: response.data!.totalBytes,
            downloaded: response.data!.downloadedBytes,
            progress:
              response.data!.totalBytes > 0
                ? response.data!.downloadedBytes / response.data!.totalBytes
                : 0,
            fileUid: response.data!.fileUid,
            fileName: response.data!.file,
            fileBaseDir: response.data!.baseDir,
            status: "in_progress",
          };
          return updated;
        });
      },
    );

    return () => unsubscribe();
  }, [setActiveDownloads]);

  // on initial download information from the download manager
  useEffect(() => {
    const unsubscribeInitial = window.download.onInitial(
      (response: Response<DownloadProgress>) => {
        setActiveDownloads((prev) => {
          const updated = { ...prev };
          updated[response.data!.fileUid] = {
            total: response.data!.totalBytes,
            downloaded: response.data!.downloadedBytes,
            progress:
              response.data!.totalBytes > 0
                ? response.data!.downloadedBytes / response.data!.totalBytes
                : 0,
            fileUid: response.data!.fileUid,
            fileName: response.data!.file,
            fileBaseDir: response.data!.baseDir,
            status: "started",
          };
          return updated;
        });
      },
    );

    return () => unsubscribeInitial();
  }, [setActiveDownloads]);

  // on completed download information from the download manager
  useEffect(() => {
    const unsubscribeCompleted = window.download.onCompleted(
      (response: Response<DownloadProgress>) => {
        setActiveDownloads((prev) => {
          const updated = { ...prev };
          updated[response.data!.fileUid] = {
            total: response.data!.totalBytes,
            downloaded: response.data!.downloadedBytes,
            progress:
              response.data!.totalBytes > 0
                ? response.data!.downloadedBytes / response.data!.totalBytes
                : 0,
            fileUid: response.data!.fileUid,
            fileName: response.data!.file,
            fileBaseDir: response.data!.baseDir,
            status: "completed",
          };
          return updated;
        });
      },
    );

    return () => unsubscribeCompleted();
  }, [setActiveDownloads]);

  return (
    <AppLayout>
      <div className="w-full h-full flex flex-col">
        <DownloadsHeader onNewDownload={() => setShowNewDownload(true)} />
        {showNewDownload && (
          <NewDownloadModal
            open={showNewDownload}
            onOpenChange={setShowNewDownload}
            onStart={handleStart}
          />
        )}
        <div className="flex-1 overflow-auto bg-red-400"></div>
        {!showActiveDownloadsPanel && (
          <div className="flex shrink-0 justify-end border-t border-slate-200/80 bg-sidebar px-6 py-2 dark:border-border">
            <Button
              onClick={() => setShowActiveDownloadsPanel(true)}
              className="group h-10 gap-2 rounded-md bg-stitch-secondary text-stitch-on-secondary
               px-4 font-semibold shadow-sm transition-colors
               hover:bg-stitch-secondary/90 focus-visible:ring-2 focus-visible:ring-blue-500/50 
               dark:bg-stitch-secondary dark:text-stitch-on-secondary 
               dark:hover:bg-stitch-secondary/90 cursor-pointer"
            >
              <DownloadIcon aria-hidden="true" className="size-4" />
              Open downloads
              <ChevronUpIcon
                aria-hidden="true"
                className="size-4 transition-transform group-hover:-translate-y-0.5"
              />
            </Button>
          </div>
        )}
        {showActiveDownloadsPanel && <ActiveDownloadsPanel />}
      </div>
    </AppLayout>
  );
}
