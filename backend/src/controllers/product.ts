import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { IMAGES_DIR, TEMP_DIR, UPLOAD_PATH } from '../config';
import { NotFoundError } from '../errors';
import Product, { IProduct } from '../models/product';

const persistImage = async (image?: IProduct['image']) => {
  if (!image) return image;
  const name = path.basename(image.fileName);
  const tempFile = path.join(TEMP_DIR, name);
  if (!fs.existsSync(tempFile)) return image;
  await fs.promises.mkdir(IMAGES_DIR, { recursive: true });
  await fs.promises.rename(tempFile, path.join(IMAGES_DIR, name));
  return { ...image, fileName: `/${UPLOAD_PATH}/${name}` };
};

export const getProducts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await Product.find({});
    return res.send({ items, total: items.length });
  } catch (err) {
    return next(err);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const image = await persistImage(req.body.image);
    return res.status(201).send(await Product.create({ ...req.body, image }));
  } catch (err) {
    return next(err);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const image = await persistImage(req.body.image);
    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      image ? { ...req.body, image } : req.body,
      { new: true, runValidators: true },
    );
    if (!product) return next(new NotFoundError('Товар не найден'));
    return res.send(product);
  } catch (err) {
    return next(err);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.productId);
    if (!product) return next(new NotFoundError('Товар не найден'));
    return res.send(product);
  } catch (err) {
    return next(err);
  }
};
