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
  onReceiveData: (callback: Function) =>
    ipcRenderer.on("speedTest:onData", (_event, value) => callback(value)),
  onEnd: (callback: Function) =>
    ipcRenderer.on("speedTest:onEnd", (_event, value) => callback(value)),
};

contextBridge.exposeInMainWorld("backend", backendApi);

contextBridge.exposeInMainWorld("speedTest", speedTestApi);
