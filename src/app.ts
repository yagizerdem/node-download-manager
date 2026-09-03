import {
  APP_DATA_DIR,
  DOWNLOADS_DIR,
  DB_PATH,
  ensureDirExists,
  ensureFileExists,
  createDbSchemas,
} from "./db.ts";
import { app, BrowserWindow, ipcMain } from "electron";
import Main from "./main.ts";
import healthCheckController from "./healt-controller.ts";
import speedTestController from "./speed-test-controller.ts";

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
  ipcMain.handle(
    "health-check",
    healthCheckController.healthCheck.bind(healthCheckController),
  );
  ipcMain.handle(
    "speedTest:start",
    speedTestController.startSpeedTest.bind(speedTestController),
  );
  ipcMain.handle(
    "speedTest:startAsync",
    speedTestController.startSpeedTestAsync.bind(speedTestController),
  );
});
