import { useEffect, useState } from "react";
import {
  FileIcon,
  FolderOpenIcon,
  PencilIcon,
  Trash2Icon,
  StarIcon,
  LibraryIcon,
} from "lucide-react";
import { useDownload } from "@/provider/download-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import type { DownloadDTO } from "../../../../../shared/response";

type Metadata = Pick<
  DownloadDTO,
  "file_name" | "marked" | "color" | "priority"
>;

export default function Downloads() {
  const { dowloadedRecords, setDowloadedRecords, setRecentDownloads } =
    useDownload();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);
  const [selected, setSelected] = useState<DownloadDTO | null>(null);
  const [action, setAction] = useState<"update" | "delete">("update");
  const [draft, setDraft] = useState<Metadata>({
    marked: false,
    color: null,
    priority: null,
    file_name: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    window.db
      .getAll()
      .then((records: DownloadDTO[]) => {
        if (!cancelled) {
          setDowloadedRecords(records);
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [setDowloadedRecords, reload]);

  function openAction(record: DownloadDTO, nextAction: "update" | "delete") {
    setSelected(record);
    setAction(nextAction);
    setDraft({
      file_name: record.file_name,
      marked: Boolean(record.marked),
      color: record.color,
      priority: record.priority,
    });
  }

  async function save() {
    if (!selected || saving) return;
    setSaving(true);
    try {
      if (action === "delete") {
        await window.db.deleteById(selected.id);
        setDowloadedRecords((records) =>
          records.filter((record) => record.id !== selected.id),
        );
        setRecentDownloads((records) =>
          records.filter((record) => record.id !== selected.id),
        );
      } else {
        const updated = await window.db.updateDownload(selected.id, draft);
        const replace = (records: DownloadDTO[]) =>
          records.map((record) =>
            record.id === updated.id ? updated : record,
          );
        setDowloadedRecords(replace);
        setRecentDownloads(replace);
      }
      setSelected(null);
      toast.add({
        title: action === "delete" ? "Record deleted" : "Download updated",
        type: "success",
      });
    } catch {
      toast.add({
        title: "Could not save changes",
        description: "Please try again.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  async function showInFolder(record: DownloadDTO) {
    const separator = record.root_dir.includes("\\") ? "\\" : "/";
    try {
      await window.download.showInFolder(
        `${record.root_dir.replace(/[\\/]+$/, "")}${separator}${record.file_name}`,
      );
    } catch {
      toast.add({
        title: "Unable to show file",
        description: "The file may have been moved or deleted.",
        type: "error",
      });
    }
  }

  const records = [...dowloadedRecords].sort((a, b) => b.id - a.id);
  return (
    <section className="space-y-6 p-4 text-foreground sm:p-6">
      <header className="flex items-center gap-4 border-b border-border pb-6">
        <div className="rounded-2xl bg-primary p-3 text-primary-foreground">
          <LibraryIcon className="size-6" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Your library
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            Downloads
            <span className="ml-3 align-middle text-sm font-normal text-muted-foreground">
              {records.length} files
            </span>
          </h2>
        </div>
      </header>
      <div className="overflow-hidden rounded-xl border border-border bg-stitch-surface-container-low">
        <div className="hidden grid-cols-[minmax(0,1fr)_100px_120px_200px] gap-4 border-b border-border bg-muted/40 px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground lg:grid">
          <span>File / location</span>
          <span>Size</span>
          <span>Priority</span>
          <span className="text-right">Manage</span>
        </div>
        {loading ? (
          <p
            className="p-12 text-center text-sm text-muted-foreground"
            role="status"
          >
            Loading your library…
          </p>
        ) : error ? (
          <div className="space-y-3 p-12 text-center">
            <p>Could not load downloads.</p>
            <Button
              variant="outline"
              onClick={() => {
                setLoading(true);
                setReload((value) => value + 1);
              }}
            >
              Try again
            </Button>
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-14 text-center">
            <FileIcon className="size-9 text-muted-foreground/50" />
            <h3 className="font-medium">A fresh start</h3>
            <p className="text-sm text-muted-foreground">
              Your saved downloads will appear here.
            </p>
          </div>
        ) : (
          records.map((record) => (
            <div
              key={record.id}
              className="grid items-center gap-4 border-b border-border px-5 py-4 transition-colors last:border-0 hover:bg-muted/30 lg:grid-cols-[minmax(0,1fr)_100px_120px_200px]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-[10px] font-bold uppercase text-primary">
                  {record.extension.replace(/^\./, "").slice(0, 6) || "FILE"}
                </div>
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <span className="truncate" title={record.file_name}>
                      {record.file_name}
                    </span>
                    {Boolean(record.marked) && (
                      <StarIcon
                        className="size-3.5 shrink-0 fill-amber-400 text-amber-500"
                        aria-label="Starred"
                      />
                    )}
                  </p>
                  <button
                    className="mt-1 flex max-w-full items-center gap-1.5 text-xs text-muted-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
                    title={`Show in folder: ${record.root_dir}`}
                    onClick={() => showInFolder(record)}
                  >
                    <FolderOpenIcon className="size-3 shrink-0" />
                    <span className="truncate">{record.root_dir}</span>
                  </button>
                </div>
              </div>
              <span className="text-xs tabular-nums text-muted-foreground">
                {formatSize(record.file_size)}
              </span>
              <span
                className={`w-fit rounded-full px-2.5 py-1 text-xs capitalize ${record.priority === "high" ? "bg-orange-500/10 text-orange-600 dark:text-orange-400" : "bg-muted text-muted-foreground"}`}
              >
                {record.priority || "No priority"}
              </span>
              <div className="flex items-center gap-2 lg:justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openAction(record, "update")}
                  aria-label={`Update ${record.file_name}`}
                >
                  <PencilIcon />
                  Update
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => openAction(record, "delete")}
                  aria-label={`Delete ${record.file_name}`}
                >
                  <Trash2Icon />
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open && !saving) setSelected(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "delete"
                ? "Delete download record?"
                : "Update download"}
            </DialogTitle>
            <DialogDescription className="break-all">
              {selected?.file_name}
            </DialogDescription>
          </DialogHeader>
          {action === "delete" ? (
            <p className="text-sm text-muted-foreground">
              This removes the record from your library. The file stays on your
              device.
            </p>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Organize this file with a priority, color label and star.
              </p>
              <label className="block space-y-2 text-sm">
                <span>Priority</span>
                <select
                  className="w-full rounded-lg border border-border bg-background p-2"
                  value={draft.priority || ""}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      priority: (event.target.value ||
                        null) as Metadata["priority"],
                    })
                  }
                >
                  <option value="">No priority</option>
                  {["low", "medium", "high"].map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-2 text-sm">
                <span>Color label</span>
                <select
                  className="w-full rounded-lg border border-border bg-background p-2"
                  value={draft.color || "none"}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      color: event.target.value as Metadata["color"],
                    })
                  }
                >
                  {[
                    "none",
                    "red",
                    "orange",
                    "yellow",
                    "green",
                    "blue",
                    "purple",
                    "pink",
                    "brown",
                  ].map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.marked}
                  onChange={(event) =>
                    setDraft({ ...draft, marked: event.target.checked })
                  }
                />
                Star this download
              </label>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              disabled={saving}
              onClick={() => setSelected(null)}
            >
              Cancel
            </Button>
            <Button
              variant={action === "delete" ? "destructive" : "default"}
              disabled={saving}
              onClick={save}
            >
              {saving
                ? "Saving…"
                : action === "delete"
                  ? "Delete record"
                  : "Save changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function formatSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const unit = Math.max(
    0,
    Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 4),
  );
  return `${Number((bytes / 1024 ** unit).toFixed(1))} ${["B", "KB", "MB", "GB", "TB"][unit]}`;
}
