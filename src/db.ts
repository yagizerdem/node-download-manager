import path from "node:path";
import os from "os";

const APP_NAME = "node-download-manager";

function getAppDataDir(appName: string) {
  const platform = process.platform;
  let baseDir: string;

  switch (platform) {
    case "win32":
      // Resolves to C:\Users\<user>\AppData\Roaming
      baseDir =
        process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming");
      break;
    case "darwin":
      // Resolves to /Users/<user>/Library/Application Support
      baseDir = path.join(os.homedir(), "Library", "Application Support");
      break;
    case "linux":
    default:
      // Resolves to /home/<user>/.local/share (XDG standard) or fallback to ~/.config
      baseDir =
        process.env.XDG_DATA_HOME || path.join(os.homedir(), ".local", "share");
      break;
  }

  return path.join(baseDir, appName);
}

export const APP_DATA_DIR = getAppDataDir(APP_NAME);
export const DOWNLOADS_DIR = path.join(APP_DATA_DIR, "downloads");
export const DB_PATH = path.join(APP_DATA_DIR, "node-download-manager.db");
