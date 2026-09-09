import { DownloadDTO } from "../shared/response.ts";
import { db } from "./db.ts";

export class DbController {
  async insertDownload(
    dto: Omit<DownloadDTO, "id" | "created_at" | "updated_at">,
  ) {
    try {
      await db
        .insert({
          file_name: dto.file_name,
          mime_type: dto.mime_type,
          extension: dto.extension,
          root_dir: dto.root_dir,
          file_size: dto.file_size,
          downloaded_at: dto.downloaded_at,
          marked: dto.marked,
          color: dto.color,
          priority: dto.priority,
          url: dto.url,
        })
        .into("downloads");
    } catch (err) {
      throw err;
    }
  }

  async getAll(): Promise<DownloadDTO[]> {
    return db<DownloadDTO>("downloads").select("*");
  }

  async getById(id: number): Promise<DownloadDTO | undefined> {
    const result = await db<DownloadDTO>("downloads").where({ id }).first();
    return result;
  }

  async deleteById(id: number): Promise<number> {
    return db<DownloadDTO>("downloads").where({ id }).delete();
  }

  async getPaginated(
    offset: number = 0,
    limit: number = 20,
  ): Promise<DownloadDTO[]> {
    if (!Number.isSafeInteger(offset) || offset < 0) {
      throw new Error("offset must be a non-negative integer.");
    }

    if (!Number.isSafeInteger(limit) || limit < 1) {
      throw new Error("limit must be a positive integer.");
    }

    return db<DownloadDTO>("downloads")
      .select("*")
      .orderBy("id", "desc")
      .offset(offset)
      .limit(limit);
  }
}

const dbController = new DbController();
export default dbController;
