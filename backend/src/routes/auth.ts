import { Router } from 'express';
import {
  getCurrentUser, login, logout, refreshAccessToken, register,
} from '../controllers/auth';
import auth from '../middlewares/auth';
import * as validate from '../middlewares/validation';

const router = Router();

router.post('/login', validate.login, login);
router.post('/register', validate.register, register);
router.get('/token', refreshAccessToken);
router.get('/logout', logout);
router.get('/user', auth, getCurrentUser);

export default router;
