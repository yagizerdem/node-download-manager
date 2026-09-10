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
  url: string;
  downloadedBytes: number;
  mimeType: string;
  extension: string;
  totalBytes: number;
  totalMegabytes: number;
  fileUid: string;
}

export type ColorCode =
  | "none"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "pink"
  | "brown";

export type Priority = "low" | "medium" | "high";

export interface DownloadDTO {
  id: number;
  url: string;
  file_name: string;
  mime_type: string;
  extension: string;
  root_dir: string;
  file_size: number;
  downloaded_at: string | null;
  marked: boolean;
  color: ColorCode | null;
  created_at: string;
  updated_at: string;
  priority: Priority | null;
}
