import { isCelebrateError } from 'celebrate';
import { NextFunction, Request, Response } from 'express';
import { MulterError } from 'multer';
import { Error as MongooseError } from 'mongoose';
import { BadRequestError, ConflictError, HttpError } from '../errors';

const duplicateMessages: Record<string, string> = {
  title: 'Товар с таким названием уже существует',
  email: 'Пользователь с таким email уже существует',
};

const toHttpError = (err: unknown): HttpError => {
  if (err instanceof HttpError) return err;
  if (isCelebrateError(err)) {
    const [details] = Array.from(err.details.values());
    return new BadRequestError(details.message);
  }
  if (err instanceof MongooseError.ValidationError || err instanceof MongooseError.CastError) {
    return new BadRequestError(err.message);
  }
  if (err instanceof MulterError) return new BadRequestError('Файл слишком большой или не загружен');
  if (err instanceof SyntaxError) return new BadRequestError('Некорректный JSON');
  if (err instanceof Error && err.message.includes('E11000')) {
    const { keyPattern } = err as Error & { keyPattern?: Record<string, number> };
    const field = Object.keys(keyPattern || {})[0];
    return new ConflictError(duplicateMessages[field] || 'Запись с такими данными уже существует');
  }
  return new HttpError(500, 'На сервере произошла ошибка');
};

export default (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const { statusCode, message } = toHttpError(err);
  res.status(statusCode).send({ message });
};
