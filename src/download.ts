import http from "http";
import https from "https";
import fs from "fs";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import { parse as contentDispositionParse } from "content-disposition";
import {
  extension as extensionFromMime,
  lookup as lookupMimeType,
} from "mime-types";

export function getRemoteFile(file: string, url: string) {
  let localFile = fs.createWriteStream(file);
  const client = url.startsWith("https") ? https : http;
  const request = client.get(url, function (response) {
    const contentLength = response?.headers?.["content-length"]
      ? response.headers["content-length"]
      : "0";
    var len = parseInt(contentLength, 10);
    var cur = 0;
    var total = len / 1048576; //1048576 - bytes in 1 Megabyte

    response.on("data", function (chunk) {
      cur += chunk.length;
      showProgressStdout(file, cur, len, total);
    });

    response.on("end", function () {
      console.log("Download complete");
    });

    response.pipe(localFile);
  });
}

export async function getRemoteFileAsync(
  file: string,
  url: string,
): Promise<void> {
  const client = url.startsWith("https:") ? https : http;

  const response = await new Promise<http.IncomingMessage>(
    (resolve, reject) => {
      const request = client.get(url, resolve);

      request.on("error", reject);
    },
  );

  if (
    response.statusCode === undefined ||
    response.statusCode < 200 ||
    response.statusCode >= 300
  ) {
    response.resume(); // consume response data to free up memory

    throw new Error(
      `Download failed: ${response.statusCode} ${response.statusMessage ?? ""}`,
    );
  }

  const extension = extractFileExtension(response.headers, url);
  const mimeType = lookupMimeType(extension) ?? "application/octet-stream";

  const contentLength = response.headers["content-length"];
  const length = Number.parseInt(contentLength ?? "0", 10);

  let downloadedBytes = 0;
  const totalMegabytes = length / 1_048_576;

  response.on("data", (chunk: Buffer) => {
    downloadedBytes += chunk.length;

    showProgressStdout(file, downloadedBytes, length, totalMegabytes);
  });

  await pipeline(response, fs.createWriteStream(file));

  console.log("Download complete");
}

export function showProgressStdout(
  file: string,
  cur: number,
  len: number,
  total: number,
) {
  console.log(
    "Downloading " +
      file +
      " - " +
      ((100.0 * cur) / len).toFixed(2) +
      "% (" +
      (cur / 1048576).toFixed(2) +
      " MB) of total size: " +
      total.toFixed(2) +
      " MB",
  );
}

export function extractFileExtension(
  headers: http.IncomingHttpHeaders,
  url: string,
): string {
  const dispositionHeader = headers["content-disposition"];

  if (typeof dispositionHeader === "string") {
    try {
      const disposition = contentDispositionParse(dispositionHeader);
      const filename = disposition.parameters.filename;

      if (filename) {
        const extension = path.extname(path.basename(filename));

        if (extension) {
          return extension.toLowerCase();
        }
      }
    } catch {}
  }

  try {
    const pathname = new URL(url).pathname;
    const extension = path.extname(pathname);

    if (extension) {
      return extension.toLowerCase();
    }
  } catch {}

  const contentTypeHeader = headers["content-type"];

  if (typeof contentTypeHeader === "string") {
    const mimeType = contentTypeHeader.split(";", 1)[0].trim();
    const extension = extensionFromMime(mimeType);

    if (extension) {
      return `.${extension.toLowerCase()}`;
    }
  }

  return ".bin";
}
