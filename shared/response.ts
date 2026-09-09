export type ResponseCode = "SUCCESS" | "UNKOWNERROR";

export interface Response<T> {
  success: boolean;
  code: ResponseCode;
  data?: T;
}

export interface DownloadProgress {
  file: string;
  baseDir: string;
  absoluteFilePath: string;
  downloadedBytes: number;
  totalBytes: number;
  totalMegabytes: number;
  fileUid: string;
}
