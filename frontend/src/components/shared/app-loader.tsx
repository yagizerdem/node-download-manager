// components/app-loader.tsx
import { cn } from "@/lib/utils";

interface AppLoaderProps {
  visible: boolean;
  className?: string;
}

export function AppLoader({ visible, className }: AppLoaderProps) {
  if (!visible) return null;

  return (
    <div
      className={cn(
        "size-12 animate-spin rounded-full",
        "border-4 border-muted border-t-primary",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

interface AppLoaderPanelProps {
  visible: boolean;
  className?: string;
}

export default function AppLoaderPanel({
  visible,
  className,
}: AppLoaderPanelProps) {
  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999]",
        "flex items-center justify-center",
        "bg-black/30 backdrop-blur-sm select-none",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className={cn(
            "size-12 rounded-full",
            "border-4 border-white/25 border-t-white",
            "animate-spin",
          )}
        />

        <span className="text-sm font-medium text-white">Loading...</span>
      </div>
    </div>
  );
}
