import electron = require("electron");
import { Response } from "../shared/response.ts";

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

contextBridge.exposeInMainWorld("backend", backendApi);
contextBridge.exposeInMainWorld("speedTest", speedTestApi);
contextBridge.exposeInMainWorld("download", downloadApi);
