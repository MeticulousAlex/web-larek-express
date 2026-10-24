import { Router } from 'express';
import {
  createProduct, deleteProduct, getProducts, updateProduct,
} from '../controllers/product';
import auth from '../middlewares/auth';
import * as validate from '../middlewares/validation';

const router = Router();

router.get('/', getProducts);
router.post('/', auth, validate.createProduct, createProduct);
router.patch('/:productId', auth, validate.updateProduct, updateProduct);
router.delete('/:productId', auth, validate.productIdParams, deleteProduct);

export default router;
