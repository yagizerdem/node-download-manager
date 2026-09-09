import path from "node:path";
import os from "os";
import knex from "knex";
import fs from "fs";
import fsPromises from "node:fs/promises";
import type { ColorCode, Priority } from "../shared/response.ts";

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

export function ensureDirExists(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function ensureFileExists(filePath: string) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "");
  }
}

export async function ensureDirExistsAsync(dir: string): Promise<void> {
  await fsPromises.mkdir(dir, { recursive: true });
}

export async function ensureFileExistsAsync(filePath: string): Promise<void> {
  try {
    const fileHandle = await fsPromises.open(filePath, "a");
    await fileHandle.close();
  } catch (error) {
    throw new Error(`Could not ensure file exists: ${filePath}`);
  }
}

export const db = knex({
  client: "sqlite3",
  connection: {
    filename: DB_PATH,
  },
});

export async function createDownloadsTable() {
  await db.schema.createTableIfNotExists("downloads", (table) => {
    table.increments("id").primary();
    // source URL of the download
    table.text("url").notNullable();

    table.string("file_name").notNullable();
    table.string("mime_type").notNullable();
    table.string("extension").notNullable();
    table.string("root_dir").notNullable();
    table.bigInteger("file_size").notNullable().defaultTo(0);
    table.date("downloaded_at").nullable();
    table.boolean("marked").notNullable().defaultTo(false);
    table.enum("color", [
      "red",
      "green",
      "blue",
      "black",
      "white",
      "gray",
      "orange",
      "yellow",
      "purple",
      "pink",
      "brown",
    ] as ColorCode[]);
    table.date("created_at").notNullable().defaultTo(db.fn.now());
    table.date("updated_at").notNullable().defaultTo(db.fn.now());
    table.enum("priority", ["low", "medium", "high"] as Priority[]);
  });

  return await db.schema.hasTable("downloads");
}

export async function createDbSchemas() {
  if (!(await db.schema.hasTable("downloads"))) {
    await createDownloadsTable();
  }
}
