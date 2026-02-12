/** 백엔드 tsoa 스타일 응답 */
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