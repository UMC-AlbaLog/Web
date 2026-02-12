export interface TsoaResponse<T> {
  resultType: "SUCCESS" | "FAIL";
  success?: T;
  error?: any;
  message?: string;
}