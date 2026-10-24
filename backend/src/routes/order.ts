import { Router } from 'express';
import createOrder from '../controllers/order';
import { createOrder as validateOrder } from '../middlewares/validation';

const router = Router();

router.post('/', validateOrder, createOrder);

export default router;
