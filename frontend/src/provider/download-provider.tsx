import {
  createContext,
  useContext,
  useState,
  type SetStateAction,
  type Dispatch,
  useEffect,
} from "react";

type DownloadProviderProps = {
  children: React.ReactNode;
};

type DownloadProviderState = {
  downloadSpeed: number;
  setDownloadSpeed: Dispatch<SetStateAction<number>>;
  isCalculatingDownloadSpeed: boolean;
  setIsCalculatingDownloadSpeed: Dispatch<SetStateAction<boolean>>;
  activeDownloads: Record<string, DownloadStatus>;
  setActiveDownloads: Dispatch<SetStateAction<Record<string, DownloadStatus>>>;
};

export type DownloadStatus = {
  total: number;
  downloaded: number;
  progress: number;
  fileUid: string;
  fileName: string;
};

const initialState: DownloadProviderState = {
  downloadSpeed: -1,
  setDownloadSpeed: () => null,
  isCalculatingDownloadSpeed: false,
  setIsCalculatingDownloadSpeed: () => null,
  activeDownloads: {},
  setActiveDownloads: () => null,
};

const DownloadProviderContext =
  createContext<DownloadProviderState>(initialState);

export function DownloadProvider({
  children,
  ...props
}: DownloadProviderProps) {
  const [downloadSpeed, setDownloadSpeed] = useState(
    initialState.downloadSpeed,
  );
  const [isCalculatingDownloadSpeed, setIsCalculatingDownloadSpeed] = useState(
    initialState.isCalculatingDownloadSpeed,
  );
  const [activeDownloads, setActiveDownloads] = useState<
    Record<string, DownloadStatus>
  >({});

  const value = {
    downloadSpeed,
    setDownloadSpeed,
    isCalculatingDownloadSpeed,
    setIsCalculatingDownloadSpeed,
    activeDownloads,
    setActiveDownloads,
  };

  useEffect(() => {
    // async function helper() {
    //   try {
    //     setIsCalculatingDownloadSpeed(true);
    //     window.speedTest.startSpeedTest();
    //     const response = await window.speedTest.startSpeedTestAsync();
    //     if (response.success && response.data) {
    //       setDownloadSpeed(response.data.mbps);
    //     } else {
    //       setDownloadSpeed(-1);
    //     }
    //   } finally {
    //     setIsCalculatingDownloadSpeed(false);
    //   }
    // }

    const intervalId = setInterval(async () => {
      // await helper();
    }, 15_000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <DownloadProviderContext.Provider {...props} value={value}>
      {children}
    </DownloadProviderContext.Provider>
  );
}

export const useDownload = () => {
  const context = useContext(DownloadProviderContext);

  if (context === undefined)
    throw new Error("useDownload must be used within a DownloadProvider");

  return context;
};
