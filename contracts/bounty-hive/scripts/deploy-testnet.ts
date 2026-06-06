import { TonClient, WalletContractV4 } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { BountyFactory } from '../build/BountyFactory/BountyFactory_BountyFactory';
import { BountyEscrow } from '../build/BountyEscrow/BountyEscrow_BountyEscrow';
import { toNano } from '@ton/core';

// ─── Testnet Deployment ──────────────────────────────────────────────────────
//
// Prerequisites:
//   1. Set MNEMONIC env var (24-word seed phrase for your testnet wallet)
//   2. Fund the wallet on testnet via @testgiver_ton_bot
//   3. Run: npx tsx scripts/deploy-testnet.ts
//
// ⚠️ This is testnet only. Funds have no real value.

async function deploy() {
  const mnemonic = process.env.MNEMONIC;
  if (!mnemonic) {
    console.error('❌ Set MNEMONIC env var with your 24-word seed phrase');
    process.exit(1);
  }

  console.log('🔑 Loading wallet...');
  const key = await mnemonicToPrivateKey(mnemonic.split(' '));

  const client = new TonClient({
    endpoint: 'https://testnet.toncenter.com/api/v2/',
  });

  const wallet = client.open(
    WalletContractV4.create({
      workchain: 0,
      publicKey: key.publicKey,
    })
  );

  const walletAddress = wallet.address.toString({ bounceable: true });
  console.log(`💰 Wallet: ${walletAddress}`);

  const balance = await wallet.getBalance();
  console.log(`   Balance: ${fromNano(balance)} TON`);

  if (balance < toNano('0.5')) {
    console.error('❌ Wallet balance too low. Fund via @testgiver_ton_bot');
    console.error(`   Send TON to: ${walletAddress}`);
    process.exit(1);
  }

  // ─── Deploy BountyFactory ────────────────────────────────────────────────

  console.log('\n📦 Deploying BountyFactory...');

  const factory = client.open(
    BountyFactory.fromInit(100, wallet.address) // 100 bps = 1% fee
  );

  const factoryAddress = factory.address.toString({ bounceable: true });
  console.log(`   Factory address: ${factoryAddress}`);

  // Check if already deployed
  const factoryState = await client.getContractState(factory.address);
  if (factoryState.state === 'active') {
    console.log('   ✅ Factory already deployed');
  } else {
    // Send deploy transaction
    const seqno = await wallet.getSeqno();
    await wallet.send(key.secretKey, {
      to: factory.address,
      value: toNano('0.1'),
      body: 'deploy',
      sendMode: 3,
    });

    console.log('   ⏳ Waiting for deployment...');
    await waitForDeployment(client, factory.address, 30);
    console.log('   ✅ Factory deployed!');
  }

  // ─── Output config ────────────────────────────────────────────────────────

  console.log('\n' + '='.repeat(60));
  console.log('🎉 Deployment complete!');
  console.log('='.repeat(60));
  console.log(`
Factory address: ${factoryAddress}
Platform fee: 1%
Network: testnet
`);
  console.log('Add this to your config:');
  console.log(`
  # frontend/.env
  VITE_FACTORY_ADDRESS=${factoryAddress}
  VITE_TON_NETWORK=testnet

  # backend/.env
  FACTORY_ADDRESS=${factoryAddress}
  TON_NETWORK=testnet
`);

  // ─── Test: Create a sample bounty ─────────────────────────────────────────

  const shouldCreateSample = process.env.CREATE_SAMPLE === 'true';
  if (shouldCreateSample) {
    console.log('\n🏴‍☠️ Creating sample bounty...');

    const escrow = client.open(
      BountyEscrow.fromInit(
        wallet.address,
        'Follow me on Twitter',
        'Follow @bountyhive on Twitter and share a screenshot',
        'task',
        toNano('1'), // 1 TON pool
        10, // 10 winners
        'draw',
        'manual',
        '',
        100, // 1% fee
        wallet.address,
        Math.floor(Date.now() / 1000)
      )
    );

    const escrowAddress = escrow.address.toString({ bounceable: true });
    console.log(`   Escrow address: ${escrowAddress}`);

    // Deploy escrow + fund with pool
    const seqno = await wallet.getSeqno();
    await wallet.send(key.secretKey, {
      to: escrow.address,
      value: toNano('1.05'), // 1 TON pool + gas
      body: 'deploy',
      sendMode: 3,
    });

    console.log('   ⏳ Waiting for escrow deployment...');
    await waitForDeployment(client, escrow.address, 30);
    console.log('   ✅ Sample bounty created!');
    console.log(`   Escrow: ${escrowAddress}`);
  }
}

async function waitForDeployment(client: any, address: any, maxAttempts: number) {
  for (let i = 0; i < maxAttempts; i++) {
    const state = await client.getContractState(address);
    if (state.state === 'active') return;
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error('Deployment timeout');
}

function fromNano(nano: bigint): string {
  return (Number(nano) / 1e9).toFixed(4);
}

deploy().catch(console.error);
