import cookieParser from 'cookie-parser';
import cors from 'cors';
import { CronJob } from 'cron';
import express, { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import {
  DB_ADDRESS, ORIGIN_ALLOW, PORT, PUBLIC_DIR, TEMP_DIR,
} from './config';
import { NotFoundError } from './errors';
import Product from './models/product';
import auth from './routes/auth';
import errorHandler from './middlewares/error-handler';
import { errorLogger, requestLogger } from './middlewares/logger';
import order from './routes/order';
import product from './routes/product';
import upload from './routes/upload';

const app = express();

app.use(requestLogger);
app.use(cors({ origin: ORIGIN_ALLOW, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.static(PUBLIC_DIR, { index: false }));

app.use('/auth', auth);
app.use('/product', product);
app.use('/order', order);
app.use('/upload', upload);
app.use((_req: Request, _res: Response, next: NextFunction) => next(new NotFoundError('Маршрут не найден')));

app.use(errorLogger);
app.use(errorHandler);

const cleanTemp = () => fs.readdir(TEMP_DIR, (err, files) => {
  if (err) return;
  files.forEach((f) => fs.stat(`${TEMP_DIR}/${f}`, (_e, s) => {
    if (s && Date.now() - s.mtimeMs > 60 * 60 * 1000) fs.unlink(`${TEMP_DIR}/${f}`, () => {});
  }));
});
CronJob.from({ cronTime: '0 * * * *', onTick: cleanTemp, start: true });

const seedProducts = async () => {
  if (await Product.estimatedDocumentCount() > 0) return;
  const file = path.join(__dirname, '../product.json');
  await Product.insertMany(JSON.parse(fs.readFileSync(file, 'utf-8')));
};

mongoose.connect(DB_ADDRESS)
  .then(seedProducts)
  .then(() => app.listen(Number(PORT), () => console.log(`Сервер запущен на порту ${PORT}`)))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
