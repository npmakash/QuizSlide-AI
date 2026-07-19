import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

// Standard OAuth2 client for user redirects and exchanges
export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// We need profile info, email, slides to modify presentations, and drive to copy files & export them as PDF/PPTX
export const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/presentations',
  'https://www.googleapis.com/auth/drive'
];

/**
 * Generate Google Consent Screen Auth URL
 */
export const getAuthUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline', // requested to obtain refresh_token
    prompt: 'consent',      // force consent screen to guarantee refresh_token
    scope: SCOPES
  });
};

/**
 * Helper to build OAuth client loaded with specific user tokens
 */
export const getAuthenticatedClient = (tokens) => {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  client.setCredentials(tokens);
  return client;
};

/**
 * Get Google Slides Client
 */
export const getGoogleSlidesClient = (tokens) => {
  const auth = getAuthenticatedClient(tokens);
  return google.slides({ version: 'v1', auth });
};

/**
 * Get Google Drive Client
 */
export const getGoogleDriveClient = (tokens) => {
  const auth = getAuthenticatedClient(tokens);
  return google.drive({ version: 'v3', auth });
};

/**
 * Get Google OAuth2 UserInfo Client
 */
export const getGoogleOauth2Client = (tokens) => {
  const auth = getAuthenticatedClient(tokens);
  return google.oauth2({ version: 'v2', auth });
};
