import { TonClient, WalletContractV4, internal } from '@ton-community/sdk';
import { mnemonicToPrivateKey } from 'ton-crypto';
import { BountyFactory } from '../wrappers/BountyFactory';
import { toNano } from 'ton-core';

// ─── Testnet Deployment ──────────────────────────────────────────────────────
//
// Prerequisites:
//   1. Set MNEMONIC env var (24-word seed phrase)
//   2. Fund the wallet on testnet via @testgiver_ton_bot
//   3. Run: npm run deploy:testnet
//
// ⚠️ This is testnet only. Funds have no real value.

async function deploy() {
    const mnemonic = process.env.MNEMONIC;
    if (!mnemonic) throw new Error('Set MNEMONIC env var');

    const key = await mnemonicToPrivateKey(mnemonic.split(' '));
    const client = new TonClient({
        endpoint: 'https://testnet.toncenter.com/api/v2/',
    });

    const wallet = client.open(WalletContractV4.create({
        workchain: 0,
        publicKey: key.publicKey,
    }));

    const balance = await wallet.getBalance();
    console.log(`Wallet balance: ${fromNano(balance)} TON`);

    // Deploy BountyFactory with 1% platform fee
    const factory = client.open(
        BountyFactory.fromInit(100, wallet.address) // 100 bps = 1%
    );

    console.log(`Factory address: ${factory.address.toString()}`);

    // Send deploy transaction
    await wallet.send(key.secretKey, {
        to: factory.address,
        value: toNano('0.1'), // deployment gas
        body: 'deploy',
        sendMode: 3,
    });

    console.log('✅ BountyFactory deployed to testnet!');
    console.log(`Address: ${factory.address.toString()}`);
    console.log('');
    console.log('⚠️ This is testnet — funds have no real value.');
}

deploy().catch(console.error);

function fromNano(nano: bigint): string {
    return (Number(nano) / 1e9).toFixed(4);
}
