import {
  Response,
  DownloadProgress,
  DownloadDTO,
} from "../../shared/response.ts";

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
      onInitial: (
        callback: (progress: Response<DownloadProgress>) => void,
      ) => () => void;
      onCompleted: (
        callback: (progress: Response<DownloadProgress>) => void,
      ) => () => void;
    };
    db: {
      insertDownload: (
        dto: Omit<DownloadDTO, "id" | "created_at" | "updated_at">,
      ) => Promise<void>;
      getAll: () => Promise<any[]>;
      getById: (id: number) => Promise<any>;
      deleteById: (id: number) => Promise<number>;
      getPaginated: (offset: number = 0, limit: number = 20) => Promise<any[]>;
    };
  }
}
