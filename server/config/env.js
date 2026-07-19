import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamically resolve and load the root .env file relative to this config file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log('[Env Loader] Root environment variables loaded successfully.');
