import { beforeAll, expect, test } from "vitest";
import { getRemoteFileAsync } from "../src/download.ts";
import path from "path";
import fs from "fs";

const TEST_BUCKET = "downloads";
path.resolve(process.cwd(), TEST_BUCKET);

beforeAll(() => {
  if (!fs.existsSync(TEST_BUCKET)) {
    fs.mkdirSync(TEST_BUCKET, { recursive: true });
  }
});

test("download file from internet", async () => {
  await getRemoteFileAsync(
    path.resolve(TEST_BUCKET, "testfile.pdf"),
    "https://raft.github.io/slides/buildstuff2015.pdf",
  );
});
