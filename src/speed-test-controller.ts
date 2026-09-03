import { BrowserWindow } from "electron";
import { Response } from "../shared/response.ts";
import { runSpeedTest, runSpeedTestAsync } from "./speed-test.ts";

export class SpeedTestController {
  controller = new AbortController();
  constructor() {}

  startSpeedTest(): void {
    this.controller.abort(); // abort the previous test if any
    this.controller = new AbortController(); // create a new controller for the new test
    const window = BrowserWindow.getAllWindows()[0];
    runSpeedTest(
      this.controller,
      () => {},
      () => {
        window?.webContents.send("speedTest:onData", 12);
      },
      () => {},
    );
  }

  async startSpeedTestAsync(): Promise<Response<{ mbps: number }>> {
    try {
      this.controller.abort(); // abort the previous test if any
      this.controller = new AbortController(); // create a new controller for the new test
      const result = await runSpeedTestAsync(this.controller);
      if (result.status === "completed") {
        return {
          code: "SUCCESS",
          success: true,
          data: {
            mbps: result.mbps,
          },
        };
      }
      return {
        code: "UNKOWNERROR",
        success: false,
        data: {
          mbps: 0,
        },
      };
    } catch (error) {
      return {
        code: "UNKOWNERROR",
        success: false,
        data: {
          mbps: 0,
        },
      };
    }
  }
}

const speedTestController = new SpeedTestController();

export default speedTestController;
