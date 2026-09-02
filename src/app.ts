import {
  APP_DATA_DIR,
  DOWNLOADS_DIR,
  DB_PATH,
  ensureDirExists,
  ensureFileExists,
  createDbSchemas,
} from "./db.ts";
import { app, BrowserWindow } from "electron";
import Main from "./main.ts";

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
