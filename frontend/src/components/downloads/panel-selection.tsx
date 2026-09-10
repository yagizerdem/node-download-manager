import { ActivityIcon, CircleCheckIcon, HistoryIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const panelOptions = [
  { id: "downloaded", label: "Downloaded", icon: CircleCheckIcon },
  { id: "active", label: "Active", icon: ActivityIcon },
  { id: "recent", label: "Recent", icon: HistoryIcon },
] as const;

interface PanelProps {
  selectedPanel: string;
  onSelectedPanelChange: (panel: "downloaded" | "active" | "recent") => void;
  className?: string;
}

export function PanelSelection({
  selectedPanel,
  onSelectedPanelChange,
  className,
}: PanelProps) {
  return (
    <div
      className={cn(
        `flex h-14 w-full items-center justify-end border-b
         border-stitch-outline-variant/50 
        bg-stitch-surface-container-low px-4`,
        className,
      )}
    >
      <div
        className="flex items-center gap-1 rounded-lg border border-stitch-outline-variant/60
          bg-stitch-surface-container-lowest p-1 shadow-sm"
        role="group"
        aria-label="Download view"
      >
        {panelOptions.map(({ id, label, icon: Icon }) => {
          const isSelected = selectedPanel === id;

          return (
            <Button
              key={id}
              type="button"
              variant="ghost"
              aria-pressed={isSelected}
              onClick={() => onSelectedPanelChange(id)}
              className={`h-8 gap-2 rounded-md px-3 text-sm transition-all cursor-pointer
                focus-visible:ring-2 focus-visible:ring-stitch-primary/40 ${
                  isSelected
                    ? "bg-stitch-secondary text-stitch-on-secondary shadow-sm hover:bg-stitch-secondary/90 hover:text-stitch-on-secondary"
                    : "text-stitch-on-surface-variant hover:bg-stitch-surface-container-high hover:text-stitch-on-surface"
                }`}
            >
              <Icon aria-hidden="true" className="size-4" />
              {label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
