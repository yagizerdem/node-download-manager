import { Response } from "../../shared/response.ts";

export {};

declare global {
  interface Window {
    backend: {
      healthCheck: () => Promise<Response<{ status: string }>>;
    };
    speedTest: {
      startSpeedTest: () => Promise<void>;
      onReceiveData: (data: number) => void;
      startSpeedTestAsync: () => Promise<Response<{ mbps: number }>>;
    };
  }
}
