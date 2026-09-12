import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';

export const getConversations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({ data: [] });
  } catch (error) { next(error); }
};

export const createConversation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.status(201).json({ data: { id: 'temp-conv-id', name: req.body.name, members: [] } });
  } catch (error) { next(error); }
};

export const getMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({ data: [] });
  } catch (error) { next(error); }
};

export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.status(201).json({ data: { id: 'temp-msg-id', content: req.body.content } });
  } catch (error) { next(error); }
};
