import electron = require("electron");
import { Response, DownloadDTO } from "../shared/response.ts";

const { contextBridge, ipcRenderer } = electron;

const backendApi = {
  healthCheck: (): Promise<{ status: string }> =>
    ipcRenderer.invoke("health-check"),
};

const speedTestApi = {
  startSpeedTest: (): Promise<void> => ipcRenderer.invoke("speedTest:start"),
  startSpeedTestAsync: (): Promise<Response<{ mbps: number }>> =>
    ipcRenderer.invoke("speedTest:startAsync"),
  onReceiveData: (callback: Function) => {
    const listener = (_event: Electron.IpcRendererEvent, value: unknown) =>
      callback(value);
    ipcRenderer.on("speedTest:onData", listener);
    return () => ipcRenderer.removeListener("speedTest:onData", listener);
  },
  onEnd: (callback: Function) => {
    const listener = (_event: Electron.IpcRendererEvent, value: unknown) =>
      callback(value);
    ipcRenderer.on("speedTest:onEnd", listener);
    return () => ipcRenderer.removeListener("speedTest:onEnd", listener);
  },
};

const downloadApi = {
  showInFolder: (absolutePath: string): Promise<void> =>
    ipcRenderer.invoke("download:showInFolder", absolutePath),
  getRemoteFileAsync: (
    file: string,
    url: string,
    fileUid: string,
    downloadsDir?: string | undefined,
  ): Promise<Response<any>> =>
    ipcRenderer.invoke(
      "download:getRemoteFileAsync",
      file,
      url,
      fileUid,
      downloadsDir,
    ),
  onProgress: (callback: Function) => {
    const listener = (_event: Electron.IpcRendererEvent, value: unknown) =>
      callback(value);
    ipcRenderer.on("download:getRemoteFileAsync:progress", listener);
    return () =>
      ipcRenderer.removeListener(
        "download:getRemoteFileAsync:progress",
        listener,
      );
  },
  onInitial: (callback: Function) => {
    const listener = (_event: Electron.IpcRendererEvent, value: unknown) =>
      callback(value);
    ipcRenderer.on("download:getRemoteFileAsync:initial", listener);
    return () =>
      ipcRenderer.removeListener(
        "download:getRemoteFileAsync:initial",
        listener,
      );
  },
  onCompleted: (callback: Function) => {
    const listener = (_event: Electron.IpcRendererEvent, value: unknown) =>
      callback(value);
    ipcRenderer.on("download:getRemoteFileAsync:completed", listener);
    return () =>
      ipcRenderer.removeListener(
        "download:getRemoteFileAsync:completed",
        listener,
      );
  },
};

const dbApi = {
  updateDownload: (id: number, changes: Pick<DownloadDTO, "marked" | "color" | "priority">): Promise<DownloadDTO> =>
    ipcRenderer.invoke("db:updateDownload", id, changes),
  insertDownload: (
    dto: Omit<DownloadDTO, "id" | "created_at" | "updated_at">,
  ): Promise<void> => ipcRenderer.invoke("db:insertDownload", dto),
  getAll: (): Promise<any[]> => ipcRenderer.invoke("db:getAll"),
  getById: (id: number): Promise<any> => ipcRenderer.invoke("db:getById", id),
  deleteById: (id: number): Promise<number> =>
    ipcRenderer.invoke("db:deleteById", id),
  getPaginated: (offset: number = 0, limit: number = 20): Promise<any[]> =>
    ipcRenderer.invoke("db:getPaginated", offset, limit),
};

contextBridge.exposeInMainWorld("backend", backendApi);
contextBridge.exposeInMainWorld("speedTest", speedTestApi);
contextBridge.exposeInMainWorld("download", downloadApi);
contextBridge.exposeInMainWorld("db", dbApi);
