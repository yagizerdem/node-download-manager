import { APP_DATA_DIR } from "./db";
import fs from "fs";
import { app, BrowserWindow } from "electron";
import Main from "./main";

if (!fs.existsSync(APP_DATA_DIR)) {
  fs.mkdirSync(APP_DATA_DIR, { recursive: true });
}

Main.main(app, BrowserWindow);
