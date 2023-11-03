import { v4 as uuidv4 } from 'uuid';

process.env.WEBHOOK_URL = 'https://google.com';
process.env.PICTURE_STORE_PATH = __dirname;
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_USERNAME = 'postgres';
process.env.DB_PASSWORD = 'example';
process.env.DB_NAME = 'postgres' + uuidv4();
