import { cn } from "@/lib/utils";
import { Button } from "@components/ui/button";
import { DownloadIcon } from "lucide-react";
import { useNavigate } from "react-router";
import Logo from "@/assets/node-fetch-logo.png";

const SIDE_BAR_NAVIGATION_ITEMS = [
  { label: "downloads", icon: <DownloadIcon />, path: "/downloads" },
];

interface AppSideBarProps {
  className?: string;
}

export default function AppSideBar({ className }: AppSideBarProps) {
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        "h-full w-64 shrink-0 bg-stitch-surface-container-low border-r-stitch-surface-container-high border-r-3",
        className,
      )}
    >
      <div className="flex flex-row h-16 ">
        <span className="block h-full flex items-center justify-center w-16 pb-5 font-bold text-xl ">
          <img
            src={Logo}
            alt="Node Fetch Logo"
            className="w-12 h-12 rounded-md select-none"
          />
        </span>
        <div className="flex flex-col">
          <span className="text-lg font-semibold">Node Fetch</span>
          <span className="text-sm font-normal text-gray-500">
            Manage your downloads efficiently
          </span>
        </div>
      </div>
      <div className="flex flex-col">
        {SIDE_BAR_NAVIGATION_ITEMS.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            className="justify-start cursor-pointer py-5"
            onMouseUp={() => navigate(item.path)}
          >
            <div className="flex flex-row">
              <span className="mr-2">{item.icon}</span>
              <span className="capitalize">{item.label}</span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
