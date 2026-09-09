import { Response, DownloadProgress } from "../../shared/response.ts";

export {};

declare global {
  interface Window {
    backend: {
      healthCheck: () => Promise<Response<{ status: string }>>;
    };
    speedTest: {
      startSpeedTest: () => Promise<void>;
      onReceiveData: (data: number) => void;
      startSpeedTestAsync: () => Promise<Response<{ mbps: number }>>;
    };
    download: {
      getRemoteFileAsync: (
        file: string,
        url: string,
        fileUid: string,
        downloadsDir?: string | undefined,
      ) => Promise<Response<DownloadProgress>>;
      onProgress: (
        callback: (progress: Response<DownloadProgress>) => void,
      ) => () => void;
    };
  }
}
