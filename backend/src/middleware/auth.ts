import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

function validateTelegramHash(initData: string, botToken: string): boolean {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return false;

  params.delete('hash');
  const checkString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const checkHash = crypto.createHmac('sha256', secret).update(checkString).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(checkHash, 'hex'), Buffer.from(hash, 'hex'));
}

export function telegramAuth(req: Request, res: Response, next: NextFunction) {
  const initData = req.headers['x-telegram-init-data'] as string;

  if (!initData) {
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
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (botToken && process.env.NODE_ENV !== 'development') {
      if (!validateTelegramHash(initData, botToken)) {
        return res.status(401).json({ error: 'Invalid Telegram auth data' });
      }
    }

    const params = new URLSearchParams(initData);
    const userJson = params.get('user');

    if (!userJson) {
      return res.status(401).json({ error: 'Invalid auth data: missing user' });
    }

    const tgUser: TelegramUser = JSON.parse(userJson);

    req.user = {
      id: String(tgUser.id),
      telegramId: String(tgUser.id),
      username: tgUser.username,
      displayName: tgUser.first_name + (tgUser.last_name ? ` ${tgUser.last_name}` : ''),
      avatarUrl: tgUser.photo_url,
    };

    next();
  } catch {
    return res.status(401).json({ error: 'Invalid auth data' });
  }
}

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
