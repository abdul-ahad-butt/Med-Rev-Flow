import { Context } from 'hono';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const createError = (message: string, statusCode: number): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

export const errorHandler = (err: Error | AppError, c: Context) => {
  const appError = err as AppError;
  let statusCode = 500;
  if (typeof appError.statusCode === 'number' && appError.statusCode >= 200 && appError.statusCode <= 599) {
    statusCode = appError.statusCode;
  }
  const message = appError.isOperational ? appError.message : 'Internal server error';

  console.error('[ERROR]', err);

  return c.json({
    error: message,
    stack: err.stack,
  }, statusCode as any);
};
