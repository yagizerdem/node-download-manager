import { AppProvider } from "./app-provider";
import { DownloadProvider } from "./download-provider";
import { ThemeProvider } from "./theme-provider";

type BaseProviderProps = {
  children: React.ReactNode;
};

export function BaseProvider({ children }: BaseProviderProps) {
  return (
    <ThemeProvider>
      <AppProvider>
        <DownloadProvider>{children}</DownloadProvider>
      </AppProvider>
    </ThemeProvider>
  );
}
