import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const {
  PORT = '3000',
  DB_ADDRESS = 'mongodb://127.0.0.1:27017/weblarek',
  UPLOAD_PATH = 'images',
  UPLOAD_PATH_TEMP = 'temp',
  ORIGIN_ALLOW = 'http://localhost:5173',
  AUTH_REFRESH_TOKEN_EXPIRY = '7d',
  AUTH_ACCESS_TOKEN_EXPIRY = '10m',
  AUTH_ACCESS_TOKEN_SECRET = 'dev-access-secret',
  AUTH_REFRESH_TOKEN_SECRET = 'dev-refresh-secret',
} = process.env;

export const PUBLIC_DIR = path.join(__dirname, 'public');
export const IMAGES_DIR = path.join(PUBLIC_DIR, UPLOAD_PATH);
export const TEMP_DIR = path.join(PUBLIC_DIR, UPLOAD_PATH_TEMP);
