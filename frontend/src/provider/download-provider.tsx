import {
  createContext,
  useContext,
  useState,
  type SetStateAction,
  type Dispatch,
} from "react";

type DownloadProviderProps = {
  children: React.ReactNode;
};

type DownloadProviderState = {
  downloadSpeed: number;
  setDownloadSpeed: Dispatch<SetStateAction<number>>;
};

const initialState: DownloadProviderState = {
  downloadSpeed: -1,
  setDownloadSpeed: () => null,
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

  const value = {
    downloadSpeed,
    setDownloadSpeed,
  };

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
