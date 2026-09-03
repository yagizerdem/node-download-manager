import { Response } from "../shared/response.ts";

class HealthCheckController {
  healthCheck(): Response<{ status: string }> {
    return { success: true, code: "SUCCESS", data: { status: "ok" } };
  }
}

const healthCheckController = new HealthCheckController();
export default healthCheckController;
