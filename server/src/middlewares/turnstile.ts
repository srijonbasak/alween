import { Request, Response, NextFunction } from 'express';

export const verifyTurnstile = async (req: Request, res: Response, next: NextFunction) => {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  
  // Bypass validation in development environment if configured with dummy keys
  if (process.env.NODE_ENV === 'development' && (!secretKey || secretKey.startsWith('1x00000'))) {
    return next();
  }

  const token = req.headers['x-turnstile-token'] || req.body.turnstileToken;

  if (!token) {
    res.status(400).json({ error: 'Security verification token is missing.' });
    return;
  }

  try {
    const verificationUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    
    // Perform verification request to Cloudflare API
    const response = await fetch(verificationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
        remoteip: req.ip,
      }),
    });

    const result = await response.json() as { success: boolean; 'error-codes'?: string[] };

    if (result.success) {
      next();
    } else {
      res.status(403).json({
        error: 'Security verification failed. Please try again.',
        details: result['error-codes']
      });
    }
  } catch (error: any) {
    res.status(500).json({
      error: 'Unable to connect to security validation service.',
      message: error.message
    });
  }
};
