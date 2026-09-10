import ActiveDownloadsFooter from "./active-dowloads-footer";
import DownloadsHeader from "./header";
import { useEffect, useRef, useState } from "react";
import NewDownloadModal, {
  type NewDownloadValues,
} from "@components/downloads/new-download-modal";
import { toast } from "@components/ui/toast";
import type {
  DownloadDTO,
  DownloadProgress,
  Response,
} from "../../../../shared/response";
import { useDownload, type DownloadStatus } from "@/provider/download-provider";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@components/ui/button";
import { ChevronUpIcon, DownloadIcon } from "lucide-react";
import { PanelSelection } from "./panel-selection";
import RecentPanel from "./panels/recent";
import Downloads from "./panels/dowloads";
import ActivePanel from "./panels/active";

export default function Page() {
  const runningDownloads = useRef(new Set<string>());
  const [showNewDownload, setShowNewDownload] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState<
    "downloaded" | "active" | "recent"
  >("downloaded");
  const {
    activeDownloads,
    setActiveDownloads,
    setShowActiveDownloadsFooter,
    showActiveDownloadsFooter,
    setRecentDownloads,
    setDowloadedRecords,
  } = useDownload();

  async function runDownload(download: DownloadStatus) {
    if (runningDownloads.current.has(download.fileUid)) return;
    runningDownloads.current.add(download.fileUid);
    setActiveDownloads((prev) => ({
      ...prev,
      [download.fileUid]: {
        ...download,
        status: "started",
        downloaded: 0,
        progress: 0,
        error: undefined,
      },
    }));
    try {
      const status = await window.download.getRemoteFileAsync(
        download.fileName,
        download.url,
        download.fileUid,
        download.fileBaseDir || undefined,
      );
      if (status === "canceled") {
        setActiveDownloads((prev) => ({
          ...prev,
          [download.fileUid]: { ...prev[download.fileUid], status: "canceled" },
        }));
      }
    } catch (error) {
      setActiveDownloads((prev) => ({
        ...prev,
        [download.fileUid]: {
          ...prev[download.fileUid],
          status: "failed",
          error:
            error instanceof Error
              ? error.message
              : "Download failed. Please try again.",
        },
      }));
    } finally {
      runningDownloads.current.delete(download.fileUid);
    }
  }

  async function controlDownload(
    download: DownloadStatus,
    action: "pause" | "continue" | "cancel",
  ) {
    try {
      const changed = await window.download.control(download.fileUid, action);
      if (changed && action !== "cancel") {
        setActiveDownloads((prev) => {
          const current = prev[download.fileUid];
          if (
            !current ||
            ["completed", "failed", "canceled"].includes(current.status)
          )
            return prev;
          return {
            ...prev,
            [download.fileUid]: {
              ...current,
              status: action === "pause" ? "paused" : "in_progress",
            },
          };
        });
      }
    } catch {
      toast.add({
        title: "Could not control download",
        description: "Please try again.",
        type: "error",
      });
    }
  }

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
          url: value.url,
          absoluteFilePath: "",
          status: "started",
          downloadedAt: new Date().toISOString(),
        };
        acc[value.id] = progress;
        return acc;
      },
      {} as Record<string, DownloadStatus>,
    );
    setActiveDownloads((prev) => ({ ...prev, ...dowloadStatusMap }));
    setShowActiveDownloadsFooter(true);

    for (const value of values) {
      // send request without awaiting
      void runDownload(dowloadStatusMap[value.id]);
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
            url: response.data!.url,
            absoluteFilePath: response.data!.absoluteFilePath,
            status:
              prev[response.data!.fileUid]?.status === "paused"
                ? "paused"
                : "in_progress",
            downloadedAt:
              prev[response.data!.fileUid]?.downloadedAt ??
              new Date().toISOString(),
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
            url: response.data!.url,
            absoluteFilePath: response.data!.absoluteFilePath,
            status:
              prev[response.data!.fileUid]?.status === "paused"
                ? "paused"
                : "started",
            downloadedAt:
              prev[response.data!.fileUid]?.downloadedAt ??
              new Date().toISOString(),
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
      async (response: Response<DownloadProgress>) => {
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
            url: response.data!.url,
            absoluteFilePath: response.data!.absoluteFilePath,
            status: "completed",
            downloadedAt:
              prev[response.data!.fileUid]?.downloadedAt ??
              new Date().toISOString(),
          };
          return updated;
        });

        // add record to db
        const downloadRecord: Omit<
          DownloadDTO,
          "id" | "created_at" | "updated_at"
        > = {
          url: response.data?.url || "",
          file_name: response.data!.file,
          mime_type: response.data!.mimeType,
          extension: response.data!.extension,
          root_dir: response.data!.baseDir,
          file_size: response.data!.totalBytes,
          downloaded_at:
            activeDownloads[response.data!.fileUid]?.downloadedAt ??
            new Date().toISOString(),
          marked: false,
          color: "none",
          priority: "low",
        };

        const insertResponse: Response<DownloadDTO | void> =
          await window.db.insertDownload(downloadRecord);
        console.log(insertResponse);
        if (!insertResponse.success) {
          toast.add({
            title: "Download Failed",
            description: "Failed to insert download record into the database.",
            type: "error",
          });
          return;
        }

        const newRecord = insertResponse.data;
        if (newRecord) {
          setRecentDownloads((prev) => [...prev, newRecord]);
          setDowloadedRecords((prev) => [...prev, newRecord]);
          console.log(newRecord);
        }
      },
    );

    return () => unsubscribeCompleted();
  }, [
    setActiveDownloads,
    activeDownloads,
    setRecentDownloads,
    setDowloadedRecords,
  ]);

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
        <div className="flex flex-col flex-1 min-h-0">
          <PanelSelection
            selectedPanel={selectedPanel}
            onSelectedPanelChange={(panel) => setSelectedPanel(panel)}
            className="w-full h-fit p-2"
          />
          <div className="flex flex-col flex-1 overflow-y-auto">
            {selectedPanel === "recent" && <RecentPanel />}
            {selectedPanel === "downloaded" && <Downloads />}
            {selectedPanel === "active" && (
              <ActivePanel onStart={runDownload} onControl={controlDownload} />
            )}
          </div>
        </div>
        {!showActiveDownloadsFooter && (
          <div className="flex shrink-0 justify-end border-t border-slate-200/80 bg-sidebar px-6 py-2 dark:border-border">
            <Button
              onClick={() => setShowActiveDownloadsFooter(true)}
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
        {showActiveDownloadsFooter && <ActiveDownloadsFooter />}
      </div>
    </AppLayout>
  );
}
