import { Context, Next } from 'hono';
import { AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject) => {
  return async (c: Context, next: Next) => {
    try {
      let body = {};
      try {
        body = await c.req.json();
      } catch (e) {
        // ignore JSON parsing errors for bodyless requests
      }
      
      await schema.parseAsync({
        body,
        query: c.req.query(),
        params: c.req.param(),
      });
      await next();
    } catch (error) {
      if (error instanceof ZodError) {
        return c.json({
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        }, 400);
      }
      throw error;
    }
  };
};
