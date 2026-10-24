import { faker } from '@faker-js/faker';
import { NextFunction, Request, Response } from 'express';
import { BadRequestError } from '../errors';
import Product from '../models/product';

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items, total } = req.body as { items: string[]; total: number };
    const products = await Product.find({ _id: { $in: items } });
    const prices = new Map(products.map((p) => [p.id, p.price]));
    const missing = items.find((id) => !prices.has(id));
    if (missing) return next(new BadRequestError(`Товар ${missing} не найден`));
    const unsold = items.find((id) => prices.get(id) === null);
    if (unsold) return next(new BadRequestError(`Товар ${unsold} не продаётся`));
    const sum = items.reduce((acc, id) => acc + (prices.get(id) as number), 0);
    if (sum !== total) {
      return next(new BadRequestError('Сумма заказа не совпадает со стоимостью товаров'));
    }
    return res.send({ id: faker.string.uuid(), total });
  } catch (err) {
    return next(err);
  }
};
