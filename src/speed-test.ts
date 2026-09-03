import { get } from "node:https";
import type { IncomingMessage } from "node:http";

// Public test file (5 Megabytes from Cloudflare/Httpbin equivalents or similar public endpoints)
// Using a known file size to calculate bandwidth accurately
const TEST_BYTES = 50_000_000; // 50 MB
const TEST_URL = `https://speed.cloudflare.com/__down?bytes=${TEST_BYTES}`;

type SpeedTestResult =
  | { status: "completed"; mbps: number }
  | { status: "active"; mbps: number }
  | { status: "aborted" };

export function runSpeedTest(
  abortController: AbortController,
  onEnd: (result: SpeedTestResult) => any,
  onData: (result: SpeedTestResult) => any,
  onError: (result: SpeedTestResult) => any,
): void {
  console.log("Starting download speed test...");
  const startTime = Date.now();

  get(TEST_URL, { signal: abortController.signal }, (res: IncomingMessage) => {
    let downloadedBytes = 0;

    res.on("data", (chunk: Buffer) => {
      downloadedBytes += chunk.length;
      const durationInSeconds = (Date.now() - startTime) / 1000;
      const bitsDownloaded = downloadedBytes * 8;
      const bps = bitsDownloaded / durationInSeconds;
      const mbps = (bps / (1024 * 1024)).toFixed(2);
      onData({ status: "active", mbps: parseFloat(mbps) });
    });

    res.on("end", () => {
      const endTime = Date.now();
      const durationInSeconds = (endTime - startTime) / 1000;

      // Calculate bits per second and convert to Mbps
      const bitsDownloaded = downloadedBytes * 8;
      const bps = bitsDownloaded / durationInSeconds;
      const mbps = (bps / (1024 * 1024)).toFixed(2);

      console.log(
        `Downloaded: ${(downloadedBytes / (1024 * 1024)).toFixed(2)} MB`,
      );
      console.log(`Time taken: ${durationInSeconds} seconds`);
      console.log(`Download Speed: ${mbps} Mbps`);
      onEnd({ status: "completed", mbps: parseFloat(mbps) });
    });
  }).on("error", (err: Error) => {
    console.error("Speed test failed:", err.message);
    onError({ status: "aborted" });
  });
}

export function runSpeedTestAsync(
  abortController: AbortController,
): Promise<SpeedTestResult> {
  return new Promise<SpeedTestResult>((resolve, reject) => {
    console.log("Starting download speed test...");
    const startTime = Date.now();

    get(
      TEST_URL,
      { signal: abortController.signal },
      (res: IncomingMessage) => {
        let downloadedBytes = 0;

        res.on("data", (chunk: Buffer) => {
          downloadedBytes += chunk.length;
        });

        res.on("end", () => {
          const endTime = Date.now();
          const durationInSeconds = (endTime - startTime) / 1000;

          // Calculate bits per second and convert to Mbps
          const bitsDownloaded = downloadedBytes * 8;
          const bps = bitsDownloaded / durationInSeconds;
          const mbps = (bps / (1024 * 1024)).toFixed(2);

          console.log(
            `Downloaded: ${(downloadedBytes / (1024 * 1024)).toFixed(2)} MB`,
          );
          console.log(`Time taken: ${durationInSeconds} seconds`);
          console.log(`Download Speed: ${mbps} Mbps`);
          resolve({ status: "completed", mbps: parseFloat(mbps) });
        });
      },
    ).on("error", (err: Error) => {
      reject({ status: "aborted" });
    });
  });
}
