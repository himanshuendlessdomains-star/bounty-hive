import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// ─── POST /api/webhooks/telegram ─────────────────────────────────────────────

router.post('/telegram', async (req: Request, res: Response) => {
  try {
    const update = req.body;
    const text: string = update.message?.text ?? '';
    const chatId: number = update.message?.chat?.id;

    if (!text.startsWith('/start') || !chatId) {
      return res.sendStatus(200);
    }

    const parts = text.trim().split(' ');
    const payload = parts[1] ?? '';

    if (payload.startsWith('bounty_')) {
      const bountyId = payload.slice(7);
      await sendMessage(chatId, `🏴‍☠️ Check out this bounty in BountyHive!\n\nhttps://t.me/BountyHiveBot/app?startApp=bounty_${bountyId}`);
    } else {
      await sendMessage(chatId, 'Welcome to BountyHive! 🏴‍☠️\n\nCreate and complete micro-bounties on TON.\n\nOpen the app to get started.');
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Telegram webhook error:', err);
    res.sendStatus(500);
  }
});

// ─── Helper ───────────────────────────────────────────────────────────────────

async function sendMessage(chatId: number, text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return;
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

export async function notifyBountyUpdate(bountyId: string, message: string) {
  const bounty = await prisma.bounty.findUnique({
    where: { id: bountyId },
    include: { submissions: { include: { user: true } }, owner: true },
  });
  if (!bounty) return;

  const recipients = new Set<number>();
  if (bounty.owner.telegramId) recipients.add(Number(bounty.owner.telegramId));
  for (const sub of bounty.submissions) {
    if (sub.user.telegramId) recipients.add(Number(sub.user.telegramId));
  }
  for (const chatId of recipients) {
    await sendMessage(chatId, message);
  }
}

export default router;
