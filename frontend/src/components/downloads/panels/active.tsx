import { useRef, useState } from "react";
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  CircleStopIcon,
  DownloadIcon,
  FileIcon,
  LoaderCircleIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  TimerIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDownload, type DownloadStatus } from "@/provider/download-provider";

interface ActivePanelProps {
  onStart: (download: DownloadStatus) => Promise<void>;
  onControl: (
    download: DownloadStatus,
    action: "pause" | "continue" | "cancel",
  ) => Promise<void>;
}

const statusLabels: Record<DownloadStatus["status"], string> = {
  started: "Starting",
  in_progress: "Downloading",
  paused: "Paused",
  failed: "Failed",
  canceled: "Canceled",
  completed: "Completed",
};

const statusStyles: Record<DownloadStatus["status"], string> = {
  started: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  in_progress: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  paused: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  failed: "bg-destructive/10 text-destructive",
  canceled: "bg-muted text-muted-foreground",
  completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

const statusIcons = {
  started: LoaderCircleIcon,
  in_progress: DownloadIcon,
  paused: PauseIcon,
  failed: AlertCircleIcon,
  canceled: CircleStopIcon,
  completed: CheckCircle2Icon,
} satisfies Record<DownloadStatus["status"], typeof DownloadIcon>;

export default function ActivePanel(props: ActivePanelProps) {
  const { activeDownloads } = useDownload();
  const downloads = Object.values(activeDownloads).sort(
    (first, second) =>
      (Date.parse(second.downloadedAt) || 0) -
      (Date.parse(first.downloadedAt) || 0),
  );
  const transferring = downloads.filter((download) =>
    ["started", "in_progress"].includes(download.status),
  ).length;
  const paused = downloads.filter(
    (download) => download.status === "paused",
  ).length;
  const completed = downloads.filter(
    (download) => download.status === "completed",
  ).length;

  return (
    <section
      className="space-y-5 p-4 text-foreground sm:p-6"
      aria-label="Download activity"
    >
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <DownloadIcon className="size-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Download queue
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Activity
              <span className="ml-3 align-middle text-sm font-normal text-muted-foreground">
                {downloads.length} {downloads.length === 1 ? "file" : "files"}
              </span>
            </h2>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs tabular-nums">
          <SummaryPill label="Transferring" value={transferring} tone="blue" />
          <SummaryPill label="Paused" value={paused} tone="amber" />
          <SummaryPill label="Completed" value={completed} tone="green" />
        </div>
      </header>
      <ul className="space-y-3">
        {downloads.length === 0 ? (
          <li className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-10 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <DownloadIcon className="size-6" />
            </div>
            <h3 className="font-semibold">No download activity yet</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              New, paused, completed, canceled, and failed downloads will all
              appear here.
            </p>
          </li>
        ) : (
          downloads.map((download) => (
            <ActiveRow key={download.fileUid} download={download} {...props} />
          ))
        )}
      </ul>
    </section>
  );
}

function SummaryPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "blue" | "amber" | "green";
}) {
  const dotColor = {
    blue: "bg-blue-500",
    amber: "bg-amber-500",
    green: "bg-emerald-500",
  }[tone];

  return (
    <span className="flex items-center gap-2 rounded-lg border border-border bg-stitch-surface-container-low px-3 py-2 text-muted-foreground">
      <span className={`size-2 rounded-full ${dotColor}`} aria-hidden="true" />
      {label}
      <strong className="font-semibold text-foreground">{value}</strong>
    </span>
  );
}

function ActiveRow({
  download,
  onStart,
  onControl,
}: ActivePanelProps & { download: DownloadStatus }) {
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const retryable =
    download.status === "failed" || download.status === "canceled";
  const paused = download.status === "paused";
  const terminal = retryable || download.status === "completed";
  const StatusIcon = statusIcons[download.status];
  const percentage = Number.isFinite(download.progress)
    ? Math.min(100, Math.max(0, download.progress * 100))
    : 0;
  const unknownSize = download.total <= 0;

  async function act(action: "retry" | "pause" | "continue" | "cancel") {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    try {
      if (action === "retry") {
        // onStart updates the row immediately; keep controls available during the transfer.
        void onStart(download);
      } else await onControl(download, action);
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return (
    <li className="group rounded-xl border border-border bg-stitch-surface-container-low p-4 transition-colors hover:border-primary/30 sm:p-5">
      <div className="flex min-w-0 items-start gap-4">
        <div
          className={`mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-lg ${statusStyles[download.status]}`}
        >
          <StatusIcon
            className={`size-5 ${download.status === "started" ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3
                className="truncate text-sm font-semibold"
                title={download.fileName}
              >
                {download.fileName}
              </h3>
              <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                <FileIcon className="size-3 shrink-0" />
                <span className="truncate" title={getSource(download.url)}>
                  {getSource(download.url)}
                </span>
              </p>
            </div>
            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[download.status]}`}
            >
              <StatusIcon className="size-3" aria-hidden="true" />
              {statusLabels[download.status]}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Progress
                className="h-2 flex-1"
                value={unknownSize && !terminal && !paused ? null : percentage}
                aria-label={`${download.fileName} download progress`}
              />
              <span className="w-11 text-right text-xs font-medium tabular-nums">
                {unknownSize ? "—" : `${Math.round(percentage)}%`}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span className="tabular-nums">
                {formatBytes(download.downloaded)} of{" "}
                {unknownSize ? "unknown size" : formatBytes(download.total)}
              </span>
              <span className="flex items-center gap-1.5">
                <TimerIcon className="size-3.5" />
                {formatDate(download.downloadedAt)}
              </span>
            </div>
          </div>
          {download.error && (
            <p
              className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive"
              role="alert"
            >
              {download.error}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
            <p
              className="min-w-0 truncate text-xs text-muted-foreground"
              title={download.absoluteFilePath || download.url}
            >
              {download.absoluteFilePath || "Preparing destination…"}
            </p>
            <div className="flex shrink-0 gap-2">
              {retryable && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy || !download.url}
                  onClick={() => act("retry")}
                  aria-label={`Retry ${download.fileName}`}
                >
                  <RotateCcwIcon />
                  Retry
                </Button>
              )}
              {!terminal && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => act(paused ? "continue" : "pause")}
                  aria-label={`${paused ? "Continue" : "Pause"} ${download.fileName}`}
                >
                  {paused ? <PlayIcon /> : <PauseIcon />}
                  {paused ? "Continue" : "Pause"}
                </Button>
              )}
              {!terminal && (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => act("cancel")}
                  aria-label={`Cancel ${download.fileName}`}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <XIcon />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

function getSource(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url || "Unknown source";
  }
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time unavailable";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const unit = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 4);
  return `${Number((bytes / 1024 ** unit).toFixed(1))} ${["B", "KB", "MB", "GB", "TB"][unit]}`;
}
