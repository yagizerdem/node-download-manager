import {
  APP_DATA_DIR,
  DOWNLOADS_DIR,
  DB_PATH,
  ensureDirExists,
  ensureFileExists,
  createDbSchemas,
} from "./db.ts";
import { app, BrowserWindow, ipcMain, shell } from "electron";
import path from "node:path";
import { access } from "node:fs/promises";
import Main from "./main.ts";
import healthCheckController from "./healt-controller.ts";
import speedTestController from "./speed-test-controller.ts";
import downloadController from "./downlaod-controller.ts";
import dbController from "./db-controllrer.ts";

ensureDirExists(APP_DATA_DIR);
ensureDirExists(DOWNLOADS_DIR);
ensureFileExists(DB_PATH);

console.log(`App data directory: ${APP_DATA_DIR}`);
console.log(`Downloads directory: ${DOWNLOADS_DIR}`);
console.log(`Database path: ${DB_PATH}`);

(async () => {
  await createDbSchemas();
})();
Main.main(app, BrowserWindow);

app.whenReady().then(() => {
  ipcMain.handle("download:showInFolder", async (_event, absolutePath: string) => {
    if (typeof absolutePath !== "string" || !path.isAbsolute(absolutePath)) {
      throw new Error("An absolute file path is required.");
    }
    await access(absolutePath);
    shell.showItemInFolder(absolutePath);
  });
  ipcMain.handle(
    "health-check",
    healthCheckController.healthCheck.bind(healthCheckController),
  );

  // speed test controller
  ipcMain.handle(
    "speedTest:start",
    speedTestController.startSpeedTest.bind(speedTestController),
  );
  ipcMain.handle(
    "speedTest:startAsync",
    speedTestController.startSpeedTestAsync.bind(speedTestController),
  );

  // downloads contorller
  ipcMain.handle("download:control", (_event, fileUid: string, action: "pause" | "continue" | "cancel") => {
    if (!["pause", "continue", "cancel"].includes(action)) throw new Error("Invalid download action");
    return downloadController.control(fileUid, action);
  });
  ipcMain.handle(
    "download:getRemoteFileAsync",
    (
      event,
      file: string,
      url: string,
      fileUid: string,
      downloadsDir?: string,
    ) =>
      downloadController.getRemoteFileAsync({
        file,
        url,
        downloadsDir,
        fileUid,
      }),
  );

  // database controller
  ipcMain.handle("db:updateDownload", (_event, id, changes) => dbController.updateDownload(id, changes));
  ipcMain.handle("db:insertDownload", (event, dto) =>
    dbController.insertDownload(dto),
  );
  ipcMain.handle("db:getAll", dbController.getAll.bind(dbController));
  ipcMain.handle("db:getById", (event, id: number) => dbController.getById(id));
  ipcMain.handle("db:deleteById", (event, id: number) =>
    dbController.deleteById(id),
  );
  ipcMain.handle(
    "db:getPaginated",
    (event, offset: number = 0, limit: number = 20) =>
      dbController.getPaginated(offset, limit),
  );
});
