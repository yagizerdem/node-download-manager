import { cn } from "@/lib/utils";
import { Toaster } from "@components/ui/toast";
import AppLoaderPanel from "@components/shared/app-loader";
import { useApp } from "@/provider/app-provider";

interface DefaultLayoutProps {
  children: React.ReactNode;
  props?: any;
}

export default function DefaultLayout({ children, props }: DefaultLayoutProps) {
  const app = useApp();
  const isLoading = app.isLoading;

  return (
    <div className={cn("h-screen w-full", props?.className)}>
      {children}
      <Toaster />
      <AppLoaderPanel visible={isLoading} />
    </div>
  );
}
