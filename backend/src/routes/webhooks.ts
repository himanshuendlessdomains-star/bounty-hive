import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ─── Telegram Webhook ────────────────────────────────────────────────────────

router.post('/telegram', async (req: Request, res: Response) => {
  try {
    const update = req.body;

    // Handle /start command with deep link
    if (update.message?.text?.startsWith('/start')) {
      const chatId = update.message.chat.id;
      const text = update.message.text;

      // Deep link: /start bounty_<id>
      if (text.includes('bounty_')) {
        const bountyId = text.split('bounty_')[1];
        await sendTelegramMessage(
          chatId,
          `🏴‍☠️ Check out this bounty: https://t.me/BountyHiveBot/app?startApp=bounty_${bountyId}`
        );
      } else {
        await sendTelegramMessage(
          chatId,
          'Welcome to BountyHive! 🏴‍☠️\n\nCreate and complete micro-bounties on TON.\n\nOpen the app to get started.'
        );
      }
    }

    res.sendStatus(200);
  } catch (err: any) {
    console.error('Telegram webhook error:', err);
    res.sendStatus(500);
  }
});

// ─── Notification helper ──────────────────────────────────────────────────────

async function sendTelegramMessage(chatId: number, text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return;

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
  });
}

// ─── Send notification to bounty participants ─────────────────────────────────

export async function notifyBountyUpdate(bountyId: string, message: string) {
  const bounty = await prisma.bounty.findUnique({
    where: { id: bountyId },
    include: {
      submissions: { include: { user: true } },
      owner: true,
    },
  });

  if (!bounty) return;

  const recipients = new Set<number>();

  if (bounty.owner.telegramId) {
    recipients.add(Number(bounty.owner.telegramId));
  }

  for (const sub of bounty.submissions) {
    if (sub.user.telegramId) {
      recipients.add(Number(sub.user.telegramId));
    }
  }

  for (const chatId of recipients) {
    await sendTelegramMessage(chatId, message);
  }
}

export default router;
