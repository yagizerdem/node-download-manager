export type ResponseCode = "SUCCESS" | "UNKOWNERROR";

export interface Response<T> {
  success: boolean;
  code: ResponseCode;
  data?: T;
}
