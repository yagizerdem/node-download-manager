import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { createServer, type Server, type ServerResponse } from "node:http";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const { send } = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock("electron", () => ({
  BrowserWindow: { getAllWindows: () => [{ webContents: { send } }] },
}));
vi.mock("../src/db.ts", () => ({
  DOWNLOADS_DIR: "",
  ensureDirExists: vi.fn(),
}));
import { DownloadController } from "../src/downlaod-controller.ts";

let server: Server;
let directory: string;
let url: string;
let controller: DownloadController;
let respond: (response: ServerResponse) => void;

beforeEach(async () => {
  send.mockReset();
  controller = new DownloadController();
  directory = await mkdtemp(path.join(tmpdir(), "download-controls-"));
  server = createServer((_request, response) => respond(response));
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Missing address");
  url = `http://127.0.0.1:${address.port}/file.bin`;
});

afterEach(async () => {
  server.closeAllConnections();
  await new Promise<void>((resolve) => server.close(() => resolve()));
  await rm(directory, { recursive: true, force: true });
});

const options = () => ({
  file: "file.bin",
  fileUid: "transfer",
  url,
  downloadsDir: directory,
});
const completed = () =>
  send.mock.calls.filter(([channel]) => channel.endsWith(":completed"));
const progress = () =>
  send.mock.calls.filter(([channel]) => channel.endsWith(":progress"));

test("pause stops progress; continue writes the complete file before completion", async () => {
  let response!: ServerResponse;
  respond = (value) => {
    response = value;
    response.writeHead(200, { "Content-Length": 6 });
    response.write("abc");
  };
  const download = controller.getRemoteFileAsync(options());
  await vi.waitFor(() => expect(progress()).toHaveLength(1));
  expect(controller.control("transfer", "pause")).toBe(true);
  response.end("def");
  await new Promise((resolve) => setTimeout(resolve, 60));
  expect(progress()).toHaveLength(1);
  expect(completed()).toHaveLength(0);
  expect(controller.control("transfer", "continue")).toBe(true);
  await expect(download).resolves.toBe("completed");
  expect(await readFile(path.join(directory, "file.bin"), "utf8")).toBe(
    "abcdef",
  );
  expect(completed()).toHaveLength(1);
  expect(controller.control("transfer", "cancel")).toBe(false);
});

test("cancel stops a paused transfer and retry replaces partial contents", async () => {
  respond = (response) => {
    response.writeHead(200, { "Content-Length": 6 });
    response.write("abc");
  };
  const download = controller.getRemoteFileAsync(options());
  await vi.waitFor(() => expect(progress()).toHaveLength(1));
  controller.control("transfer", "pause");
  expect(controller.control("transfer", "cancel")).toBe(true);
  await expect(download).resolves.toBe("canceled");
  expect(completed()).toHaveLength(0);
  respond = (response) => response.end("replacement");
  await expect(controller.getRemoteFileAsync(options())).resolves.toBe(
    "completed",
  );
  expect(await readFile(path.join(directory, "file.bin"), "utf8")).toBe(
    "replacement",
  );
  expect(completed()).toHaveLength(1);
});

test("failed responses can be retried and cancellation works before headers", async () => {
  respond = (response) => {
    response.writeHead(500);
    response.end();
  };
  await expect(controller.getRemoteFileAsync(options())).rejects.toThrow("500");
  expect(completed()).toHaveLength(0);
  respond = () => {};
  const download = controller.getRemoteFileAsync(options());
  expect(controller.control("transfer", "cancel")).toBe(true);
  await expect(download).resolves.toBe("canceled");
  respond = (response) => response.end("success");
  await expect(controller.getRemoteFileAsync(options())).resolves.toBe(
    "completed",
  );
});
