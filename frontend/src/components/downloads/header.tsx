import {
  DatabaseIcon,
  GaugeIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  MinusIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDownload } from "@/provider/download-provider";
import { AppLoader } from "../shared/app-loader";

interface DownloadsHeaderProps {
  downloadSpeed?: string;
  onSearchChange?: (query: string) => void;
  onStorageClick?: () => void;
  onSettingsClick?: () => void;
  onNewDownload?: () => void;
}

export default function DownloadsHeader({
  onSearchChange,
  onStorageClick,
  onSettingsClick,
  onNewDownload,
}: DownloadsHeaderProps) {
  const { downloadSpeed, isCalculatingDownloadSpeed } = useDownload();

  return (
    <header
      aria-label="Download controls"
      className="flex min-h-[68px] w-full shrink-0 flex-wrap items-center
       justify-between gap-x-6 gap-y-3 border-b 
      border-slate-200/80 bg-sidebar px-4 py-3 dark:border-border"
    >
      <div className="relative w-full sm:w-[290px]">
        <SearchIcon
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400 dark:text-muted-foreground"
        />
        <Input
          type="search"
          aria-label="Search downloads"
          placeholder="Search downloads..."
          onChange={(event) => onSearchChange?.(event.target.value)}
          className="h-10 rounded-md border-slate-200 bg-slate-50 pr-3 pl-10 text-[15px] shadow-xs placeholder:text-slate-400 md:text-[15px] dark:border-border dark:bg-background dark:placeholder:text-muted-foreground"
        />
      </div>

      <div className="ml-auto flex flex-wrap items-center justify-end gap-3 sm:gap-6">
        <div
          aria-label={`Download speed: ${downloadSpeed}`}
          className="flex shrink-0 items-center gap-2.5"
        >
          <GaugeIcon
            aria-hidden="true"
            className="size-5 text-slate-500 dark:text-muted-foreground"
          />
          {downloadSpeed === -1 && (
            <span className="whitespace-nowrap text-sm font-semibold text-red-600 tabular-nums dark:text-red-400">
              <MinusIcon className="size-4" />
            </span>
          )}
          {downloadSpeed !== -1 && (
            <span className="whitespace-nowrap text-sm font-semibold text-blue-600 tabular-nums dark:text-blue-400">
              {downloadSpeed}
            </span>
          )}

          {isCalculatingDownloadSpeed && (
            <AppLoader showLoadingText={false} visible={true} />
          )}
        </div>

        <span
          aria-hidden="true"
          className="h-5 w-px bg-slate-200 dark:bg-border"
        />

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label="Storage"
            title="Storage"
            onClick={onStorageClick}
            className="text-slate-500 dark:text-muted-foreground"
          >
            <DatabaseIcon className="size-[22px]" />
          </Button>
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label="Download settings"
            title="Download settings"
            onClick={onSettingsClick}
            className="text-slate-500 dark:text-muted-foreground"
          >
            <SettingsIcon className="size-[22px]" />
          </Button>
        </div>

        <Button
          onClick={onNewDownload}
          className="h-10 gap-2 rounded-md bg-stitch-secondary text-stitch-on-secondary
           px-4 font-semibold  shadow-sm hover:bg-stitch-secondary/90 sm:px-5 cursor-pointer"
        >
          <PlusIcon className="size-5" />
          New Download
        </Button>
      </div>
    </header>
  );
}
