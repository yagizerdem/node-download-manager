import { cn } from "@/lib/utils";
import DefaultLayout from "./default-layout";
import AppTopBar from "@components/shared/app-top-bar";
import AppSideBar from "@components/shared/app-side-bar";

interface AppLayoutProps {
  children: React.ReactNode;
  props?: any;
}

export default function AppLayout({ children, props }: AppLayoutProps) {
  return (
    <DefaultLayout>
      <div
        className={cn("flex h-full w-full min-w-0 flex-col", props?.className)}
      >
        <AppTopBar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-row">
          <AppSideBar />
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
