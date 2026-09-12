import { Response, NextFunction, Request } from 'express';
import { AuthRequest } from '../middleware/auth';

export const submitContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(201).json({ message: 'Thank you! We will be in touch shortly.', id: 'temp-id' });
  } catch (error) { next(error); }
};

export const getContacts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({ data: [] });
  } catch (error) { next(error); }
};
