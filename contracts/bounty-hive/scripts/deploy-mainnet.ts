import { TonClient, WalletContractV4 } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { BountyFactory } from '../build/BountyFactory/BountyFactory_BountyFactory';
import { toNano } from '@ton/core';

// ─── Mainnet Deployment ──────────────────────────────────────────────────────
//
// Prerequisites:
//   1. Set MNEMONIC env var (24-word seed phrase for your MAINNET wallet)
//   2. Wallet must hold at least 0.3 TON for deploy gas
//   3. Run from contracts/bounty-hive/:
//        MNEMONIC="word1 word2 ..." npx tsx scripts/deploy-mainnet.ts
//
// ⚠️  This uses REAL TON. Double-check everything before running.

async function deploy() {
  const mnemonic = process.env.MNEMONIC;
  if (!mnemonic) {
    console.error('❌ Set MNEMONIC env var with your 24-word seed phrase');
    process.exit(1);
  }

  console.log('🔑 Loading wallet...');
  const key = await mnemonicToPrivateKey(mnemonic.split(' '));

  const client = new TonClient({ endpoint: 'https://toncenter.com/api/v2/' });

  const wallet = client.open(
    WalletContractV4.create({ workchain: 0, publicKey: key.publicKey })
  );

  const walletAddress = wallet.address.toString({ bounceable: true });
  console.log(`💰 Wallet: ${walletAddress}`);

  const balance = await wallet.getBalance();
  const balanceTon = (Number(balance) / 1e9).toFixed(4);
  console.log(`   Balance: ${balanceTon} TON`);

  if (balance < toNano('0.3')) {
    console.error('❌ Wallet balance too low (need at least 0.3 TON for gas)');
    process.exit(1);
  }

  // ─── Deploy BountyFactory ────────────────────────────────────────────────

  console.log('\n📦 Deploying BountyFactory to mainnet...');
  console.log('   ⚠️  This will spend real TON. Ctrl+C to abort. Waiting 5 seconds...');
  await new Promise((r) => setTimeout(r, 5000));

  const factory = client.open(
    BountyFactory.fromInit(100, wallet.address) // 100 bps = 1% platform fee
  );

  const factoryAddress = factory.address.toString({ bounceable: true });
  console.log(`   Factory address: ${factoryAddress}`);

  const factoryState = await client.getContractState(factory.address);
  if (factoryState.state === 'active') {
    console.log('   ✅ Factory already deployed at this address');
  } else {
    await wallet.send(key.secretKey, {
      to: factory.address,
      value: toNano('0.2'),
      body: 'deploy',
      sendMode: 3,
    });

    console.log('   ⏳ Waiting for confirmation (up to 60s)...');
    await waitForDeployment(client, factory.address, 30);
    console.log('   ✅ Factory deployed!');
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 Mainnet deployment complete!');
  console.log('='.repeat(60));
  console.log(`
Factory address: ${factoryAddress}

Set these in Vercel environment variables:
  VITE_MAINNET_FACTORY_ADDRESS = ${factoryAddress}
  VITE_TON_NETWORK             = mainnet

Set these in Render environment variables:
  FACTORY_ADDRESS = ${factoryAddress}
  TON_NETWORK     = mainnet
`);
}

async function waitForDeployment(client: TonClient, address: any, maxAttempts: number) {
  for (let i = 0; i < maxAttempts; i++) {
    const state = await client.getContractState(address);
    if (state.state === 'active') return;
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error('Deployment timeout — check the explorer for transaction status');
}

deploy().catch(console.error);
