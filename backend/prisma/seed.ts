import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample users
  const alice = await prisma.user.upsert({
    where: { telegramId: '1001' },
    update: {},
    create: {
      telegramId: '1001',
      username: 'alice',
      displayName: 'Alice',
    },
  });

  const bob = await prisma.user.upsert({
    where: { telegramId: '1002' },
    update: {},
    create: {
      telegramId: '1002',
      username: 'bob',
      displayName: 'Bob',
    },
  });

  const carol = await prisma.user.upsert({
    where: { telegramId: '1003' },
    update: {},
    create: {
      telegramId: '1003',
      username: 'carol',
      displayName: 'Carol',
    },
  });

  console.log(`   Created users: ${alice.username}, ${bob.username}, ${carol.username}`);

  // Create sample bounties
  const now = new Date();

  const bounty1 = await prisma.bounty.create({
    data: {
      title: 'Follow us on Twitter',
      description: 'Follow @bountyhive on Twitter and share a screenshot of the follow confirmation.',
      type: 'task',
      poolAmount: '2',
      poolUsd: '6.50',
      winnerCount: 10,
      perWinnerAmount: '0.2',
      perWinnerUsd: '0.65',
      winnerSelection: 'draw',
      verification: 'manual',
      verificationRule: '',
      ownerId: alice.id,
      status: 'active',
      endsAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      reviewEndsAt: new Date(now.getTime() + 48 * 60 * 60 * 1000),
    },
  });

  const bounty2 = await prisma.bounty.create({
    data: {
      title: 'Write a haiku about TON',
      description: 'Write an original haiku (5-7-5 syllables) about The Open Network. Most creative wins!',
      type: 'creative',
      poolAmount: '5',
      poolUsd: '16.25',
      winnerCount: 3,
      perWinnerAmount: '1.666667',
      perWinnerUsd: '5.42',
      winnerSelection: 'manual',
      verification: 'manual',
      verificationRule: '',
      ownerId: alice.id,
      status: 'active',
      endsAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      reviewEndsAt: new Date(now.getTime() + 48 * 60 * 60 * 1000),
    },
  });

  const bounty3 = await prisma.bounty.create({
    data: {
      title: 'Answer: What is TON?',
      description: 'Correctly answer: What does TON stand for and what is its primary use case?',
      type: 'quiz',
      poolAmount: '1',
      poolUsd: '3.25',
      winnerCount: 5,
      perWinnerAmount: '0.2',
      perWinnerUsd: '0.65',
      winnerSelection: 'draw',
      verification: 'auto',
      verificationRule: 'Must include the correct answer: The Open Network, a decentralized blockchain platform',
      ownerId: bob.id,
      status: 'active',
      endsAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      reviewEndsAt: new Date(now.getTime() + 48 * 60 * 60 * 1000),
    },
  });

  console.log(`   Created ${3} sample bounties`);

  // Create sample submissions
  await prisma.submission.createMany({
    data: [
      {
        bountyId: bounty1.id,
        userId: bob.id,
        proofUrl: 'https://twitter.com/bob/status/123',
        status: 'pending',
      },
      {
        bountyId: bounty1.id,
        userId: carol.id,
        proofUrl: 'https://twitter.com/carol/status/456',
        status: 'approved',
      },
      {
        bountyId: bounty2.id,
        userId: carol.id,
        proofUrl: 'TON flows fast\nBlocks confirm in seconds\nWeb3 is here',
        status: 'pending',
      },
    ],
  });

  console.log('   Created sample submissions');
  console.log('✅ Seed complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
