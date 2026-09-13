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
  const statusCode = appError.statusCode || 500;
  const message = appError.isOperational ? appError.message : 'Internal server error';

  if (process.env.NODE_ENV === 'development') {
    console.error('[ERROR]', err);
  }

  return c.json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  }, statusCode as any);
};
