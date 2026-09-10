import { type DownloadDTO, type Response } from "../shared/response.ts";
import { db } from "./db.ts";

export class DbController {
  async insertDownload(
    dto: Omit<DownloadDTO, "id" | "created_at" | "updated_at">,
  ): Promise<Response<DownloadDTO | void>> {
    try {
      const [inserted]: DownloadDTO[] = await db
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
        .into("downloads")
        .returning("*");

      return {
        code: "SUCCESS",
        success: true,
        data: inserted ?? undefined,
      };
    } catch (err) {
      console.log(err);
      return {
        code: "UNKOWNERROR",
        success: false,
        data: undefined,
      };
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

  async updateDownload(
    id: number,
    changes: Pick<DownloadDTO, "file_name" | "marked" | "color" | "priority">,
  ): Promise<DownloadDTO> {
    if (
      !Number.isSafeInteger(id) ||
      id < 1 ||
      !changes ||
      typeof changes.marked !== "boolean" ||
      ![
        null,
        "none",
        "red",
        "orange",
        "yellow",
        "green",
        "blue",
        "purple",
        "pink",
        "brown",
      ].includes(changes.color) ||
      ![null, "low", "medium", "high"].includes(changes.priority)
    ) {
      throw new Error("Invalid download details.");
    }
    const [record] = await db<DownloadDTO>("downloads")
      .where({ id })
      .update({
        marked: changes.marked,
        color: changes.color,
        priority: changes.priority,
        updated_at: db.fn.now(),
      })
      .returning("*");
    if (!record) throw new Error("Download record not found.");
    return record;
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
