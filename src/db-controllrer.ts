import { type DownloadDTO, type Response } from "../shared/response.ts";
import { db } from "./db.ts";
import path from "node:path";
import fsPromises from "node:fs/promises";

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
  ): Promise<Response<DownloadDTO | void>> {
    if (
      !Number.isSafeInteger(id) ||
      id < 1 ||
      !changes ||
      typeof changes.file_name !== "string" ||
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
      return {
        code: "INVALID_DOWNLOAD_DETAILS",
        success: false,
        data: undefined,
        message: "Invalid download details.",
      };
    }

    // get the current record from database
    const currentRecord = await db<DownloadDTO>("downloads")
      .where({ id })
      .first();
    if (!currentRecord) {
      return {
        code: "RECORD_NOT_FOUND",
        success: false,
        data: undefined,
        message: "Record not found.",
      };
    }

    // check file system that has record
    const absoluteFilePath = path.join(
      currentRecord.root_dir,
      currentRecord.file_name,
    );
    if (
      !(await fsPromises
        .access(absoluteFilePath)
        .then(() => true)
        .catch(() => false))
    ) {
      return {
        code: "FILE_NOT_FOUND",
        success: false,
        data: undefined,
        message: "File not found on the file system.",
      };
    }

    try {
      fsPromises.rename(
        absoluteFilePath,
        path.join(currentRecord.root_dir, changes.file_name),
      );
    } catch (err) {
      console.log(err);
      return {
        code: "FILE_RENAME_FAILED",
        success: false,
        data: undefined,
        message: "Failed to rename file.",
      };
    }

    const [record] = await db<DownloadDTO>("downloads")
      .where({ id })
      .update({
        file_name: changes.file_name,
        marked: changes.marked,
        color: changes.color,
        priority: changes.priority,
        updated_at: db.fn.now(),
      })
      .returning("*");

    if (!record) {
      return {
        code: "RECORD_NOT_FOUND",
        success: false,
        data: undefined,
        message: "Record not found.",
      };
    }

    return {
      code: "SUCCESS",
      success: true,
      data: record,
    };
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
