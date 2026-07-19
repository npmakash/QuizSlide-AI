import express from 'express';
import {
  initiateGoogleLogin,
  getGoogleLoginUrl,
  googleCallback,
  loginWithCode,
  checkAuthStatus,
  logoutUser
} from '../controllers/authController.js';

const router = express.Router();

// Redirect to Google Consent Page
router.get('/google', initiateGoogleLogin);

// Get the Google Auth URL
router.get('/google/url', getGoogleLoginUrl);

// Google Callback Endpoint
router.get('/google/callback', googleCallback);

// Endpoint for frontend token exchange
router.post('/login/google', loginWithCode);

// Auth Status verification
router.get('/status', checkAuthStatus);

// Sign out
router.post('/logout', logoutUser);

export default router;
