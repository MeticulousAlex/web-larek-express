import { NextFunction, Request, Response } from 'express';
import { UPLOAD_PATH } from '../config';
import { BadRequestError } from '../errors';

export default (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) return next(new BadRequestError('Файл не передан'));
  return res.status(201).send({
    fileName: `/${UPLOAD_PATH}/${req.file.filename}`,
    originalName: req.file.originalname,
  });
};
