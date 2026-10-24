import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AUTH_ACCESS_TOKEN_SECRET } from '../config';
import { UnauthorizedError } from '../errors';

export interface TokenPayload {
  _id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export default (req: Request, _res: Response, next: NextFunction) => {
  const [type, token] = (req.headers.authorization || '').split(' ');
  if (type !== 'Bearer' || !token) return next(new UnauthorizedError());
  try {
    req.user = jwt.verify(token, AUTH_ACCESS_TOKEN_SECRET) as TokenPayload;
    return next();
  } catch {
    return next(new UnauthorizedError());
  }
};
