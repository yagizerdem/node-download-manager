import { useDownload } from "@/provider/download-provider";
import { useState } from "react";
import {
  ArchiveIcon,
  FileIcon,
  FileImageIcon,
  FileVideoIcon,
  MusicIcon,
  FolderOpenIcon,
  LayoutGridIcon,
  ListIcon,
  DownloadIcon,
  StarIcon,
  CheckCircle2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import type { ColorCode, DownloadDTO } from "../../../../../shared/response";

const colors: Record<ColorCode, string> = {
  none: "bg-muted-foreground",
  red: "bg-red-500",
  orange: "bg-orange-500",
  yellow: "bg-yellow-500",
  green: "bg-green-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
  brown: "bg-amber-800",
};

function formatSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes < 0) return "Unknown size";
  if (bytes === 0) return "0 B";
  const unit = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 4);
  return `${Number((bytes / 1024 ** unit).toFixed(1))} ${["B", "KB", "MB", "GB", "TB"][unit]}`;
}

function formatDate(value: string | null) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not recorded"
    : date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

export default function RecentPanel() {
  const { recentDownloads } = useDownload();
  const [view, setView] = useState<"grid" | "list">("grid");
  const downloads = [...recentDownloads].sort(
    (a, b) =>
      (Date.parse(b.downloaded_at || b.created_at) || 0) -
      (Date.parse(a.downloaded_at || a.created_at) || 0),
  );

  return (
    <section
      className="w-full space-y-5 p-4 text-foreground sm:p-6"
      aria-label="Recent downloads"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Recent Downloads
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your latest files, at a glance.
          </p>
        </div>
        <div
          className="flex gap-1 rounded-xl border border-border bg-muted/40 p-1"
          role="group"
          aria-label="View"
        >
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="sm"
            aria-pressed={view === "grid"}
            onClick={() => setView("grid")}
          >
            <LayoutGridIcon />
            Grid
          </Button>
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="sm"
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
          >
            <ListIcon />
            List
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          ["Files", downloads.length],
          [
            "Total size",
            formatSize(
              downloads.reduce(
                (sum, file) => sum + Math.max(0, file.file_size || 0),
                0,
              ),
            ),
          ],
          ["Starred", downloads.filter((file) => file.marked).length],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-stitch-surface-container-low p-4"
          >
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
          </div>
        ))}
      </div>
      {downloads.length === 0 ? (
        <div className="flex min-h-60 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
          <div className="mb-4 rounded-2xl bg-primary/10 p-4 text-primary">
            <DownloadIcon className="size-7" />
          </div>
          <h3 className="font-semibold">Your next download starts here</h3>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Downloaded files will appear here with their details and location.
          </p>
        </div>
      ) : (
        <div
          className={
            view === "grid"
              ? "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
              : "flex flex-col gap-3"
          }
        >
          {downloads.map((download) => (
            <RecentDownloadCard
              key={download.id}
              download={download}
              view={view}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function RecentDownloadCard({
  download,
  view,
}: {
  download: DownloadDTO;
  view: "grid" | "list";
}) {
  const [opening, setOpening] = useState(false);
  const mime = download.mime_type || "application/octet-stream";
  const Icon = mime.startsWith("image/")
    ? FileImageIcon
    : mime.startsWith("video/")
      ? FileVideoIcon
      : mime.startsWith("audio/")
        ? MusicIcon
        : /zip|compressed|archive/.test(mime)
          ? ArchiveIcon
          : FileIcon;
  const extension =
    download.extension.replace(/^\./, "").toUpperCase() || "FILE";
  const separator = download.root_dir.includes("\\") ? "\\" : "/";
  const absolutePath = `${download.root_dir.replace(/[\\/]+$/, "")}${separator}${download.file_name}`;
  let source = "Unknown source";
  try {
    source = new URL(download.url).hostname;
  } catch {
    /* Invalid source URLs remain plain text. */
  }

  async function revealFile() {
    setOpening(true);
    try {
      await window.download.showInFolder(absolutePath);
    } catch {
      toast.add({
        title: "Unable to show file",
        description: "The file may have been moved or deleted.",
        type: "error",
      });
    } finally {
      setOpening(false);
    }
  }

  return (
    <article
      className={`min-w-0 rounded-2xl border border-border bg-stitch-surface-container-low p-4 transition-colors hover:border-primary/30 ${view === "list" ? "sm:flex sm:items-start sm:gap-5" : ""}`}
    >
      <div
        className={`flex items-center justify-between gap-3 ${view === "list" ? "mb-3 sm:mb-0 sm:w-28 sm:shrink-0" : "mb-4"}`}
      >
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-6" />
        </div>
        <div className="flex items-center gap-2">
          {download.marked && (
            <StarIcon
              className="size-4 fill-amber-400 text-amber-500"
              aria-label="Starred"
            />
          )}
          {download.color && download.color !== "none" && (
            <span
              className={`size-2.5 rounded-full ${colors[download.color]}`}
              title={`${download.color} label`}
              aria-label={`${download.color} label`}
            />
          )}
        </div>
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        <div>
          <h3
            className="truncate text-sm font-semibold"
            title={download.file_name}
          >
            {download.file_name}
          </h3>
          <p
            className="mt-1 truncate text-xs text-muted-foreground"
            title={download.url}
          >
            {source}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            className="rounded-md bg-primary/10 px-2 py-1 font-medium text-primary"
            title={mime}
          >
            {extension}
          </span>
          <span className="tabular-nums text-muted-foreground">
            {formatSize(download.file_size)}
          </span>
          {download.priority && (
            <span
              className={`rounded-md px-2 py-1 capitalize ${download.priority === "high" ? "bg-orange-500/10 text-orange-600 dark:text-orange-400" : "bg-muted text-muted-foreground"}`}
            >
              {download.priority} priority
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {download.downloaded_at && (
            <CheckCircle2Icon
              className="size-3.5 text-emerald-600 dark:text-emerald-400"
              aria-label="Downloaded"
            />
          )}
          <span>
            {formatDate(download.downloaded_at || download.created_at)}
          </span>
        </div>
        <button
          type="button"
          disabled={opening || !download.root_dir}
          onClick={revealFile}
          title={`Show in folder: ${absolutePath}`}
          className="flex w-full min-w-0 items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50"
        >
          <FolderOpenIcon className="size-4 shrink-0" />
          <span className="truncate">
            {opening ? "Opening folder…" : absolutePath}
          </span>
        </button>
        <details className="text-xs text-muted-foreground">
          <summary className="w-fit cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-primary">
            File details
          </summary>
          <dl className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-2 break-all">
            <dt>ID</dt>
            <dd>#{download.id}</dd>
            <dt>Type</dt>
            <dd>{mime}</dd>
            <dt>Source</dt>
            <dd>{download.url}</dd>
            <dt>Created</dt>
            <dd>{formatDate(download.created_at)}</dd>
            <dt>Updated</dt>
            <dd>{formatDate(download.updated_at)}</dd>
            <dt>Downloaded</dt>
            <dd>{formatDate(download.downloaded_at)}</dd>
          </dl>
        </details>
      </div>
    </article>
  );
}
