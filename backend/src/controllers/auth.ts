import bcrypt from 'bcryptjs';
import {
  CookieOptions, NextFunction, Request, Response,
} from 'express';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import { isValidObjectId } from 'mongoose';
import {
  AUTH_ACCESS_TOKEN_EXPIRY, AUTH_ACCESS_TOKEN_SECRET,
  AUTH_REFRESH_TOKEN_EXPIRY, AUTH_REFRESH_TOKEN_SECRET,
} from '../config';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../errors';
import { TokenPayload } from '../middlewares/auth';
import User from '../models/user';

const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: false,
  maxAge: ms(AUTH_REFRESH_TOKEN_EXPIRY as ms.StringValue),
  path: '/',
};

const publicUser = ({ email, name }: { email: string; name: string }) => ({ email, name });

const readRefreshToken = (token?: string) => {
  try {
    return jwt.verify(token as string, AUTH_REFRESH_TOKEN_SECRET) as TokenPayload;
  } catch {
    return null;
  }
};

const sendTokens = async (
  res: Response,
  user: InstanceType<typeof User>,
  oldToken?: string,
) => {
  const payload: TokenPayload = { _id: user._id.toString() };
  const accessToken = jwt.sign(payload, AUTH_ACCESS_TOKEN_SECRET, {
    expiresIn: AUTH_ACCESS_TOKEN_EXPIRY as ms.StringValue,
  });
  const refreshToken = jwt.sign(payload, AUTH_REFRESH_TOKEN_SECRET, {
    expiresIn: AUTH_REFRESH_TOKEN_EXPIRY as ms.StringValue,
  });
  if (oldToken) await User.updateOne({ _id: user._id }, { $pull: { tokens: { token: oldToken } } });
  await User.updateOne({ _id: user._id }, { $push: { tokens: { token: refreshToken } } });
  return res
    .cookie('refreshToken', refreshToken, cookieOptions)
    .send({ user: publicUser(user), success: true, accessToken });
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.create(req.body);
    return await sendTokens(res.status(201), user);
  } catch (err) {
    return next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new UnauthorizedError('Неправильные почта или пароль'));
    }
    return await sendTokens(res, user);
  } catch (err) {
    return next(err);
  }
};

export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.refreshToken;
    const payload = readRefreshToken(token);
    const user = payload && await User.findOne({ _id: payload._id, 'tokens.token': token });
    if (!user) return next(new UnauthorizedError('Токен просрочен или невалиден'));
    return await sendTokens(res, user, token);
  } catch (err) {
    return next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.refreshToken;
    const payload = readRefreshToken(token);
    if (!payload) return next(new UnauthorizedError('Токен просрочен или невалиден'));
    if (!isValidObjectId(payload._id)) {
      return next(new BadRequestError('Невалидный идентификатор пользователя'));
    }
    const user = await User.findByIdAndUpdate(payload._id, { $pull: { tokens: { token } } });
    if (!user) return next(new NotFoundError('Пользователь не найден'));
    return res.clearCookie('refreshToken', { ...cookieOptions, maxAge: undefined }).send({ success: true });
  } catch (err) {
    return next(err);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) return next(new NotFoundError('Пользователь не найден'));
    return res.send({ user: publicUser(user), success: true });
  } catch (err) {
    return next(err);
  }
};
