import { oauth2Client, getAuthUrl, getGoogleOauth2Client } from '../config/google.js';

/**
 * Initiates the Google OAuth flow by redirecting the browser to Google
 */
export const initiateGoogleLogin = (req, res) => {
  const url = getAuthUrl();
  res.redirect(url);
};

/**
 * Returns the Google login URL for frontend-initiated flows
 */
export const getGoogleLoginUrl = (req, res) => {
  const url = getAuthUrl();
  res.status(200).json({ url });
};

/**
 * Handles the redirect callback from Google. Exchanges the code for tokens.
 */
export const googleCallback = async (req, res) => {
  const { code } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!code) {
    return res.redirect(`${frontendUrl}?auth_error=no_code_provided`);
  }

  try {
    // Exchange the authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    // Create an auth client to fetch user profile info
    const oauth2 = getGoogleOauth2Client(tokens);
    const userInfo = await oauth2.userinfo.get();

    // Store tokens and user profile in the session
    req.session.tokens = tokens;
    req.session.user = {
      name: userInfo.data.name,
      email: userInfo.data.email,
      picture: userInfo.data.picture,
    };

    console.log(`Successfully authenticated user: ${userInfo.data.email}`);
    
    // Redirect back to the frontend
    res.redirect(`${frontendUrl}?auth=success`);
  } catch (error) {
    console.error('OAuth exchange error:', error);
    res.redirect(`${frontendUrl}?auth_error=${encodeURIComponent(error.message)}`);
  }
};

/**
 * Handles a JSON POST login where the frontend sends the code directly
 */
export const loginWithCode = async (req, res, next) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Auth code is required.' });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    const oauth2 = getGoogleOauth2Client(tokens);
    const userInfo = await oauth2.userinfo.get();

    req.session.tokens = tokens;
    req.session.user = {
      name: userInfo.data.name,
      email: userInfo.data.email,
      picture: userInfo.data.picture,
    };

    res.status(200).json({
      message: 'Authentication successful',
      user: req.session.user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Checks the session status to see if the user is authenticated
 */
export const checkAuthStatus = (req, res) => {
  if (req.session && req.session.tokens && req.session.user) {
    return res.status(200).json({
      authenticated: true,
      user: req.session.user
    });
  }
  
  res.status(200).json({
    authenticated: false
  });
};

/**
 * Destroys the session to sign the user out
 */
export const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error during logout:', err);
      return res.status(500).json({ error: 'Could not log out. Please try again.' });
    }
    
    res.clearCookie('connect.sid'); // clear session cookie
    res.status(200).json({ message: 'Logged out successfully' });
  });
};
