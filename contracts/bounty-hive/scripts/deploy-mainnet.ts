import { TonClient, WalletContractV4, Address, toNano, fromNano } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { BountyFactory } from '../build/BountyFactory/BountyFactory_BountyFactory';

// ─── Mainnet Deployment ──────────────────────────────────────────────────────
//
// Prerequisites:
//   1. Set MNEMONIC env var (24-word seed phrase for your MAINNET wallet)
//   2. Wallet must hold at least 0.3 TON for deploy gas
//   3. Run from contracts/bounty-hive/:
//        MNEMONIC="word1 word2 ..." npx tsx scripts/deploy-mainnet.ts
//
// ⚠️  This uses REAL TON. Double-check everything before running.

// Platform wallet — receives 1% platform fee on all bounties
const PLATFORM_ADDRESS = Address.parse('UQBt5d56LX8GnpYsTl9NVn2h4TNVcKlagsa3HpG2mVZfG5kx');
const PLATFORM_FEE_BPS = 100; // 100 basis points = 1%

async function deploy() {
  const mnemonic = process.env.MNEMONIC;
  if (!mnemonic) {
    console.error('❌ Set MNEMONIC env var with your 24-word seed phrase');
    process.exit(1);
  }

  console.log('🔑 Loading wallet...');
  const key = await mnemonicToPrivateKey(mnemonic.split(' '));

  const client = new TonClient({
    endpoint: 'https://toncenter.com/api/v2/',
    options: {
      apiKey: process.env.TONCENTER_API_KEY,
    },
  });

  const wallet = client.open(
    WalletContractV4.create({ workchain: 0, publicKey: key.publicKey })
  );

  const walletAddress = wallet.address.toString({ bounceable: true });
  console.log(`💰 Wallet: ${walletAddress}`);

  const balance = await wallet.getBalance();
  console.log(`   Balance: ${fromNano(balance)} TON`);

  if (balance < toNano('0.3')) {
    console.error('❌ Wallet balance too low (need at least 0.3 TON for gas)');
    process.exit(1);
  }

  // ─── Deploy BountyFactory ────────────────────────────────────────────────

  console.log('\n📦 Deploying BountyFactory to mainnet...');
  console.log(`   Platform address: ${PLATFORM_ADDRESS.toString()}`);
  console.log(`   Platform fee: ${PLATFORM_FEE_BPS / 100}%`);
  console.log('   ⚠️  This will spend real TON. Ctrl+C to abort. Waiting 5 seconds...');
  await new Promise((r) => setTimeout(r, 5000));

  const factory = client.open(
    BountyFactory.fromInit(PLATFORM_FEE_BPS, PLATFORM_ADDRESS)
  );

  const factoryAddress = factory.address.toString({ bounceable: true });
  console.log(`   Factory address: ${factoryAddress}`);

  const factoryState = await client.getContractState(factory.address);
  if (factoryState.state === 'active') {
    console.log('   ✅ Factory already deployed at this address');
  } else {
    // Deploy via wallet
    const seqno = await wallet.getSeqno();
    await wallet.send(key.secretKey, {
      to: factory.address,
      value: toNano('0.25'),
      body: 'deploy',
      sendMode: 3,
    });

    console.log('   ⏳ Waiting for confirmation (up to 60s)...');
    // Wait for seqno to change
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const newSeqno = await wallet.getSeqno();
      if (newSeqno > seqno) {
        console.log('   ✅ Transaction confirmed!');
        break;
      }
      if (i === 59) {
        console.log('   ⚠️  Timeout waiting for confirmation. Check explorer:');
      }
    }

    // Verify deployment
    const newState = await client.getContractState(factory.address);
    if (newState.state === 'active') {
      console.log('   ✅ Factory deployed and active!');
    } else {
      console.log('   ⚠️  Factory state:', newState.state);
      console.log('   Check https://tonscan.org/address/' + factoryAddress);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 Mainnet deployment complete!');
  console.log('='.repeat(60));
  console.log(`
Factory address: ${factoryAddress}
Platform address: ${PLATFORM_ADDRESS.toString()}
Platform fee: ${PLATFORM_FEE_BPS / 100}%

Set these in Vercel environment variables:
  VITE_FACTORY_ADDRESS = ${factoryAddress}
  VITE_TON_NETWORK    = mainnet

Set these in Render environment variables:
  FACTORY_ADDRESS = ${factoryAddress}
  TON_NETWORK     = mainnet
`);
}

deploy().catch(console.error);