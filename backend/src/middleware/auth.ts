import { Request, Response, NextFunction } from 'express';

// ─── Telegram WebApp Auth Middleware ─────────────────────────────────────────
// Validates Telegram initData to authenticate requests

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

// In production, validate the hash using the bot token
// For now, we parse the user data from the initData query string
export function telegramAuth(req: Request, res: Response, next: NextFunction) {
  const initData = req.headers['x-telegram-init-data'] as string;

  if (!initData) {
    // In development, allow requests without auth
    if (process.env.NODE_ENV === 'development') {
      req.user = {
        id: 'dev-user',
        telegramId: '0',
        username: 'dev',
        displayName: 'Dev User',
      };
      return next();
    }
    return res.status(401).json({ error: 'Missing Telegram auth data' });
  }

  try {
    // Parse initData query string
    const params = new URLSearchParams(initData);
    const userJson = params.get('user');

    if (!userJson) {
      return res.status(401).json({ error: 'Invalid auth data' });
    }

    const tgUser: TelegramUser = JSON.parse(userJson);

    // In production, validate the hash:
    // const hash = params.get('hash');
    // const secret = crypto.createHmac('sha256', BOT_TOKEN).update('WebAppData').digest();
    // const checkString = [...params.entries()].filter(([k]) => k !== 'hash').sort().map(([k, v]) => `${k}=${v}`).join('\n');
    // const checkHash = crypto.createHmac('sha256', secret).update(checkString).digest('hex');
    // if (checkHash !== hash) return res.status(401).json({ error: 'Invalid hash' });

    req.user = {
      id: String(tgUser.id),
      telegramId: String(tgUser.id),
      username: tgUser.username,
      displayName: tgUser.first_name + (tgUser.last_name ? ` ${tgUser.last_name}` : ''),
      avatarUrl: tgUser.photo_url,
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid auth data' });
  }
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        telegramId: string;
        username?: string;
        displayName?: string;
        avatarUrl?: string;
      };
    }
  }
}
