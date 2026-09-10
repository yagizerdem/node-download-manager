import gsap from "gsap";
import { PauseIcon, PlayIcon, XIcon } from "lucide-react";
import { useDownload, type DownloadStatus } from "@/provider/download-provider";
import { Button } from "@components/ui/button";
import { Progress } from "@components/ui/progress";

import { useLayoutEffect, useRef } from "react";

interface ActiveDownloadsFooterProps {
  onControl: (
    download: DownloadStatus,
    action: "pause" | "continue" | "cancel",
  ) => Promise<void>;
}

function ActiveDownloadsFooter({ onControl }: ActiveDownloadsFooterProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { activeDownloads, setShowActiveDownloadsFooter } = useDownload();
  const downloads = Object.values(activeDownloads);

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo(
        panelRef.current,
        { yPercent: 100 },
        { yPercent: 0, duration: 0.4, ease: "power2.out" },
      );
    }, panelRef);

    return () => context.revert();
  }, []);

  function handleClosePanel() {
    gsap.to(panelRef.current, {
      yPercent: 100,
      duration: 0.4,
      ease: "power2.in",
      onComplete: () => setShowActiveDownloadsFooter(false),
    });
  }

  return (
    <div
      ref={panelRef}
      className=" z-50 min-h-20 max-h-40 overflow-y-auto
       rounded-t-xl  bg-stitch-surface-container-low text-primary shadow-lg "
    >
      <div className="flex flex-row justify-end items-center align-middle">
        <Button
          className="w-6 h-6 cursor-pointer m-1sd"
          onMouseUp={() => handleClosePanel()}
        >
          <XIcon />
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        {downloads.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active downloads.</p>
        ) : (
          downloads.map((download) => (
            <ActiveDownloadItem
              download={download}
              onControl={onControl}
              key={download.fileUid}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface ActiveDownloadItemProps {
  download: DownloadStatus;
  onControl: ActiveDownloadsFooterProps["onControl"];
}

function ActiveDownloadItem({ download, onControl }: ActiveDownloadItemProps) {
  const isFinished =
    download.status === "completed" ||
    download.status === "failed" ||
    download.status === "canceled";
  const isIndeterminate =
    download.total <= 0 && !isFinished && download.status !== "paused";
  const isPaused = download.status === "paused";

  const percentage =
    download.status === "completed"
      ? 100
      : Number.isFinite(download.progress)
        ? Math.min(100, Math.max(0, download.progress * 100))
        : 0;

  function togglePause() {
    if (isPaused) {
      // continue the download
      void onControl(download, "continue");
    } else {
      // Pause the download
      void onControl(download, "pause");
    }
  }

  function cancel() {
    void onControl(download, "cancel");
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
      <div className="min-w-0 flex-1 basis-48 space-y-2">
        <div className="flex items-center gap-3">
          <Progress
            className="flex-1"
            value={isIndeterminate ? null : percentage}
            aria-label={`${download.fileName} download progress`}
          />
          <span className="w-12 text-right text-xs tabular-nums">
            {isIndeterminate ? "—" : `${Math.round(percentage)}%`}
          </span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium" title={download.fileName}>
            {download.fileName}
          </p>
          <p
            className="truncate text-xs text-muted-foreground"
            title={download.fileBaseDir}
          >
            {download.fileBaseDir || "Preparing download folder…"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatStatus(download)}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={isFinished}
          onClick={() => togglePause()}
          aria-label={`${isPaused ? "Continue" : "Pause"} ${download.fileName}`}
        >
          {isPaused ? <PlayIcon /> : <PauseIcon />}
          {isPaused ? "Continue" : "Pause"}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          disabled={isFinished}
          onClick={() => cancel()}
          aria-label={`Cancel ${download.fileName}`}
        >
          <XIcon />
          Cancel
        </Button>
      </div>
    </div>
  );
}

function formatStatus(download: DownloadStatus) {
  switch (download.status) {
    case "completed":
      return "Completed";
    case "failed":
      return "Failed";
    case "in_progress":
      return "In Progress";
    case "paused":
      return "Paused";
    case "canceled":
      return "Canceled";
    case "started":
      return "Starting…";
    default:
      return "Unknown";
  }
}

export default ActiveDownloadsFooter;
