import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { TEMP_DIR } from '../config';
import { BadRequestError } from '../errors';

const TYPES = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/svg+xml'];

export default multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => {
      fs.mkdirSync(TEMP_DIR, { recursive: true });
      callback(null, TEMP_DIR);
    },
    filename: (_req, file, callback) => callback(null, `${randomUUID()}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => (
    TYPES.includes(file.mimetype) ? callback(null, true) : callback(new BadRequestError('Недопустимый тип файла'))
  ),
});
