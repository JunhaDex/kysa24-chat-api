import { ApiResponse } from '@/types/general.type'

export function formatResponse(code: number, result: any): ApiResponse {
  let message = '';
  if (code >= 200 && code < 300) {
    message = 'ok';
  } else if (code === 400) {
    message = 'bad request';
  } else if (code === 401) {
    message = 'unauthorized';
  } else if (code === 403) {
    message = 'forbidden';
  } else if (code === 404) {
    message = 'not found';
  } else if (code === 409) {
    message = 'conflict';
  } else if (code === 500) {
    message = 'internal server error';
  }
  return {
    code,
    message,
    result,
  };
}
