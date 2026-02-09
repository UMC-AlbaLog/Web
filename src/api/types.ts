export interface TsoaResponse<T> {
  resultType: "SUCCESS" | "FAIL";
  success?: T;
  error?: {
    errorCode: string;
    errorMessage: string;
    data: any;
  };
  message?: string;
}


